import { useState } from 'react';
import type { ZocdocAppointment } from '../../types/portal';

interface ZocdocTableProps {
  appointments: ZocdocAppointment[];
  onSelectAppointment: (appointment: ZocdocAppointment) => void;
}

export const ZocdocTable = ({ appointments, onSelectAppointment }: ZocdocTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'At Risk'>('All');

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.practice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appointment_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
      {/* Table Header & Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#182743]">Today's Scheduled Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of automated patient reminders and confirmations across participating clinics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search patient, doctor, clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFF04B] focus:border-[#182743] transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
            {(['All', 'Confirmed', 'Pending', 'At Risk'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === filter
                    ? 'bg-white text-[#182743] shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
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
              <th className="py-3.5 px-6">Patient & ID</th>
              <th className="py-3.5 px-6">Doctor & Clinic</th>
              <th className="py-3.5 px-6">Appointment Time</th>
              <th className="py-3.5 px-6">SMS Reminder</th>
              <th className="py-3.5 px-6">IVR Escalation</th>
              <th className="py-3.5 px-6">Patient Status</th>
              <th className="py-3.5 px-6 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No appointments match your search criteria.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => (
                <tr
                  key={app.appointment_id}
                  className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
                  onClick={() => onSelectAppointment(app)}
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

                  {/* SMS Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          app.sms_status === 'Delivered'
                            ? 'bg-emerald-500'
                            : app.sms_status === 'Failed'
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                        }`}
                      ></span>
                      <span className="font-medium text-slate-700">{app.sms_status}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {app.sms_delivered_at || app.sms_scheduled_at}
                    </span>
                  </td>

                  {/* IVR Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          app.voice_status === 'Delivered'
                            ? 'bg-indigo-500'
                            : app.voice_status === 'Skipped'
                            ? 'bg-slate-300'
                            : 'bg-amber-400'
                        }`}
                      ></span>
                      <span className="font-medium text-slate-700">
                        {app.voice_status === 'Skipped' ? 'Not Required' : app.voice_status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {app.voice_completed_at ? 'Completed via DTMF' : app.voice_status === 'Skipped' ? 'Confirmed via SMS' : 'Queued'}
                    </span>
                  </td>

                  {/* Overall Patient Status */}
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
                      {app.status === 'Confirmed' && '✓'}
                      {app.status === 'At Risk' && '⚠️'}
                      {app.status === 'Pending' && '⏳'}
                      {app.status}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed (1,230)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending (164)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Flagged (20)
          </span>
        </div>
      </div>
    </div>
  );
};
