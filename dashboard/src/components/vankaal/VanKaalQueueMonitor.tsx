export const VanKaalQueueMonitor = () => {
  return (
    <div className="bg-[#151310] border border-[#EEB057]/20 rounded-2xl p-6 shadow-xl mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EEB057] animate-pulse"></span>
            <span className="text-xs font-mono uppercase text-[#EEB057] font-bold tracking-widest">
              // VoxKaal BullMQ Queue Engine
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-wide mt-0.5">
            Distributed Delayed Scheduler &amp; Worker Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time delayed queue (<span className="text-[#EEB057] font-mono">reminders</span>) orchestrated on Redis Sorted Sets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#1D1914] border border-[#EEB057]/30 text-[#EEB057] font-mono text-xs font-semibold">
            Cluster: standalone-redis:6379
          </span>
        </div>
      </div>

      {/* Real-time Queue Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
        {/* Delayed Queue Depth */}
        <div className="p-4 bg-[#1B1813] rounded-xl border border-[#EEB057]/15 hover:border-[#EEB057]/30 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Delayed Jobs</div>
          <div className="text-2xl font-bold font-mono text-[#EEB057] mt-1">1,420</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Queued for -24h / -2h</div>
        </div>

        {/* Active Worker Concurrency */}
        <div className="p-4 bg-[#1B1813] rounded-xl border border-[#EEB057]/15 hover:border-[#EEB057]/30 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Active Workers</div>
          <div className="text-2xl font-bold font-mono text-[#FFC978] mt-1">4 / 4</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">10 jobs/sec concurrency</div>
        </div>

        {/* Completed Jobs */}
        <div className="p-4 bg-[#1B1813] rounded-xl border border-[#EEB057]/15 hover:border-[#EEB057]/30 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Completed Today</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">6,812</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">100% SLA compliant</div>
        </div>

        {/* P95 Latency */}
        <div className="p-4 bg-[#1B1813] rounded-xl border border-[#EEB057]/15 hover:border-[#EEB057]/30 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase">p95 Latency</div>
          <div className="text-2xl font-bold font-mono text-[#EEB057] mt-1">18 ms</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Target &lt; 100 ms</div>
        </div>

        {/* Cancelled Prunes */}
        <div className="p-4 bg-[#1B1813] rounded-xl border border-[#EEB057]/15 hover:border-[#EEB057]/30 transition-all col-span-2 lg:col-span-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Instant Prunes</div>
          <div className="text-2xl font-bold font-mono text-[#FFC978] mt-1">94</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Evicted early from Redis</div>
        </div>
      </div>

      {/* Queue Health & Fail-safe Safeguards */}
      <div className="mt-6 p-4 rounded-xl bg-[#0F0E0B] border border-[#EEB057]/20 text-xs text-slate-300 font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/10">
          <span className="font-semibold text-white">// VOXKAAL FAIL-SAFE SAFEGUARDS</span>
          <span className="text-[#EEB057] font-bold">ALL PROTOCOLS ACTIVE</span>
        </div>
        <div className="flex items-center justify-between">
          <span>• Race Protection: PostgreSQL status check prior to Twilio dispatch</span>
          <span className="text-emerald-400">ENABLED (0 ghost alerts sent)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>• Immediate Job Eviction on cancel/reschedule</span>
          <span className="text-emerald-400">ENABLED (redis.remove())</span>
        </div>
        <div className="flex items-center justify-between">
          <span>• Outbound Dispatcher Retries</span>
          <span className="text-[#EEB057]">ENABLED (3 attempts, 5s backoff)</span>
        </div>
      </div>
    </div>
  );
};
