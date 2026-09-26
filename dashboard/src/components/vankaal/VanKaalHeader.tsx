export const VanKaalHeader = () => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-6">
        {/* Vankaal Official Brand Identity */}
        <div className="flex items-center gap-3.5">
          {/* Vankaal Butter-Yellow Logo Symbol */}
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] flex items-center justify-center font-black text-slate-900 text-lg shadow-sm border border-yellow-400 shrink-0">
            VK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                VAN-KAAL
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 tracking-wider uppercase">
                SOVEREIGN TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Healthcare Autonomous IVR &amp; ERP Telemetry
            </p>
          </div>
        </div>

        {/* System Health Indicators in Clean Light Style */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Redis Health */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-slate-500 font-mono">Redis:</span>
            <span className="text-amber-700 font-bold font-mono">Connected</span>
          </div>

          {/* Database Health */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500 font-mono">Prisma:</span>
            <span className="text-emerald-700 font-bold font-mono">Connected</span>
          </div>

          {/* Tunnel Status */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-500 font-mono">Tunnel:</span>
            <span className="text-amber-700 font-bold font-mono">Active</span>
          </div>

          {/* Quick link to Live Simulator */}
          <a
            href="/demo"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 text-xs font-bold font-mono shadow-sm transition border border-yellow-400/50"
            title="Launch Interactive Live Voice AI Simulator"
          >
            <span>⚡ Live Simulator</span>
          </a>
        </div>
      </div>
    </header>
  );
};
