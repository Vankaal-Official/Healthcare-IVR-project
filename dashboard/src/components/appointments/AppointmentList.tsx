import React from 'react';
import { Appointment } from '../../types/appointment';
import { StatusBadge, ReminderBadge } from '../status/StatusBadge';
import { Calendar, ChevronRight } from 'lucide-react';

interface Props {
  appointments: Appointment[];
  onSelect: (apt: Appointment) => void;
}

export const AppointmentList: React.FC<Props> = ({ appointments, onSelect }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 text-sm">Real-Time Ingestion Queue</h3>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
          {appointments.length} records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs font-semibold uppercase tracking-wider border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3">Source ID</th>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Doctor</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Reminders</th>
              <th className="px-6 py-3">Lifecycle Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-zinc-50/75 transition-colors">
                <td className="px-6 py-3.5 font-mono text-xs text-zinc-600">{apt.sourceAppointmentId}</td>
                <td className="px-6 py-3.5 font-medium text-zinc-900">{apt.patient.name}</td>
                <td className="px-6 py-3.5 text-zinc-600">{apt.doctorName}</td>
                <td className="px-6 py-3.5 text-zinc-600">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <ReminderBadge type="sms" status={apt.reminders.sms.status} />
                    <ReminderBadge type="ivr" status={apt.reminders.ivr.status} />
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={apt.status} />
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => onSelect(apt)}
                    className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Details <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
