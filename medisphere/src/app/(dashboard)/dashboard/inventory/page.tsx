'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Package, AlertTriangle, Warehouse, Tags } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const inventoryItems = [
  { id: 1, name: 'Surgical Gloves (Box)', category: 'Consumables', quantity: 240, unit: 'Boxes', reorderLevel: 50, supplier: 'MedSupply Co.', status: 'In Stock' },
  { id: 2, name: 'Syringes 5ml', category: 'Consumables', quantity: 30, unit: 'Boxes', reorderLevel: 100, supplier: 'HealthDirect', status: 'Low Stock' },
  { id: 3, name: 'ECG Electrodes', category: 'Consumables', quantity: 500, unit: 'Packs', reorderLevel: 200, supplier: 'CardioTech', status: 'In Stock' },
  { id: 4, name: 'Stethoscope', category: 'Instruments', quantity: 15, unit: 'Units', reorderLevel: 5, supplier: 'DiagnosticPro', status: 'In Stock' },
  { id: 5, name: 'Blood Pressure Cuff', category: 'Instruments', quantity: 3, unit: 'Units', reorderLevel: 10, supplier: 'DiagnosticPro', status: 'Low Stock' },
  { id: 6, name: 'Amoxicillin 500mg', category: 'Medications', quantity: 12, unit: 'Bottles', reorderLevel: 20, supplier: 'PharmaCare', status: 'Low Stock' },
  { id: 7, name: 'Ibuprofen 200mg', category: 'Medications', quantity: 45, unit: 'Bottles', reorderLevel: 15, supplier: 'PharmaCare', status: 'In Stock' },
  { id: 8, name: 'N95 Respirator Masks', category: 'PPE', quantity: 8, unit: 'Boxes', reorderLevel: 25, supplier: 'SafetyFirst', status: 'Low Stock' },
  { id: 9, name: 'Surgical Masks', category: 'PPE', quantity: 200, unit: 'Boxes', reorderLevel: 50, supplier: 'SafetyFirst', status: 'In Stock' },
  { id: 10, name: 'Scalpel Blades #10', category: 'Instruments', quantity: 80, unit: 'Packs', reorderLevel: 30, supplier: 'SurgiKit', status: 'In Stock' },
  { id: 11, name: 'IV Tubing Set', category: 'Consumables', quantity: 18, unit: 'Boxes', reorderLevel: 40, supplier: 'HealthDirect', status: 'Low Stock' },
  { id: 12, name: 'Hand Sanitizer 1L', category: 'PPE', quantity: 35, unit: 'Bottles', reorderLevel: 10, supplier: 'SafetyFirst', status: 'In Stock' },
];

const categories = ['All', 'Consumables', 'Instruments', 'Medications', 'PPE'];

const statusColors: Record<string, string> = {
  'In Stock': 'bg-green-50 text-green-700',
  'Low Stock': 'bg-red-50 text-red-700',
  'Out of Stock': 'bg-gray-50 text-gray-600',
};

export default function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? inventoryItems
    : inventoryItems.filter(i => i.category === activeCategory);

  const totalItems = inventoryItems.length;
  const lowStock = inventoryItems.filter(i => i.status === 'Low Stock').length;
  const categoryCount = new Set(inventoryItems.map(i => i.category)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory & Supplies</h1>
        <p className="text-gray-500 mt-1">Track medical supplies and consumables</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Items</p>
              <Package className="w-5 h-5 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Categories</p>
              <Tags className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{categoryCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-primary-600" />
            Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Item Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Quantity</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Unit</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Reorder Level</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'border-b border-gray-50 transition-colors',
                      item.status === 'Low Stock' ? 'bg-red-50/30' : 'hover:bg-gray-50'
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-gray-700">{item.category}</td>
                    <td className={cn(
                      'py-3 px-4 text-right font-medium',
                      item.status === 'Low Stock' ? 'text-red-600' : 'text-gray-700'
                    )}>
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{item.unit}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{item.reorderLevel}</td>
                    <td className="py-3 px-4 text-gray-600">{item.supplier}</td>
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
