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
      apt.raw_status === 'RESCHEDULED' ||
      apt.raw_status === 'CONFIRMED';

    if (filter === 'CONFIRMED') return matchesSearch && isConfirmed;
    if (filter === 'PENDING') return matchesSearch && !isConfirmed;
    return matchesSearch;
  });

  return (
    <div className="bg-[#14120E] border border-[#EEB057]/20 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
      {/* Activity Log Header */}
      <div className="p-6 border-b border-[#EEB057]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-wide">
              Recent Call &amp; Outreach Activity Log
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#EEB057]/15 text-[#EEB057] border border-[#EEB057]/30">
              {appointments.length} TOTAL
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time feed of automated IVR calls, patient voice interactions, and confirmation results.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <input
            type="text"
            placeholder="Search patient, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1A1814] border border-[#EEB057]/30 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EEB057] font-mono transition-colors w-full sm:w-48"
          />
          <div className="flex items-center bg-[#1A1814] border border-[#EEB057]/20 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#EEB057] text-[#0E0D0B] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'CONFIRMED'
                  ? 'bg-[#EEB057] text-[#0E0D0B] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'PENDING'
                  ? 'bg-[#EEB057] text-[#0E0D0B] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#EEB057]/10 bg-[#1A1814]/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3.5 px-6">Patient</th>
              <th className="py-3.5 px-6">Doctor &amp; Facility</th>
              <th className="py-3.5 px-6">Channel</th>
              <th className="py-3.5 px-6">Appointment Slot</th>
              <th className="py-3.5 px-6">Patient Outcome</th>
              <th className="py-3.5 px-6">Billed to Zocdoc</th>
              <th className="py-3.5 px-6 text-right">Call Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEB057]/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                  No outreach records found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((apt) => {
                const isConfirmed =
                  apt.status === 'Confirmed' ||
                  apt.raw_status === 'RESCHEDULED' ||
                  apt.raw_status === 'CONFIRMED';

                return (
                  <tr
                    key={apt.appointment_id}
                    className="hover:bg-[#1A1814]/50 transition-colors group"
                  >
                    {/* Patient */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EEB057]/15 border border-[#EEB057]/30 flex items-center justify-center font-bold text-[#EEB057] text-xs">
                          {apt.patient_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-[#EEB057] transition-colors">
                            {apt.patient_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {apt.patient_phone_masked}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor & Facility */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-semibold text-slate-200">{apt.doctor}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {apt.practice_name}
                      </p>
                    </td>

                    {/* Channel */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {apt.voice_status === 'Delivered' ? 'VOICE IVR' : 'SMS OUTREACH'}
                        </span>
                        {apt.voice_completed_at && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {apt.voice_completed_at}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Slot */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-semibold text-slate-200">{apt.time}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{apt.date}</p>
                    </td>

                    {/* Patient Outcome */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {isConfirmed ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>
                            Confirmed{' '}
                            {apt.patient_response?.channel
                              ? `(${apt.patient_response.channel})`
                              : '(Voice AI)'}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Awaiting Patient Reply</span>
                        </div>
                      )}
                    </td>

                    {/* Billed to Zocdoc (Real Vapi + Twilio Rates) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-white font-bold text-xs">
                          ${apt.billing?.billed_amount ? apt.billing.billed_amount.toFixed(2) : (apt.voice_status === 'Delivered' ? '1.25' : '0.05')}
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
                          +${apt.billing?.net_profit ? apt.billing.net_profit.toFixed(2) : (apt.voice_status === 'Delivered' ? '0.78' : '0.04')} profit
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Infra Cost: ${apt.billing?.vapi_cost ? apt.billing.vapi_cost.toFixed(4) : (apt.voice_status === 'Delivered' ? '0.4719' : '0.0079')}
                      </span>
                    </td>

                    {/* Call Status */}
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {apt.voice_status === 'Delivered' ? 'Completed' : 'Delivered'}
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
      <div className="p-4 bg-[#14120E] border-t border-[#EEB057]/15 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          Showing <span className="font-bold text-white">{filtered.length}</span> of{' '}
          <span className="font-bold text-white">{appointments.length}</span> outreach records
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Confirmed (
            {
              appointments.filter(
                (a) =>
                  a.status === 'Confirmed' ||
                  a.raw_status === 'RESCHEDULED' ||
                  a.raw_status === 'CONFIRMED'
              ).length
            }
            )
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending (
            {
              appointments.filter(
                (a) =>
                  a.status !== 'Confirmed' &&
                  a.raw_status !== 'RESCHEDULED' &&
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
