export const VanKaalHeader = () => {
  return (
    <header className="bg-[#0E0D0B] border-b border-[#EEB057]/20 text-slate-100 sticky top-0 z-40 backdrop-blur-md bg-[#0E0D0B]/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Vankaal Official Brand Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Vankaal Gold Logo Symbol */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C88528] via-[#EEB057] to-[#FFC978] flex items-center justify-center font-black text-[#0E0D0B] text-lg shadow-lg shadow-[#EEB057]/20 border border-[#EEB057]/40">
              VK
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  VAN-KAAL
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#EEB057]/10 text-[#EEB057] border border-[#EEB057]/40 tracking-wider uppercase">
                  SOVEREIGN TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                VoxKaal &amp; DataKaal // Healthcare IVR &amp; ERP Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Redis BullMQ Health */}
          <div className="hidden sm:flex items-center gap-2 bg-[#171512] px-3 py-1.5 rounded-lg border border-[#EEB057]/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#EEB057] animate-ping"></span>
            <span className="text-slate-400 font-mono">VoxKaal Redis:</span>
            <span className="text-[#EEB057] font-bold font-mono">Connected</span>
          </div>

          {/* Postgres Pool */}
          <div className="hidden md:flex items-center gap-2 bg-[#171512] px-3 py-1.5 rounded-lg border border-[#EEB057]/20 text-xs">
            <span className="text-slate-400 font-mono">DataKaal DB:</span>
            <span className="text-[#FFC978] font-bold font-mono">8 / 20 Active</span>
          </div>

          {/* Action CTA styled like vankaal.com */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <button
              onClick={() => window.open('https://www.vankaal.com', '_blank')}
              className="px-3.5 py-1.5 bg-[#EEB057] hover:bg-[#ffc978] text-[#0E0D0B] rounded-lg text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-[#EEB057]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Vankaal.ai</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
