'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowRightLeft, User, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const referrals = [
  { id: 'R-1001', patient: 'Emily Johnson', referringDoctor: 'Dr. Sarah Chen', referredTo: 'Cardiology', priority: 'Urgent', reason: 'Chest pain with abnormal ECG', status: 'Pending', date: '2026-06-10' },
  { id: 'R-1002', patient: 'Michael Brown', referringDoctor: 'Dr. James Wilson', referredTo: 'Orthopedics', priority: 'Normal', reason: 'Knee pain assessment', status: 'Accepted', date: '2026-06-09' },
  { id: 'R-1003', patient: 'Sarah Wilson', referringDoctor: 'Dr. Lisa Park', referredTo: 'Neurology', priority: 'Emergency', reason: 'Suspected stroke symptoms', status: 'Pending', date: '2026-06-08' },
  { id: 'R-1004', patient: 'James Davis', referringDoctor: 'Dr. Robert Martinez', referredTo: 'Dermatology', priority: 'Normal', reason: 'Rash investigation', status: 'Declined', date: '2026-06-07' },
  { id: 'R-1005', patient: 'Maria Garcia', referringDoctor: 'Dr. Sarah Chen', referredTo: 'Pediatrics', priority: 'Normal', reason: 'Growth milestone check', status: 'Accepted', date: '2026-06-06' },
  { id: 'R-1006', patient: 'Robert Kim', referringDoctor: 'Dr. David Kim', referredTo: 'Ophthalmology', priority: 'Urgent', reason: 'Vision loss concern', status: 'Pending', date: '2026-06-05' },
  { id: 'R-1007', patient: 'Linda Foster', referringDoctor: 'Dr. Jennifer Wang', referredTo: 'Endocrinology', priority: 'Normal', reason: 'Thyroid function review', status: 'Pending', date: '2026-06-04' },
  { id: 'R-1008', patient: 'Thomas Anderson', referringDoctor: 'Dr. Maria Garcia', referredTo: 'Gastroenterology', priority: 'Emergency', reason: 'Acute abdominal pain', status: 'Accepted', date: '2026-06-03' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Accepted: 'bg-green-50 text-green-700',
  Declined: 'bg-red-50 text-red-700',
};

const priorityColors: Record<string, string> = {
  Normal: 'bg-blue-50 text-blue-700',
  Urgent: 'bg-amber-50 text-amber-700',
  Emergency: 'bg-red-50 text-red-700',
};

const tabs = ['All', 'Pending', 'Accepted', 'Declined'];

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? referrals : referrals.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-500 mt-1">Track patient referrals across departments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Referral Cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((ref, index) => (
          <motion.div
            key={ref.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-semibold text-sm">
                      {ref.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ref.patient}</p>
                      <p className="text-xs text-gray-500">{ref.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', priorityColors[ref.priority])}>
                      {ref.priority}
                    </span>
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[ref.status])}>
                      {ref.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Referring:</span> {ref.referringDoctor}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Referred To:</span> {ref.referredTo}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <ArrowRightLeft className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{ref.reason}</span>
                  </div>
                </div>

                {ref.status === 'Pending' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept</Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">Decline</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
