import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ZocdocLoginProps {
  onLogin: (user: { name: string; email: string; practice: string }) => void;
}

export const ZocdocLogin: React.FC<ZocdocLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('reception@manhattanhealth.org');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      onLogin({
        name: 'Front Desk Reception',
        email: email || 'reception@manhattanhealth.org',
        practice: 'Manhattan Health Center',
      });
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
        {/* Top Zocdoc signature yellow accent line */}
        <div className="h-2 bg-[#FFF04B] w-full" />

        <div className="p-8 sm:p-10">
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF04B] border border-amber-300 text-[#182743] shadow-sm mb-4">
              <span className="font-extrabold text-2xl tracking-tighter">Z</span>
            </div>
            <h2 className="text-2xl font-black text-[#182743] tracking-tight">
              Zocdoc Partner Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Clinic Staff Sign-In &amp; Appointment Verification
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Email / Practice ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reception@manhattanhealth.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">PIN: 2026</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Remember Workstation */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FFF04B] hover:bg-[#FBE235] text-[#182743] font-black text-xs tracking-wide shadow-sm hover:shadow transition border border-amber-300 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#182743] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Clinic Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#182743]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Demo Staff Account Ready</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>TLS 256-bit Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
