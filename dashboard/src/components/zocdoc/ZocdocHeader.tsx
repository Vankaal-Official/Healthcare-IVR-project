import { Calendar, RefreshCw } from 'lucide-react';

interface Props {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ZocdocHeader = ({
  onRefresh = () => {},
  isLoading = false,
}: Props) => {
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
              Automated Patient Reminders & Attendance Dashboard (Powered by Van-Kaal)
            </p>
          </div>
        </div>

        {/* Date Indicator & Refresh */}
        <div className="flex items-center gap-3">
          {/* Date Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today, Sep 21, 2026</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Refresh appointments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
