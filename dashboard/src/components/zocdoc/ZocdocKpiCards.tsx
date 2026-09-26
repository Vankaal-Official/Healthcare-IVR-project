import React from 'react';
import { CalendarCheck, Users, AlertTriangle } from 'lucide-react';
import type { ZocdocAppointment } from '../../types/portal';

interface Props {
  appointments?: ZocdocAppointment[];
}

export const ZocdocKpiCards: React.FC<Props> = ({ appointments = [] }: Props) => {
  const total = appointments.length;
  const confirmed = appointments.filter(
    (a) => a.status === 'Confirmed' || a.raw_status === 'CONFIRMED'
  ).length;
  const followUpNeeded = appointments.filter(
    (a) => a.status === 'At Risk' || a.status === 'Cancelled'
  ).length;

  const confirmedRate = total > 0 ? Math.round((confirmed / total) * 100) : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* 1. Today's Appointments */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today's Appointments
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-black text-[#182743] mt-2">{total}</p>
        <p className="text-xs font-medium text-slate-500 mt-2">
          patients
        </p>
      </div>

      {/* 2. Confirmed via AI */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFF04B]/20 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Confirmed via AI
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-black text-emerald-700">{confirmedRate}%</p>
          <span className="text-xs font-bold text-slate-500">({confirmed} of {total} confirmed)</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-800">
          <span>Attendance secured by autonomous IVR &amp; SMS</span>
        </div>
      </div>

      {/* 3. Needs Staff Follow-Up */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Needs Staff Follow-Up
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-black text-slate-800">{followUpNeeded}</p>
          <span className="text-xs font-medium text-slate-500">action required</span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-2">
          {followUpNeeded === 0 ? 'All patient responses handled autonomously' : 'Flagged for front-desk review'}
        </p>
      </div>
    </div>
  );
};
