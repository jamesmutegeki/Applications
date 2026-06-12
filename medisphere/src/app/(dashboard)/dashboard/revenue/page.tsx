'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const monthlyRevenue = [
  { month: 'Jan', amount: 124500 },
  { month: 'Feb', amount: 118200 },
  { month: 'Mar', amount: 142800 },
  { month: 'Apr', amount: 135600 },
  { month: 'May', amount: 151200 },
  { month: 'Jun', amount: 167400 },
];

const payerMix = [
  { label: 'Insurance', percent: 60, color: 'bg-blue-500' },
  { label: 'Self-pay', percent: 25, color: 'bg-green-500' },
  { label: 'Government', percent: 15, color: 'bg-purple-500' },
];

const arAging = [
  { patient: 'Emily Johnson', amount: 1240.00, daysOverdue: 45, status: 'Overdue' },
  { patient: 'Michael Brown', amount: 880.00, daysOverdue: 30, status: 'Overdue' },
  { patient: 'Sarah Wilson', amount: 520.00, daysOverdue: 60, status: 'Overdue' },
  { patient: 'James Davis', amount: 350.00, daysOverdue: 15, status: 'Pending' },
  { patient: 'Maria Garcia', amount: 675.00, daysOverdue: 90, status: 'Overdue' },
];

const statusColors: Record<string, string> = {
  Overdue: 'bg-red-50 text-red-700',
  Pending: 'bg-amber-50 text-amber-700',
  Paid: 'bg-green-50 text-green-700',
};

const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount));

export default function RevenuePage() {
  const totalMonthly = monthlyRevenue.reduce((s, m) => s + m.amount, 0);
  const quarterly = monthlyRevenue.slice(3).reduce((s, m) => s + m.amount, 0);
  const pending = arAging.filter(a => a.status === 'Pending').reduce((s, a) => s + a.amount, 0);
  const outstanding = arAging.filter(a => a.status === 'Overdue').reduce((s, a) => s + a.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="text-gray-500 mt-1">Financial performance dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">${totalMonthly.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Quarterly Revenue</p>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">${quarterly.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending Payments</p>
              <PieChart className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">${pending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Outstanding AR</p>
              <BarChart3 className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">${outstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Monthly Revenue (Jan - Jun)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3 h-48">
              {monthlyRevenue.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">${(m.amount / 1000).toFixed(0)}k</span>
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${(m.amount / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs font-medium text-gray-600">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payer Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              Payer Mix Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-8 rounded-full overflow-hidden mb-4">
              {payerMix.map(p => (
                <div
                  key={p.label}
                  className={cn(p.color, 'transition-all hover:opacity-80')}
                  style={{ width: `${p.percent}%` }}
                />
              ))}
            </div>
            <div className="space-y-2">
              {payerMix.map(p => (
                <div key={p.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-3 h-3 rounded-full', p.color)} />
                    <span className="text-gray-700">{p.label}</span>
                  </div>
                  <span className="font-medium text-gray-900">{p.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AR Aging Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            Accounts Receivable Aging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Days Overdue</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {arAging.map((item, index) => (
                  <motion.tr
                    key={item.patient}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{item.patient}</td>
                    <td className="py-3 px-4 text-right text-gray-700">${item.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{item.daysOverdue}</td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[item.status])}>
                        {item.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
