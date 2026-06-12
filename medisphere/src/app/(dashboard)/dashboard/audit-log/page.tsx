'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Shield, Filter, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const auditEntries = [
  { id: 1, timestamp: '2026-06-12 09:15:23', user: 'Dr. Sarah Chen', action: 'CREATE', resource: 'Patient Record', resourceId: 'P-1001', details: 'Created new patient record for Emily Johnson' },
  { id: 2, timestamp: '2026-06-12 09:30:45', user: 'Nurse Amy Chen', action: 'UPDATE', resource: 'Vitals', resourceId: 'P-1001', details: 'Updated vitals for Emily Johnson' },
  { id: 3, timestamp: '2026-06-12 10:00:12', user: 'Dr. James Wilson', action: 'READ', resource: 'Lab Results', resourceId: 'L-0452', details: 'Viewed lab results for Michael Brown' },
  { id: 4, timestamp: '2026-06-12 10:22:08', user: 'Admin Linda', action: 'LOGIN', resource: 'System', resourceId: '-', details: 'User logged in from IP 192.168.1.100' },
  { id: 5, timestamp: '2026-06-12 10:45:33', user: 'Dr. Lisa Park', action: 'CREATE', resource: 'Prescription', resourceId: 'RX-0789', details: 'Prescribed Amoxicillin for Sarah Wilson' },
  { id: 6, timestamp: '2026-06-12 11:05:17', user: 'Dr. Robert Martinez', action: 'DELETE', resource: 'Appointment', resourceId: 'A-1004', details: 'Cancelled appointment for James Davis' },
  { id: 7, timestamp: '2026-06-12 11:30:55', user: 'Nurse Robert Taylor', action: 'UPDATE', resource: 'Medication Admin', resourceId: 'M-0331', details: 'Administered medication to patient P-1003' },
  { id: 8, timestamp: '2026-06-11 14:20:00', user: 'Dr. Maria Garcia', action: 'READ', resource: 'Imaging Report', resourceId: 'IMG-021', details: 'Reviewed MRI results for pediatric patient' },
  { id: 9, timestamp: '2026-06-11 15:10:22', user: 'Admin Linda', action: 'CREATE', resource: 'User Account', resourceId: 'U-055', details: 'Created account for new staff member' },
  { id: 10, timestamp: '2026-06-11 16:00:45', user: 'Dr. David Kim', action: 'UPDATE', resource: 'Patient Record', resourceId: 'P-1007', details: 'Updated contact information for Robert Kim' },
  { id: 11, timestamp: '2026-06-11 08:30:00', user: 'Dr. Jennifer Wang', action: 'LOGIN', resource: 'System', resourceId: '-', details: 'User logged in from IP 192.168.1.105' },
  { id: 12, timestamp: '2026-06-10 13:45:30', user: 'Nurse Emily Davis', action: 'CREATE', resource: 'Incident Report', resourceId: 'IR-003', details: 'Created incident report for slip in Ward B' },
  { id: 13, timestamp: '2026-06-10 10:15:10', user: 'Dr. Sarah Chen', action: 'UPDATE', resource: 'Treatment Plan', resourceId: 'TP-012', details: 'Updated treatment plan for cardiac patient' },
  { id: 14, timestamp: '2026-06-09 09:00:00', user: 'Admin Linda', action: 'DELETE', resource: 'User Account', resourceId: 'U-022', details: 'Deactivated former employee account' },
  { id: 15, timestamp: '2026-06-09 11:20:35', user: 'Nurse John Smith', action: 'READ', resource: 'Patient Record', resourceId: 'P-1004', details: 'Accessed medical history for James Davis' },
];

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-50 text-green-700',
  READ: 'bg-blue-50 text-blue-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-red-50 text-red-700',
  LOGIN: 'bg-gray-50 text-gray-600',
};

const ITEMS_PER_PAGE = 6;

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = auditEntries.filter(e =>
    e.user.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.resource.toLowerCase().includes(search.toLowerCase()) ||
    e.resourceId.toLowerCase().includes(search.toLowerCase()) ||
    e.details.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log Viewer</h1>
        <p className="text-gray-500 mt-1">Searchable compliance audit trail</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit entries..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Audit Entries
            <span className="text-sm font-normal text-gray-400 ml-2">({filtered.length} entries)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Resource</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Resource ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{entry.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{entry.user}</td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', actionColors[entry.action])}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{entry.resource}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono">{entry.resourceId}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{entry.details}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
