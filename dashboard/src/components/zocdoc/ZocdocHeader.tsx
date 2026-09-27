interface Props {
  onRefresh?: () => void;
  isLoading?: boolean;
  activeTab?: 'demo' | 'zocdoc';
  onTabChange?: (tab: 'demo' | 'zocdoc') => void;
}

export const ZocdocHeader = ({ activeTab = 'zocdoc', onTabChange }: Props) => {
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
              Automated Patient Reminders &amp; Attendance Dashboard
            </p>
          </div>
        </div>

        {/* Right Section: Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Navigation Switcher Pills */}
          <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onTabChange?.('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'demo'
                  ? 'bg-[#FACC15] text-slate-900 shadow-xs border border-yellow-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Launch Interactive Live Voice AI Simulator"
            >
              <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
              <span>⚡ Interactive Demo</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange?.('zocdoc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
                activeTab === 'zocdoc'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
              }`}
            >
              <span>Zocdoc Clinic Hub</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
