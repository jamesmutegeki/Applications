'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Search, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const testCategories = [
  { name: 'Blood Work', count: 156, icon: Activity, color: 'from-red-500 to-rose-500' },
  { name: 'Urinalysis', count: 89, icon: FlaskConical, color: 'from-amber-500 to-yellow-500' },
  { name: 'Microbiology', count: 45, icon: Activity, color: 'from-emerald-500 to-teal-500' },
  { name: 'Chemistry', count: 112, icon: FlaskConical, color: 'from-blue-500 to-cyan-500' },
];

const labResults = [
  { id: 'LR-001', patient: 'Emily Johnson', test: 'Complete Blood Count', category: 'Blood Work', result: '5.2', range: '4.5-11.0 x10^3/uL', status: 'NORMAL', date: '2026-06-10' },
  { id: 'LR-002', patient: 'Michael Brown', test: 'Lipid Panel', category: 'Chemistry', result: '240', range: '<200 mg/dL', status: 'ABNORMAL', date: '2026-06-09' },
  { id: 'LR-003', patient: 'Sarah Wilson', test: 'Urinalysis', category: 'Urinalysis', result: 'Negative', range: 'Negative', status: 'NORMAL', date: '2026-06-08' },
  { id: 'LR-004', patient: 'James Davis', test: 'Blood Culture', category: 'Microbiology', result: 'Pending', range: 'No growth', status: 'PENDING', date: '2026-06-07' },
  { id: 'LR-005', patient: 'Maria Garcia', test: 'Basic Metabolic Panel', category: 'Chemistry', result: '98', range: '70-110 mg/dL', status: 'NORMAL', date: '2026-06-06' },
  { id: 'LR-006', patient: 'Robert Kim', test: 'C-Reactive Protein', category: 'Blood Work', result: '12.5', range: '<3.0 mg/L', status: 'ABNORMAL', date: '2026-06-05' },
  { id: 'LR-007', patient: 'Amanda Lee', test: 'INR/PT', category: 'Blood Work', result: '2.1', range: '0.8-1.2', status: 'ABNORMAL', date: '2026-06-04' },
  { id: 'LR-008', patient: 'David Miller', test: 'Urine Culture', category: 'Microbiology', result: 'Pending', range: 'No growth', status: 'PENDING', date: '2026-06-03' },
];

const statusColors: Record<string, string> = {
  NORMAL: 'bg-green-50 text-green-700',
  ABNORMAL: 'bg-red-50 text-red-700',
  PENDING: 'bg-amber-50 text-amber-700',
};

export default function LaboratoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResults = labResults.filter((r) =>
    r.patient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
        <p className="text-gray-500 mt-1">View and manage patient laboratory tests</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {testCategories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br mx-auto mb-2 flex items-center justify-center', cat.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{cat.count}</p>
                  <p className="text-xs text-gray-500 mt-1">{cat.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Lab Results</CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Test Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Result</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Normal Range</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{result.patient}</td>
                    <td className="py-3 px-4 text-gray-700">{result.test}</td>
                    <td className="py-3 px-4 text-gray-500">{result.category}</td>
                    <td className="py-3 px-4 text-gray-700">{result.result}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{result.range}</td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[result.status])}>
                        {result.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{result.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredResults.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No lab results found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
