'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, Activity, Heart, Brain, Bone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const bodyAreas = [
  { id: 'head', label: 'Head', icon: Brain },
  { id: 'chest', label: 'Chest', icon: Heart },
  { id: 'abdomen', label: 'Abdomen', icon: Activity },
  { id: 'joints', label: 'Joints', icon: Bone },
  { id: 'skin', label: 'Skin', icon: AlertTriangle },
  { id: 'throat', label: 'Throat', icon: Search },
];

const symptomsByArea: Record<string, string[]> = {
  head: ['Headache', 'Dizziness', 'Blurred Vision', 'Migraine', 'Sinus Pressure', 'Ear Pain'],
  chest: ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Cough', 'Wheezing', 'Congestion'],
  abdomen: ['Abdominal Pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Bloating', 'Heartburn'],
  joints: ['Joint Pain', 'Swelling', 'Stiffness', 'Redness', 'Limited Movement', 'Warmth'],
  skin: ['Rash', 'Itching', 'Redness', 'Swelling', 'Bruising', 'Lesion'],
  throat: ['Sore Throat', 'Difficulty Swallowing', 'Hoarseness', 'Swollen Glands', 'Tonsil Pain', 'Dry Throat'],
};

const severityLevels = ['Mild', 'Moderate', 'Severe'] as const;
const durationOptions = ['1-2 days', '3-5 days', '1-2 weeks', '2+ weeks'] as const;

interface TriageResult {
  recommendation: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  advice: string;
}

const getTriageResult = (severity: string, duration: string): TriageResult => {
  if (severity === 'Severe') {
    return {
      recommendation: 'Seek immediate medical attention',
      urgency: 'Emergency',
      advice: 'Please visit the nearest emergency room or call emergency services. Do not wait for an appointment.',
    };
  }
  if (severity === 'Moderate' && (duration === '2+ weeks' || duration === '1-2 weeks')) {
    return {
      recommendation: 'Schedule an appointment within 24-48 hours',
      urgency: 'Medium',
      advice: 'Your symptoms persist for an extended period. Please schedule an appointment with your primary care physician.',
    };
  }
  if (severity === 'Moderate') {
    return {
      recommendation: 'Monitor symptoms and schedule an appointment',
      urgency: 'Medium',
      advice: 'Monitor your symptoms and schedule an appointment within the next few days if they do not improve.',
    };
  }
  return {
    recommendation: 'Self-care and monitoring',
    urgency: 'Low',
    advice: 'Your symptoms appear mild. Rest, hydrate, and monitor your condition. Consult a doctor if symptoms worsen.',
  };
};

const urgencyColors: Record<string, string> = {
  Low: 'bg-green-50 text-green-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-orange-50 text-orange-700',
  Emergency: 'bg-red-50 text-red-700',
};

export default function SymptomCheckerPage() {
  const [step, setStep] = useState(1);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleCheckSymptoms = () => {
    if (!severity || !duration) return;
    setResult(getTriageResult(severity, duration));
  };

  const handleReset = () => {
    setStep(1);
    setSelectedArea(null);
    setSelectedSymptoms([]);
    setSeverity(null);
    setDuration(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Symptom Checker</h1>
        <p className="text-gray-500 mt-1">Interactive triage assessment tool</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
              )}>
                {s}
              </div>
              {s < 4 && (
                <div className={cn('w-12 sm:w-20 h-1 mx-1 rounded transition-colors', step > s ? 'bg-primary-600' : 'bg-gray-100')} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-6">
                  {step === 1 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select the affected body area</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {bodyAreas.map((area) => {
                          const Icon = area.icon;
                          return (
                            <button
                              key={area.id}
                              onClick={() => { setSelectedArea(area.id); setStep(2); }}
                              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                            >
                              <Icon className="w-8 h-8 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">{area.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 2 && selectedArea && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline">&larr; Back</button>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select your symptoms</h2>
                      <div className="flex flex-wrap gap-2">
                        {symptomsByArea[selectedArea]?.map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={cn(
                              'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                              selectedSymptoms.includes(symptom)
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                            )}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                      <div className="mt-6">
                        <Button onClick={() => setStep(3)} disabled={selectedSymptoms.length === 0}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(2)} className="text-sm text-primary-600 hover:underline">&larr; Back</button>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">How severe are your symptoms?</h2>
                      <div className="space-y-3">
                        {severityLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() => setSeverity(level)}
                            className={cn(
                              'w-full p-4 rounded-xl border text-left transition-all',
                              severity === level
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                            )}
                          >
                            <span className="font-medium">{level}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-6">
                        <Button onClick={() => setStep(4)} disabled={!severity}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(3)} className="text-sm text-primary-600 hover:underline">&larr; Back</button>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">How long have you had these symptoms?</h2>
                      <div className="space-y-3">
                        {durationOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setDuration(opt)}
                            className={cn(
                              'w-full p-4 rounded-xl border text-left transition-all',
                              duration === opt
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                            )}
                          >
                            <span className="font-medium">{opt}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-6">
                        <Button onClick={handleCheckSymptoms} disabled={!duration}>
                          <Search className="w-4 h-4 mr-2" />
                          Check Symptoms
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                    result.urgency === 'Emergency' ? 'bg-red-100' :
                    result.urgency === 'Medium' ? 'bg-amber-100' : 'bg-green-100'
                  )}>
                    <Activity className={cn(
                      'w-8 h-8',
                      result.urgency === 'Emergency' ? 'text-red-600' :
                      result.urgency === 'Medium' ? 'text-amber-600' : 'text-green-600'
                    )} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{result.recommendation}</h2>
                  <span className={cn('inline-block px-3 py-1 text-sm font-medium rounded-full mb-4', urgencyColors[result.urgency])}>
                    {result.urgency} Urgency
                  </span>
                  <p className="text-gray-600 mb-6">{result.advice}</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleReset}>Start Over</Button>
                    <Button onClick={() => window.location.href = '/dashboard/appointments'}>Book Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
