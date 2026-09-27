import { Calendar } from 'lucide-react';

interface Props {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ZocdocHeader = ({}: Props) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Zocdoc Signature Yellow accent */}
      <div className="h-1.5 bg-[#FFF04B] w-full" />
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Zocdoc Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF04B] border border-amber-300 flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-[#182743] text-xl tracking-tighter">Z</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-[#182743] tracking-tight">Zocdoc</span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                Partner Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Automated Patient Reminders &amp; Attendance Dashboard (Powered by Van-Kaal)
            </p>
          </div>
        </div>

        {/* Right Section: Navigation Switcher & Date */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Direct Navigation to Live Demo Simulator */}
          <a
            href="/demo"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 text-xs font-bold font-mono shadow-xs transition border border-yellow-400"
            title="Launch Interactive Live Voice AI Simulator"
          >
            <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
            <span>⚡ Interactive Demo</span>
          </a>

          {/* Direct Navigation to Van-Kaal Telemetry */}
          <a
            href="/vankaal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
            title="View Van-Kaal Telemetry & Financial Invoicing"
          >
            <span>Operations Telemetry</span>
          </a>

          {/* Date Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayStr}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
