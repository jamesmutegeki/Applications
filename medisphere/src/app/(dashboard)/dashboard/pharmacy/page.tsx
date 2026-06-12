'use client';

import { motion } from 'framer-motion';
import { Pill, AlertTriangle, Package, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const summaryCards = [
  { label: 'Total Medications', value: '1,247', icon: Pill, color: 'from-blue-500 to-cyan-500' },
  { label: 'Low Stock Items', value: '18', icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
  { label: 'Dispensed Today', value: '64', icon: Package, color: 'from-emerald-500 to-teal-500' },
  { label: 'Expiring Soon', value: '9', icon: Clock, color: 'from-red-500 to-rose-500' },
];

const pharmacyItems = [
  { id: 'MED-001', medication: 'Lisinopril 10mg', category: 'Cardiovascular', stock: 450, unit: 'tablets', reorder: 100, expiry: '2027-03-15', lowStock: false },
  { id: 'MED-002', medication: 'Atorvastatin 20mg', category: 'Cardiovascular', stock: 320, unit: 'tablets', reorder: 100, expiry: '2027-01-20', lowStock: false },
  { id: 'MED-003', medication: 'Metformin 500mg', category: 'Endocrine', stock: 85, unit: 'tablets', reorder: 100, expiry: '2026-12-10', lowStock: true },
  { id: 'MED-004', medication: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 200, unit: 'capsules', reorder: 75, expiry: '2026-09-05', lowStock: false },
  { id: 'MED-005', medication: 'Albuterol Inhaler', category: 'Respiratory', stock: 25, unit: 'inhalers', reorder: 30, expiry: '2026-08-22', lowStock: true },
  { id: 'MED-006', medication: 'Ibuprofen 400mg', category: 'Analgesic', stock: 500, unit: 'tablets', reorder: 150, expiry: '2028-01-01', lowStock: false },
  { id: 'MED-007', medication: 'Insulin Glargine', category: 'Endocrine', stock: 40, unit: 'vials', reorder: 50, expiry: '2026-07-15', lowStock: true },
  { id: 'MED-008', medication: 'Omeprazole 20mg', category: 'Gastrointestinal', stock: 180, unit: 'capsules', reorder: 80, expiry: '2027-06-30', lowStock: false },
];

export default function PharmacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Dispensing</h1>
        <p className="text-gray-500 mt-1">Medication inventory and dispensing management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', card.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medication Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Medication</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Unit</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Reorder Level</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Expiry</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'border-b border-gray-50 transition-colors',
                      item.lowStock && 'bg-amber-50/50'
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{item.medication}</td>
                    <td className="py-3 px-4 text-gray-500">{item.category}</td>
                    <td className={cn('py-3 px-4', item.lowStock ? 'text-amber-700 font-semibold' : 'text-gray-700')}>
                      {item.stock}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{item.unit}</td>
                    <td className="py-3 px-4 text-gray-500">{item.reorder}</td>
                    <td className="py-3 px-4 text-gray-500">{item.expiry}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Restock</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
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
