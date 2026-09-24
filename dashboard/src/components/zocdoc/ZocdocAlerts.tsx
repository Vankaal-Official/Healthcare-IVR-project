export const ZocdocAlerts = () => {
  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-lg flex-shrink-0">
          ⚠️
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#182743]">
            Clinic Attention Needed: 3 Patients Unreachable by SMS
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Our automated dispatch flagged 3 patient landlines where SMS was rejected. IVR voice call has been queued, but clinic desk follow-up is recommended.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
        <button 
          onClick={() => {}} 
          className="px-3.5 py-1.5 bg-[#182743] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          View 3 Flagged Patients
        </button>
        <span className="text-[11px] text-slate-400">Escalated to IVR</span>
      </div>
    </div>
  );
};
