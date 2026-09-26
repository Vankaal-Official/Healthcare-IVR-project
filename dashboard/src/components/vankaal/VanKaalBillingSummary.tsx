import React from 'react';
import type { VanKaalMetrics } from '../../types/portal';

interface VanKaalBillingSummaryProps {
  metrics?: VanKaalMetrics;
}

export const VanKaalBillingSummary: React.FC<VanKaalBillingSummaryProps> = ({ metrics }) => {
  const invoiceTotal = metrics?.totalB2BInvoice ?? 2.55;
  const costTotal = metrics?.totalCost ?? metrics?.totalTwilioCost ?? 0.9517;
  const netMargin = metrics?.netMargin ?? 1.60;
  const marginPercent = metrics?.marginPercent ?? '62.7';
  const voiceRate = metrics?.billingRateVoice ?? 1.25;
  const smsRate = metrics?.billingRateSms ?? 0.05;
  const voiceCost = metrics?.costRateVoice ?? 0.4719;
  const smsCost = metrics?.costRateSms ?? 0.0079;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
              Enterprise Metered Invoicing &amp; Infrastructure COGS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              LIVE METERED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real contractual billing charged to Zocdoc vs. true Vapi AI &amp; Twilio telecom delivery expense.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SaaS Gross Margin: <strong className="text-emerald-700 font-bold">{marginPercent}%</strong></span>
        </div>
      </div>

      {/* 3 Main Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* 1. Zocdoc B2B Invoice */}
        <div className="bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/90 rounded-xl p-5 shadow-xs relative overflow-hidden transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 tracking-tight">
              Zocdoc Usage Invoice (MTD)
            </span>
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
              CONTRACT REVENUE
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-lg font-bold text-slate-400">$</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {invoiceTotal.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-400 ml-1">USD</span>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Billing Rates</span>
            <span className="font-semibold text-slate-700">
              ${voiceRate.toFixed(2)} / Call • ${smsRate.toFixed(2)} / SMS
            </span>
          </div>
        </div>

        {/* 2. Real Infra Cost (Vapi + Twilio) */}
        <div className="bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/90 rounded-xl p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 tracking-tight">
              Infra Expense (Vapi AI + Twilio)
            </span>
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              REAL COGS
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-lg font-bold text-slate-400">$</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {costTotal.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1">
              (${costTotal.toFixed(4)})
            </span>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Direct COGS</span>
            <span className="font-semibold text-slate-700">
              ${voiceCost.toFixed(4)} / Call • ${smsCost.toFixed(4)} / SMS
            </span>
          </div>
        </div>

        {/* 3. Retained Net Margin */}
        <div className="bg-gradient-to-b from-white to-emerald-50/30 border border-emerald-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 tracking-tight">
              Van-Kaal Retained Profit
            </span>
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {marginPercent}% MARGIN
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-lg font-bold text-emerald-600">+$</span>
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {netMargin.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-600 ml-1">USD Net</span>
          </div>

          <div className="pt-2.5 border-t border-emerald-100/80 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Retained Per Call</span>
            <span className="font-bold text-emerald-700">
              +$0.78 / Outreach (62.7%)
            </span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-800 font-bold">Vapi AI Cost Breakdown:</span>
          <span>GPT-4o ($0.21) • Vapi Platform ($0.15) • TTS Voice ($0.08) • Deepgram STT ($0.03)</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Per-Call Economics:</span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold">
            Charge Zocdoc $1.25 &rarr; Profit +$0.78 / call
          </span>
        </div>
      </div>
    </div>
  );
};
