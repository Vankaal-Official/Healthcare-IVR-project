import { useState, useEffect } from 'react';
import { ZocdocPortalPage } from './pages/ZocdocPortalPage';
import { VanKaalPortalPage } from './pages/VanKaalPortalPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Standalone Route 1: Zocdoc Partner Portal (Zero Van-Kaal internal numbers/costs, 100% Zocdoc Brand)
  if (currentPath === '/zocdoc' || currentPath.startsWith('/zocdoc/')) {
    return <ZocdocPortalPage />;
  }

  // Standalone Route 2: Van-Kaal Internal Ops & Cost Portal (Zero Patient PHI, BullMQ + Twilio Cost Engine)
  if (currentPath === '/vankaal' || currentPath.startsWith('/vankaal/') || currentPath === '/admin') {
    return <VanKaalPortalPage />;
  }

  // Default Entry Hub: Clear launchpad to either standalone portal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono mb-4">
            <span>Healthcare IVR & SMS Engine</span>
            <span>•</span>
            <span>Multi-Portal Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Independent Dedicated Portals
          </h1>
          <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto">
            Our system provides two completely independent, separated dashboards. Select a portal below to access its standalone interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-4">
          {/* Option A: Zocdoc Partner Portal */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-slate-800 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF04B] text-[#182743] flex items-center justify-center font-black text-xl mb-6 shadow-sm group-hover:scale-105 transition-transform">
                ZD
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  FOR ZOCDOC & CLINICS
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#182743] mt-2">
                Zocdoc Partner Portal
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Route: /zocdoc</p>
              
              <ul className="mt-5 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Official Zocdoc design theme (#FFF04B & #182743)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Today's bookings & 88.5% confirmation rate
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  SMS & Voice IVR delivery pipeline status
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Zero Van-Kaal costs or margins shown
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigateTo('/zocdoc')}
              className="mt-8 w-full py-3.5 px-4 rounded-xl bg-[#FFF04B] hover:bg-[#ffe81a] text-[#182743] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              Open Zocdoc Portal &rarr;
            </button>
          </div>

          {/* Option B: Van-Kaal Internal Ops & Cost Portal */}
          <div className="bg-[#151310] rounded-3xl p-8 border border-[#EEB057]/20 text-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:border-[#EEB057]/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C88528] via-[#EEB057] to-[#FFC978] text-[#0E0D0B] flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-[#EEB057]/20 group-hover:scale-105 transition-transform border border-[#EEB057]/40">
                VK
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#EEB057] bg-[#EEB057]/10 px-2.5 py-0.5 rounded-full border border-[#EEB057]/30 tracking-wider font-mono">
                  // VAN-KAAL SOVEREIGN SUITE
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-2">
                Van-Kaal Ops &amp; Cost Engine
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Route: /vankaal</p>
              
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-[#EEB057] font-bold">✓</span>
                  Metered usage &amp; Twilio carrier cost calculator
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#EEB057] font-bold">✓</span>
                  Zocdoc monthly invoicing &amp; profit margins
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#EEB057] font-bold">✓</span>
                  VoxKaal BullMQ Redis queue &amp; worker telemetry
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#EEB057] font-bold">✓</span>
                  Zero patient PHI (100% HIPAA isolation)
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigateTo('/vankaal')}
              className="mt-8 w-full py-3.5 px-4 rounded-xl bg-[#EEB057] hover:bg-[#ffc978] text-[#0E0D0B] font-extrabold text-sm shadow-lg shadow-[#EEB057]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-mono cursor-pointer"
            >
              Open Van-Kaal Portal &rarr;
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 pt-4">
          Direct URLs can be shared independently with clients (e.g.{' '}
          <code className="text-slate-400">/zocdoc</code> to Zocdoc staff, and{' '}
          <code className="text-slate-400">/vankaal</code> to Van-Kaal internal team).
        </p>
      </div>
    </div>
  );
}
