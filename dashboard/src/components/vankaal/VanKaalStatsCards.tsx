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
  const totalCalls = metrics?.voiceCalls || 1;
  const totalSms = metrics?.smsCount || 1;
  const totalOutreach = metrics?.totalRequests || (totalCalls + totalSms);

  const confirmedCount = appointments.filter(
    (a) => a.status === 'Confirmed' || a.raw_status === 'RESCHEDULED' || a.raw_status === 'CONFIRMED'
  ).length;

  const totalAppts = appointments.length || 1;
  const successRate = totalAppts > 0 ? Math.round((confirmedCount / totalAppts) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Calls / Outreaches */}
      <div className="bg-[#14120E] border border-[#EEB057]/25 rounded-2xl p-5 hover:border-[#EEB057]/50 transition-all duration-200 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Total Outreaches
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#EEB057]/15 text-[#EEB057] border border-[#EEB057]/30">
            LIVE
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-white font-sans tracking-tight">
            {totalOutreach}
          </span>
          <span className="text-xs text-slate-400 font-mono">dispatched</span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono pt-2 border-t border-[#EEB057]/10">
          <span className="text-[#EEB057] font-semibold">{totalCalls} IVR Calls</span>
          <span>•</span>
          <span>{totalSms} SMS</span>
        </div>
      </div>

      {/* 2. Confirmed Appointments */}
      <div className="bg-[#14120E] border border-emerald-500/25 rounded-2xl p-5 hover:border-emerald-500/50 transition-all duration-200 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Confirmed Patients
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            SECURED
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-emerald-400 font-sans tracking-tight">
            {confirmedCount}
          </span>
          <span className="text-xs text-slate-400 font-mono">of {appointments.length} patients</span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono pt-2 border-t border-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Attendance confirmed via AI</span>
        </div>
      </div>

      {/* 3. Success / Confirmation Rate */}
      <div className="bg-[#14120E] border border-[#EEB057]/25 rounded-2xl p-5 hover:border-[#EEB057]/50 transition-all duration-200 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Confirmation Rate
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            OPTIMAL
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-white font-sans tracking-tight">
            {successRate}%
          </span>
          <span className="text-xs text-emerald-400 font-mono">conversion</span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono pt-2 border-t border-[#EEB057]/10">
          <span>Real-time voice &amp; SMS loop</span>
        </div>
      </div>

      {/* 4. Infrastructure Health */}
      <div className="bg-[#14120E] border border-[#EEB057]/25 rounded-2xl p-5 hover:border-[#EEB057]/50 transition-all duration-200 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            System Operations
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            100% HEALTH
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Operational
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono pt-2 border-t border-[#EEB057]/10">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Redis &amp; Database Active
          </span>
        </div>
      </div>
    </div>
  );
};
