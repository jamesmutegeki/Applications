'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, User, Activity, CheckSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatientIntake {
  id: string;
  name: string;
  checkIn: string;
  status: 'Waiting' | 'In Progress' | 'Completed';
}

const initialPatients: PatientIntake[] = [
  { id: 'PT-001', name: 'John Smith', checkIn: '09:15 AM', status: 'Waiting' },
  { id: 'PT-002', name: 'Linda Martinez', checkIn: '09:30 AM', status: 'In Progress' },
  { id: 'PT-003', name: 'Thomas Brown', checkIn: '09:45 AM', status: 'Waiting' },
  { id: 'PT-004', name: 'Patricia Davis', checkIn: '10:00 AM', status: 'Waiting' },
  { id: 'PT-005', name: 'Christopher Lee', checkIn: '10:15 AM', status: 'Completed' },
];

const allergyOptions = ['Penicillin', 'Sulfa', 'Aspirin', 'Ibuprofen', 'Latex', 'Iodine', 'Peanuts', 'Shellfish'];

const statusColors: Record<string, string> = {
  'Waiting': 'bg-amber-50 text-amber-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Completed': 'bg-green-50 text-green-700',
};

export default function IntakePage() {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<PatientIntake | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectPatient = (patient: PatientIntake) => {
    if (patient.status === 'Completed') return;
    setSelectedPatient(patient);
    setChiefComplaint('');
    setBp('120/80');
    setHr('72');
    setTemp('98.6');
    setAllergies([]);
    setConsent(false);
    setSubmitted(false);
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSubmit = () => {
    if (!chiefComplaint.trim() || !consent) return;
    setSubmitted(true);
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient?.id ? { ...p, status: 'Completed' as const } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Intake Forms</h1>
        <p className="text-gray-500 mt-1">Digital check-in forms for arriving patients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Arriving Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectPatient(patient)}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer',
                    selectedPatient?.id === patient.id
                      ? 'border-primary-300 bg-primary-50/50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                    patient.status === 'Completed' && 'opacity-60 cursor-default'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-400">Checked in at {patient.checkIn}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[patient.status])}>
                    {patient.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {selectedPatient && !submitted ? (
            <motion.div
              key={selectedPatient.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Intake Form &mdash; {selectedPatient.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
                    <textarea
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="Describe the patient's primary concern..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vital Signs</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">BP (mmHg)</label>
                        <input
                          type="text"
                          value={bp}
                          onChange={(e) => setBp(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">HR (bpm)</label>
                        <input
                          type="text"
                          value={hr}
                          onChange={(e) => setHr(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Temp (°F)</label>
                        <input
                          type="text"
                          value={temp}
                          onChange={(e) => setTemp(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      {allergyOptions.map((allergy) => (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => toggleAllergy(allergy)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                            allergies.includes(allergy)
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          )}
                        >
                          {allergy}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Patient consent obtained for treatment</span>
                  </label>

                  <Button onClick={handleSubmit} disabled={!chiefComplaint.trim() || !consent} className="w-full">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Submit Intake Form
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : submitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Intake Completed</h2>
                  <p className="text-sm text-gray-500 mb-4">Intake form for {selectedPatient?.name} has been submitted.</p>
                  <Button variant="outline" onClick={() => { setSelectedPatient(null); setSubmitted(false); }}>
                    Back to List
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full min-h-[400px]"
            >
              <div className="text-center text-gray-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a patient to begin intake</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
