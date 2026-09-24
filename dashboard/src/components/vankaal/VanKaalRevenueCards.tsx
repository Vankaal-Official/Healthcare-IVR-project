import { useState } from 'react';

export const VanKaalRevenueCards = () => {
  // Metered baseline numbers (e.g. Month-To-Date)
  const [smsCount, setSmsCount] = useState<number>(68400);
  const [voiceCalls, setVoiceCalls] = useState<number>(8900);

  // Pricing constants (What Van-Kaal charges Zocdoc vs what Twilio charges Van-Kaal)
  const BILLING_RATE_SMS = 0.05;       // Van-Kaal charges Zocdoc $0.05 / SMS
  const BILLING_RATE_VOICE = 0.15;     // Van-Kaal charges Zocdoc $0.15 / IVR call
  const TWILIO_COST_SMS = 0.0079;      // Twilio charges $0.0079 / SMS segment
  const TWILIO_COST_VOICE = 0.0140;    // Twilio charges $0.014 / minute

  // Calculated metrics
  const totalB2BInvoice = (smsCount * BILLING_RATE_SMS) + (voiceCalls * BILLING_RATE_VOICE);
  const totalTwilioCost = (smsCount * TWILIO_COST_SMS) + (voiceCalls * TWILIO_COST_VOICE);
  const netMargin = totalB2BInvoice - totalTwilioCost;
  const marginPercent = totalB2BInvoice > 0 ? ((netMargin / totalB2BInvoice) * 100).toFixed(1) : '0';
  const totalRequests = smsCount + voiceCalls;

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Vankaal Sovereign Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Metered Traffic */}
        <div className="bg-[#151310] border border-[#EEB057]/20 hover:border-[#EEB057]/40 rounded-2xl p-5 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#EEB057] font-semibold">// 01 MTD TRAFFIC</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EEB057]/10 text-[#EEB057] border border-[#EEB057]/30">
              Metered
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {totalRequests.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
            <span className="text-[#EEB057] font-semibold">{smsCount.toLocaleString()} SMS</span>
            <span>•</span>
            <span className="text-[#FFC978] font-semibold">{voiceCalls.toLocaleString()} Calls</span>
          </div>
        </div>

        {/* B2B Invoiced Revenue to Zocdoc */}
        <div className="bg-[#151310] border border-[#EEB057]/20 hover:border-[#EEB057]/40 rounded-2xl p-5 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#EEB057] font-semibold">// 02 ZOCDOC BILLING</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-700/60">
              Contract
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#EEB057] font-mono tracking-tight">
            ${totalB2BInvoice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Rate: <span className="text-white font-bold">$0.05/SMS</span> &amp; <span className="text-white font-bold">$0.15/IVR</span>
          </div>
        </div>

        {/* Twilio Carrier Cost */}
        <div className="bg-[#151310] border border-[#EEB057]/20 hover:border-[#EEB057]/40 rounded-2xl p-5 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#EEB057] font-semibold">// 03 INFRA EXPENSE</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
              Raw Carrier
            </span>
          </div>
          <div className="text-3xl font-extrabold text-rose-300 font-mono tracking-tight">
            ${totalTwilioCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Twilio: <span className="text-white font-bold">$0.0079</span> SMS / <span className="text-white font-bold">$0.014</span> Min
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-gradient-to-br from-[#1A1610] to-[#251E14] border border-[#EEB057]/50 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#EEB057]/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#EEB057] font-bold">// 04 NET MARGIN</span>
            <span className="px-2 py-0.5 rounded bg-[#EEB057]/20 text-[#FFC978] font-bold font-mono text-[10px] border border-[#EEB057]/40">
              {marginPercent}% PROFIT
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            ${netMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-[#FFC978] font-mono">
            Retained profit after carrier transit
          </div>
        </div>
      </div>

      {/* Interactive Volume & Cost Simulation Tool for Team Lead / Finance */}
      <div className="bg-[#151310] border border-[#EEB057]/20 rounded-2xl p-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#EEB057] font-bold tracking-widest">
                // FINAI Intelligence
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
              Interactive Usage &amp; Margin Simulator for Van-Kaal
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate enterprise scaling to project contractual Zocdoc billings, Twilio expenses, and profit margins.
            </p>
          </div>
          <button
            onClick={() => {
              setSmsCount(68400);
              setVoiceCalls(8900);
            }}
            className="text-xs text-[#EEB057] hover:text-[#ffc978] font-mono font-bold self-start sm:self-auto underline cursor-pointer"
          >
            Reset Baseline
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* SMS Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Simulated SMS Reminders:</span>
              <span className="text-[#EEB057] font-bold">{smsCount.toLocaleString()} messages</span>
            </div>
            <input
              type="range"
              min="5000"
              max="250000"
              step="1000"
              value={smsCount}
              onChange={(e) => setSmsCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#EEB057]"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5,000</span>
              <span>100,000</span>
              <span>250,000</span>
            </div>
          </div>

          {/* Voice Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Simulated IVR Voice Calls:</span>
              <span className="text-[#FFC978] font-bold">{voiceCalls.toLocaleString()} calls</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={voiceCalls}
              onChange={(e) => setVoiceCalls(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#EEB057]"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>500</span>
              <span>25,000</span>
              <span>50,000</span>
            </div>
          </div>
        </div>

        {/* Real-time Breakdown Table */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#1A1713] rounded-xl border border-[#EEB057]/20">
            <span className="text-slate-400 block text-[11px]">Invoice to Zocdoc:</span>
            <span className="text-[#EEB057] font-bold text-lg">
              ${totalB2BInvoice.toFixed(2)}
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Contract billing total</span>
          </div>

          <div className="p-3 bg-[#1A1713] rounded-xl border border-[#EEB057]/20">
            <span className="text-slate-400 block text-[11px]">Pay to Twilio:</span>
            <span className="text-rose-300 font-bold text-lg">
              ${totalTwilioCost.toFixed(2)}
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Carrier transit cost</span>
          </div>

          <div className="p-3 bg-[#241D14] rounded-xl border border-[#EEB057]/40">
            <span className="text-[#FFC978] block text-[11px]">Van-Kaal Net Margin:</span>
            <span className="text-white font-bold text-lg">
              +${netMargin.toFixed(2)}
            </span>
            <span className="block text-[10px] text-[#EEB057] mt-0.5">{marginPercent}% gross margin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
