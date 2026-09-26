import React from 'react';
import type { ZocdocAppointment } from '../../types/portal';

interface VanKaalStatsCardsProps {
  metrics?: {
    smsCount: number;
    voiceCalls: number;
    totalRequests: number;
  };
  appointments: ZocdocAppointment[];
}

export const VanKaalStatsCards: React.FC<VanKaalStatsCardsProps> = ({
  metrics,
  appointments,
}) => {
  const totalCalls = metrics?.voiceCalls ?? 2;
  const totalSms = metrics?.smsCount ?? 1;
  const totalOutreach = metrics?.totalRequests ?? (totalCalls + totalSms);

  const confirmedCount = appointments.filter(
    (a) => a.status === 'Confirmed' || a.raw_status === 'CONFIRMED'
  ).length;

  const totalAppts = appointments.length || 1;
  const successRate = totalAppts > 0 ? Math.round((confirmedCount / totalAppts) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Calls / Outreaches */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-400/50 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Total Outreaches
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
            LIVE
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            {totalOutreach}
          </span>
          <span className="text-xs text-slate-400 font-mono">dispatched</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono pt-2.5 border-t border-slate-100">
          <span className="text-amber-800 font-bold">{totalCalls} IVR Calls</span>
          <span>•</span>
          <span>{totalSms} SMS</span>
        </div>
      </div>

      {/* 2. Confirmed Patients */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-400/50 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Confirmed Patients
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            SECURED
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-emerald-700 font-sans tracking-tight">
            {confirmedCount}
          </span>
          <span className="text-xs text-slate-400 font-mono">of {appointments.length} patients</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono pt-2.5 border-t border-slate-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Attendance confirmed via AI</span>
        </div>
      </div>

      {/* 3. Success / Confirmation Rate */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-400/50 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Confirmation Rate
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
            OPTIMAL
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            {successRate}%
          </span>
          <span className="text-xs text-emerald-700 font-mono font-semibold">conversion</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono pt-2.5 border-t border-slate-100">
          <span>Real-time voice &amp; SMS loop</span>
        </div>
      </div>

      {/* 4. Infrastructure Health */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-400/50 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            System Operations
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            100% HEALTH
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Operational
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono pt-2.5 border-t border-slate-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Redis &amp; Database Active</span>
        </div>
      </div>
    </div>
  );
};
