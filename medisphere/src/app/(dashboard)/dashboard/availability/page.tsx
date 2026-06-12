'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const doctors = [
  { id: 'D-001', name: 'Dr. Sarah Chen' },
  { id: 'D-002', name: 'Dr. Michael Lee' },
  { id: 'D-003', name: 'Dr. James Wilson' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 9 }, (_, i) => `${i + 8}:00`);

const initialSlots: Record<string, Record<string, 'available' | 'booked' | 'unavailable'>> = {
  'Monday': { '8:00': 'available', '9:00': 'available', '10:00': 'booked', '11:00': 'available', '12:00': 'unavailable', '13:00': 'available', '14:00': 'booked', '15:00': 'available', '16:00': 'available' },
  'Tuesday': { '8:00': 'available', '9:00': 'booked', '10:00': 'available', '11:00': 'available', '12:00': 'available', '13:00': 'unavailable', '14:00': 'available', '15:00': 'booked', '16:00': 'available' },
  'Wednesday': { '8:00': 'unavailable', '9:00': 'available', '10:00': 'available', '11:00': 'booked', '12:00': 'available', '13:00': 'available', '14:00': 'available', '15:00': 'available', '16:00': 'booked' },
  'Thursday': { '8:00': 'available', '9:00': 'available', '10:00': 'available', '11:00': 'available', '12:00': 'booked', '13:00': 'available', '14:00': 'booked', '15:00': 'available', '16:00': 'unavailable' },
  'Friday': { '8:00': 'booked', '9:00': 'available', '10:00': 'available', '11:00': 'unavailable', '12:00': 'available', '13:00': 'available', '14:00': 'available', '15:00': 'booked', '16:00': 'available' },
};

const slotColors: Record<string, string> = {
  available: 'bg-green-100 hover:bg-green-200 text-green-700',
  booked: 'bg-red-100 text-red-500 cursor-not-allowed',
  unavailable: 'bg-gray-100 text-gray-400 cursor-not-allowed',
};

const slotLabels: Record<string, string> = {
  available: 'Available',
  booked: 'Booked',
  unavailable: 'Unavailable',
};

export default function AvailabilityPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0].id);
  const [slots, setSlots] = useState(initialSlots);

  const toggleSlot = (day: string, hour: string) => {
    setSlots((prev) => {
      const current = prev[day][hour];
      if (current === 'booked') return prev;
      const next = current === 'available' ? 'unavailable' : 'available';
      return {
        ...prev,
        [day]: { ...prev[day], [hour]: next },
      };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Availability</h1>
        <p className="text-gray-500 mt-1">Manage consultation schedules</p>
      </div>

      <div className="flex items-center gap-4">
        <User className="w-5 h-5 text-gray-400" />
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <CardTitle>Weekly Schedule</CardTitle>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {(['available', 'booked', 'unavailable'] as const).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded', slotColors[type].split(' ')[0])} />
                <span className="text-xs text-gray-500">{slotLabels[type]}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="py-2 pr-4 text-left text-gray-500 font-medium w-16">Time</th>
                  {days.map((day) => (
                    <th key={day} className="py-2 px-2 text-center text-gray-500 font-medium min-w-[100px]">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour} className="border-t border-gray-50">
                    <td className="py-2 pr-4 text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {hour}
                    </td>
                    {days.map((day) => {
                      const status = slots[day][hour];
                      return (
                        <td key={day} className="py-1 px-2">
                          <button
                            onClick={() => toggleSlot(day, hour)}
                            disabled={status === 'booked'}
                            className={cn(
                              'w-full py-2 px-1 rounded-lg text-xs font-medium transition-all',
                              slotColors[status]
                            )}
                          >
                            {slotLabels[status]}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
