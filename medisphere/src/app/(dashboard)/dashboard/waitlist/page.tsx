'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const departments = ['Emergency', 'General', 'Pediatrics'];

interface QueueItem {
  id: string;
  name: string;
  checkIn: string;
  estimatedWait: string;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
}

const queueData: Record<string, QueueItem[]> = {
  Emergency: [
    { id: 'Q-001', name: 'James Miller', checkIn: '10:15 AM', estimatedWait: '15 min', priority: 'Critical' },
    { id: 'Q-002', name: 'Sarah Connor', checkIn: '10:30 AM', estimatedWait: '25 min', priority: 'High' },
    { id: 'Q-003', name: 'Robert Adams', checkIn: '10:45 AM', estimatedWait: '40 min', priority: 'Normal' },
    { id: 'Q-004', name: 'Emily Watson', checkIn: '11:00 AM', estimatedWait: '50 min', priority: 'Normal' },
    { id: 'Q-005', name: 'Michael Torres', checkIn: '11:15 AM', estimatedWait: '60 min', priority: 'Low' },
  ],
  General: [
    { id: 'Q-006', name: 'Linda Park', checkIn: '09:00 AM', estimatedWait: '20 min', priority: 'Normal' },
    { id: 'Q-007', name: 'David Kim', checkIn: '09:30 AM', estimatedWait: '30 min', priority: 'Normal' },
    { id: 'Q-008', name: 'Anna Wright', checkIn: '10:00 AM', estimatedWait: '45 min', priority: 'Low' },
    { id: 'Q-009', name: 'Peter Johnson', checkIn: '10:20 AM', estimatedWait: '35 min', priority: 'Normal' },
  ],
  Pediatrics: [
    { id: 'Q-010', name: 'Sophia Brown', checkIn: '10:00 AM', estimatedWait: '20 min', priority: 'High' },
    { id: 'Q-011', name: 'Ethan Garcia', checkIn: '10:30 AM', estimatedWait: '30 min', priority: 'Normal' },
    { id: 'Q-012', name: 'Olivia Martinez', checkIn: '11:00 AM', estimatedWait: '40 min', priority: 'Normal' },
  ],
};

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700',
  High: 'bg-orange-50 text-orange-700',
  Normal: 'bg-blue-50 text-blue-700',
  Low: 'bg-gray-50 text-gray-600',
};

export default function WaitlistPage() {
  const [activeDept, setActiveDept] = useState('Emergency');
  const queue = queueData[activeDept] || [];
  const totalWaiting = queue.length;
  const avgWait = queue.length > 0
    ? Math.round(queue.reduce((sum, q) => sum + parseInt(q.estimatedWait), 0) / queue.length)
    : 0;
  const longestWait = queue.length > 0
    ? Math.max(...queue.map((q) => parseInt(q.estimatedWait)))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waitlist & Queue Management</h1>
        <p className="text-gray-500 mt-1">Live queue board for ER and walk-in clinics</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Waiting', value: totalWaiting, icon: Users },
          { label: 'Avg Wait Time', value: avgWait + ' min', icon: Clock },
          { label: 'Longest Wait', value: longestWait + ' min', icon: ArrowUpDown },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeDept === dept
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Check-in Time</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Estimated Wait</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-gray-500">{item.checkIn}</td>
                    <td className="py-3 px-4 text-gray-700">{item.estimatedWait}</td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', priorityColors[item.priority])}>
                        {item.priority}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {queue.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No patients in queue</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
