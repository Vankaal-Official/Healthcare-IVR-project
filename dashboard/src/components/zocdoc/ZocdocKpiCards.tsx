import { CalendarCheck, Users, UserX, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ZocdocAppointment } from '../../types/portal';

interface Props {
  appointments?: ZocdocAppointment[];
}

export const ZocdocKpiCards = ({ appointments = [] }: Props) => {
  const total = appointments.length;
  const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;
  const atRisk = appointments.filter((a) => a.status === 'At Risk').length;
  const pending = appointments.filter((a) => a.status === 'Pending').length;

  const confirmedRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const cancelledRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Appointments */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Bookings</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-black text-[#182743] mt-2">{total}</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Synced live from Zocdoc API</span>
        </div>
      </div>

      {/* 2. Confirmed Rate */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFF04B]/30 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmed Patients</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-black text-emerald-700">{confirmedRate}%</p>
          <span className="text-xs font-bold text-slate-500">({confirmed} patients)</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-800">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>No-shows reduced by ~28% today</span>
        </div>
      </div>

      {/* 3. Cancelled / Freed Slots */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Slots Released Early</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <UserX className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-black text-slate-900">{cancelled}</p>
          <span className="text-xs font-bold text-slate-500">({cancelledRate}%)</span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-2">
          Cancelled via reminder; slots freed for urgent walk-ins
        </p>
      </div>

      {/* 4. At Risk / Attention */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Requires Attention</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-black text-amber-600">{atRisk + pending}</p>
          <span className="text-xs font-bold text-slate-500">({atRisk} at risk, {pending} pending)</span>
        </div>
        <p className="text-xs font-medium text-amber-800 mt-2">
          Unanswered reminders flagged for clinic follow-up
        </p>
      </div>
    </div>
  );
};
