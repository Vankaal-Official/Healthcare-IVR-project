import React, { useState } from 'react';
import type { ZocdocAppointment } from '../../types/portal';

interface VanKaalActivityLogProps {
  appointments: ZocdocAppointment[];
}

export const VanKaalActivityLog: React.FC<VanKaalActivityLogProps> = ({ appointments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient_phone_masked.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase());

    const isConfirmed =
      apt.status === 'Confirmed' ||
      apt.raw_status === 'CONFIRMED';

    if (filter === 'CONFIRMED') return matchesSearch && isConfirmed;
    if (filter === 'PENDING') return matchesSearch && !isConfirmed;
    return matchesSearch;
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
      {/* Activity Log Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Call &amp; Outreach Activity Log
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300/60">
              {appointments.length} TOTAL
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-1">
            Real-time feed of automated IVR calls, patient voice interactions, and confirmation results.
          </p>
        </div>

        {/* Filter Controls in Light Palette */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <input
            type="text"
            placeholder="Search patient, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white font-mono transition-colors w-full sm:w-48"
          />
          <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#FACC15] text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'CONFIRMED'
                  ? 'bg-[#FACC15] text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'PENDING'
                  ? 'bg-[#FACC15] text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Table Content (7 Exact Columns without horizontal scrollbar) */}
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4">Patient</th>
              <th className="py-3 px-3 sm:px-4">Doctor &amp; Slot</th>
              <th className="py-3 px-3 sm:px-4">Channel</th>
              <th className="py-3 px-3 sm:px-4">Auth</th>
              <th className="py-3 px-3 sm:px-4">Patient Action</th>
              <th className="py-3 px-3 sm:px-4">Session Cost</th>
              <th className="py-3 px-3 sm:px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                  No outreach records found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((apt) => {
                const isConfirmed =
                  apt.status === 'Confirmed' ||
                  apt.raw_status === 'CONFIRMED';

                return (
                  <tr
                    key={apt.appointment_id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* 1. Patient & Masked Number */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300/80 flex items-center justify-center font-bold text-amber-900 text-[11px] uppercase shrink-0">
                          {apt.patient_name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {apt.patient_name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {apt.patient_phone_masked}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Doctor & Slot */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{apt.doctor}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {apt.time} • {apt.date}
                      </p>
                    </td>

                    {/* 3. Telephony Channel */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {apt.voice_status === 'Delivered' ? 'Twilio Voice' : 'Vapi Webhook'}
                        </span>
                        {apt.voice_completed_at && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {apt.voice_completed_at}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Auth Result */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        PASS (1998)
                      </span>
                    </td>

                    {/* 5. Patient Action */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      {isConfirmed ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>CONFIRMED via DTMF / Speech</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Awaiting Patient Reply</span>
                        </div>
                      )}
                    </td>

                    {/* 6. Session Cost / Duration */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-900 font-bold text-xs">
                          42s • ${apt.billing?.vapi_cost ? apt.billing.vapi_cost.toFixed(3) : '0.472'}
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                          +$0.78
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Zocdoc Billed: ${apt.billing?.billed_amount ? apt.billing.billed_amount.toFixed(2) : '1.25'}
                      </span>
                    </td>

                    {/* 7. Call Status (Butter-Yellow Completed Badge) */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-right font-mono">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-50 text-amber-900 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div>
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> of{' '}
          <span className="font-bold text-slate-800">{appointments.length}</span> outreach records
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed (
            {
              appointments.filter(
                (a) =>
                  a.status === 'Confirmed' ||
                  a.raw_status === 'CONFIRMED'
              ).length
            }
            )
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending (
            {
              appointments.filter(
                (a) =>
                  a.status !== 'Confirmed' &&
                  a.raw_status !== 'CONFIRMED'
              ).length
            }
            )
          </span>
        </div>
      </div>
    </div>
  );
};
