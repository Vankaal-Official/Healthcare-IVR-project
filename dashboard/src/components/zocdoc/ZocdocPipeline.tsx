export const ZocdocPipeline = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#182743] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Patient Communication Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated delivery engine dispatched to patients 24h & 2h prior to booking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            All Channels Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* SMS Notification Engine */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFF04B]/60 text-[#182743] flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#182743]">SMS Reminders</h3>
                <p className="text-xs text-slate-500">2-way interactive texts</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              98.6%
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Delivered Today:</span>
              <span className="font-semibold text-slate-800">1,394 messages</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Avg Delivery Latency:</span>
              <span className="font-semibold text-slate-800">1.4 seconds</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Patient Reply Rate:</span>
              <span className="font-semibold text-emerald-700">84.2%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-[#182743] h-1.5 rounded-full" style={{ width: '98.6%' }}></div>
          </div>
        </div>

        {/* IVR Voice Escalation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                📞
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#182743]">Voice / IVR Calls</h3>
                <p className="text-xs text-slate-500">Auto-escalation for non-replies</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              82.1%
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Escalated Calls:</span>
              <span className="font-semibold text-slate-800">188 calls</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Connected & Answered:</span>
              <span className="font-semibold text-slate-800">154 patients</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>DTMF Confirmed Key 1:</span>
              <span className="font-semibold text-indigo-700">139 confirmed</span>
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '82.1%' }}></div>
          </div>
        </div>

        {/* Zocdoc Webhook Sync */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#182743]">Zocdoc Status Sync</h3>
                <p className="text-xs text-slate-500">Real-time webhook events</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100%
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Sync Endpoint:</span>
              <span className="font-mono text-[11px] text-slate-700 truncate max-w-[140px]">api.zocdoc.com/v2/events</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Events Dispatched:</span>
              <span className="font-semibold text-slate-800">1,414 synced</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sync Latency:</span>
              <span className="font-semibold text-emerald-700">&lt; 180 ms</span>
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
