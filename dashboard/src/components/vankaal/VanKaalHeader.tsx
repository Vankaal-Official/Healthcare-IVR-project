export const VanKaalHeader = () => {
  return (
    <header className="bg-[#0E0D0B] border-b border-[#EEB057]/20 text-slate-100 sticky top-0 z-40 backdrop-blur-md bg-[#0E0D0B]/95 py-5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between gap-8">
        {/* Vankaal Official Brand Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3.5">
            {/* Vankaal Gold Logo Symbol */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#C88528] via-[#EEB057] to-[#FFC978] flex items-center justify-center font-black text-[#0E0D0B] text-lg shadow-lg shadow-[#EEB057]/20 border border-[#EEB057]/40 flex-shrink-0">
              VK
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  VAN-KAAL
                </span>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#EEB057]/10 text-[#EEB057] border border-[#EEB057]/40 tracking-wider uppercase">
                  SOVEREIGN TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Healthcare Autonomous IVR &amp; ERP Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* System Health Indicators with enhanced breathing room */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Redis Health */}
          <div className="flex items-center gap-2 bg-[#171512] px-4 py-2 rounded-xl border border-[#EEB057]/30 text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#EEB057] animate-ping"></span>
            <span className="text-slate-400 font-mono">Redis:</span>
            <span className="text-[#EEB057] font-bold font-mono">Connected</span>
          </div>

          {/* Database Health */}
          <div className="flex items-center gap-2 bg-[#171512] px-4 py-2 rounded-xl border border-[#EEB057]/20 text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 font-mono">Database:</span>
            <span className="text-emerald-400 font-bold font-mono">Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};
