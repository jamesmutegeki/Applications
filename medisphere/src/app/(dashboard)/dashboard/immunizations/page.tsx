'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Syringe, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const patients = [
  { id: 'P-1024', name: 'Emily Johnson' },
  { id: 'P-1025', name: 'Michael Brown' },
  { id: 'P-1026', name: 'Sarah Wilson' },
  { id: 'P-1027', name: 'James Davis' },
  { id: 'P-1028', name: 'Maria Garcia' },
];

const immunizationRecords: Record<string, {
  id: string;
  vaccine: string;
  dose: string;
  date: string;
  nextDose: string;
  administeredBy: string;
}[]> = {
  'P-1024': [
    { id: 'I-001', vaccine: 'Influenza', dose: 'Annual', date: '2025-10-15', nextDose: '2026-10-15', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-002', vaccine: 'COVID-19', dose: 'Booster', date: '2025-09-01', nextDose: '2026-09-01', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-003', vaccine: 'Tdap', dose: '1', date: '2024-06-10', nextDose: '2034-06-10', administeredBy: 'Dr. Michael Lee' },
  ],
  'P-1025': [
    { id: 'I-004', vaccine: 'Hepatitis B', dose: '3', date: '2025-12-20', nextDose: 'Completed', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-005', vaccine: 'Influenza', dose: 'Annual', date: '2025-11-05', nextDose: '2026-11-05', administeredBy: 'Nurse Amy Park' },
  ],
  'P-1026': [
    { id: 'I-006', vaccine: 'MMR', dose: '2', date: '2024-08-14', nextDose: 'Completed', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-007', vaccine: 'Varicella', dose: '2', date: '2024-08-14', nextDose: 'Completed', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-008', vaccine: 'HPV', dose: '1', date: '2026-01-10', nextDose: '2026-07-10', administeredBy: 'Dr. Sarah Chen' },
  ],
  'P-1027': [
    { id: 'I-009', vaccine: 'Pneumococcal', dose: '1', date: '2025-06-30', nextDose: '2026-06-30', administeredBy: 'Dr. James Wilson' },
  ],
  'P-1028': [
    { id: 'I-010', vaccine: 'DTaP', dose: '4', date: '2026-03-22', nextDose: '2027-03-22', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-011', vaccine: 'IPV', dose: '3', date: '2026-03-22', nextDose: 'Completed', administeredBy: 'Dr. Sarah Chen' },
    { id: 'I-012', vaccine: 'Hib', dose: '4', date: '2026-03-22', nextDose: 'Completed', administeredBy: 'Dr. Sarah Chen' },
  ],
};

export default function ImmunizationsPage() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0].id);
  const records = immunizationRecords[selectedPatient] || [];
  const completedCount = records.filter((r) => r.nextDose === 'Completed').length;
  const upcomingCount = records.filter((r) => r.nextDose !== 'Completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Immunization Records</h1>
        <p className="text-gray-500 mt-1">Vaccination history and scheduled doses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Immunization History</CardTitle>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Vaccine</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Dose #</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Date Administered</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Next Dose</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Administered By</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">{record.vaccine}</td>
                        <td className="py-3 px-4 text-gray-700">{record.dose}</td>
                        <td className="py-3 px-4 text-gray-500">{record.date}</td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            'text-xs font-medium',
                            record.nextDose === 'Completed' ? 'text-green-600' : 'text-amber-600'
                          )}>
                            {record.nextDose}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{record.administeredBy}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {records.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Syringe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No immunization records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">{completedCount} Completed</p>
                    <p className="text-xs text-green-600">Vaccines fully administered</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">{upcomingCount} Upcoming</p>
                    <p className="text-xs text-amber-600">Doses due or scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
