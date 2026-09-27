import React, { useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import type { ZocdocAppointment } from '../../types/portal';

interface ZocdocTableProps {
  appointments: ZocdocAppointment[];
  onSelectAppointment: (appointment: ZocdocAppointment) => void;
}

export const ZocdocTable: React.FC<ZocdocTableProps> = ({
  appointments,
  onSelectAppointment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'At Risk'>('All');

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.practice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appointment_id.toLowerCase().includes(searchTerm.toLowerCase());

    const isConfirmed =
      app.status === 'Confirmed' ||
      app.raw_status === 'CONFIRMED';

    if (statusFilter === 'Confirmed') return matchesSearch && isConfirmed;
    if (statusFilter === 'Pending') return matchesSearch && !isConfirmed && app.status !== 'At Risk' && app.status !== 'Cancelled';
    if (statusFilter === 'At Risk') return matchesSearch && (app.status === 'At Risk' || app.status === 'Cancelled');
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
      {/* Table Header & Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#182743]">Today's Scheduled Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time verification log for patient confirmations, Voice AI calls, and attendance status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search patient, doctor, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3.5 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {(['All', 'Confirmed', 'Pending', 'At Risk'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === filter ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Patient &amp; ID</th>
              <th className="py-3.5 px-6">Doctor &amp; Clinic</th>
              <th className="py-3.5 px-6">Appointment Time</th>
              <th className="py-3.5 px-6">Reminder Method &amp; Status</th>
              <th className="py-3.5 px-6">Attendance Status</th>
              <th className="py-3.5 px-6 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No appointments match your search criteria.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => (
                <tr
                  key={app.appointment_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Patient & ID */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#182743] group-hover:text-amber-900 transition-colors">
                      {app.patient_name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-400">{app.appointment_id}</span>
                      <span className="text-[11px] text-slate-500">• {app.patient_phone_masked}</span>
                    </div>
                  </td>

                  {/* Doctor & Clinic */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">{app.doctor}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{app.practice_name}</div>
                  </td>

                  {/* Time Slot */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-semibold text-[#182743]">{app.time}</div>
                    <div className="text-[11px] text-slate-400">{app.date}</div>
                  </td>

                  {/* Combined Reminder Method & Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    {app.voice_status === 'Delivered' ? (
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-[11px]">
                          <Phone className="w-3 h-3 text-indigo-600" />
                          <span>Voice AI</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          <span>Delivered</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          {app.voice_completed_at ? `Completed at ${app.voice_completed_at}` : 'Call completed'}
                        </span>
                      </div>
                    ) : app.sms_status === 'Delivered' ? (
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>SMS</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>Delivered</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          {app.sms_delivered_at || app.sms_scheduled_at}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>Queued</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          Scheduled: {app.sms_scheduled_at || app.time}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Attendance Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        app.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status === 'At Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : app.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {app.status === 'Confirmed'
                        ? '✓ Confirmed via AI'
                        : app.status === 'At Risk'
                        ? '⚠️ At Risk'
                        : app.status === 'Cancelled'
                        ? '✕ Cancelled'
                        : '⏳ Pending'}
                    </span>
                  </td>

                  {/* Audit Button */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(app);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-[#182743] hover:text-white text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      View Audit &rarr;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{filteredAppointments.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{appointments.length}</span> patient bookings today
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
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
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending (
            {
              appointments.filter(
                (a) =>
                  a.status !== 'Confirmed' &&
                  a.raw_status !== 'CONFIRMED'
              ).length
            }
            )
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Flagged (
            {appointments.filter((a) => a.status === 'At Risk' || a.status === 'Cancelled').length}
            )
          </span>
        </div>
      </div>
    </div>
  );
};
