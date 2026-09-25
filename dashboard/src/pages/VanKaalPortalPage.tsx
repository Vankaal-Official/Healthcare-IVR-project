import { useState, useEffect, useCallback } from 'react';
import { VanKaalHeader } from '../components/vankaal/VanKaalHeader';
import { VanKaalStatsCards } from '../components/vankaal/VanKaalStatsCards';
import { VanKaalBillingSummary } from '../components/vankaal/VanKaalBillingSummary';
import { VanKaalActivityLog } from '../components/vankaal/VanKaalActivityLog';
import type { ZocdocAppointment, VanKaalMetrics } from '../types/portal';

export interface VanKaalTelemetry {
  metrics: VanKaalMetrics;
  queue: {
    cluster: string;
    delayedJobs: number;
    completedToday: number;
    activeWorkers: number;
    p95LatencyMs: number;
    instantPrunes: number;
  };
  webhooks: {
    total: number;
    delivered: number;
    successRate: number;
  };
}

export const VanKaalPortalPage = () => {
  const [telemetry, setTelemetry] = useState<VanKaalTelemetry | null>(null);
  const [appointments, setAppointments] = useState<ZocdocAppointment[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('Syncing live...');

  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Telemetry
      try {
        let res = await fetch('/v1/tenants/telemetry');
        if (!res.ok) res = await fetch('http://localhost:3000/v1/tenants/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (err) {
        console.error('Failed to fetch Van-Kaal telemetry:', err);
      }

      // 2. Fetch Appointments & Call Outcomes
      try {
        let aptRes = await fetch('/v1/appointments');
        if (!aptRes.ok) aptRes = await fetch('http://localhost:3000/v1/appointments');
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          setAppointments(aptData);
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error refreshing portal data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0E0D0B] text-slate-100 font-sans antialiased relative overflow-x-hidden selection:bg-[#EEB057] selection:text-[#0E0D0B]">
      {/* Subtle Ambient Gold Radial Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(238,176,87,0.08)_0%,rgba(14,13,11,0)_70%)] pointer-events-none -z-10 blur-3xl"
      />

      {/* Header */}
      <VanKaalHeader />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Clean, Minimal Hero Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono tracking-widest text-[#EEB057] uppercase font-semibold">
                Live Operations Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Patient Outreach &amp; Call Operations
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Real-time monitoring of automated IVR calls, patient voice interactions, and verified confirmations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#171512] px-3.5 py-1.5 rounded-xl border border-[#EEB057]/20 text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Synced: {lastUpdated}</span>
          </div>
        </div>

        {/* 1. Clean Key Performance Metrics Cards */}
        <VanKaalStatsCards metrics={telemetry?.metrics} appointments={appointments} />

        {/* 2. Real Enterprise Vapi AI & Twilio Metered Billing Summary */}
        <VanKaalBillingSummary metrics={telemetry?.metrics} />

        {/* 3. Recent Call & Outreach Activity Log with Per-Call Billing */}
        <VanKaalActivityLog appointments={appointments} />
      </main>

      {/* Sovereign Minimal Footer */}
      <footer className="border-t border-[#EEB057]/15 bg-[#0A0908] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">VAN-KAAL</span>
            <span>•</span>
            <span className="text-[#EEB057]">Healthcare AI Telemetry</span>
          </div>
          <div className="flex items-center gap-4">
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span className="text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
