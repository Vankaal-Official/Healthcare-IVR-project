import { VanKaalHeader } from '../components/vankaal/VanKaalHeader';
import { VanKaalRevenueCards } from '../components/vankaal/VanKaalRevenueCards';
import { VanKaalQueueMonitor } from '../components/vankaal/VanKaalQueueMonitor';
import { VanKaalTenantTable } from '../components/vankaal/VanKaalTenantTable';

export const VanKaalPortalPage = () => {
  return (
    <div className="min-h-screen bg-[#0E0D0B] text-slate-100 font-sans antialiased relative overflow-x-hidden selection:bg-[#EEB057] selection:text-[#0E0D0B]">
      {/* Vankaal Ambient Gold Radial Glows */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(238,176,87,0.12)_0%,rgba(14,13,11,0)_70%)] pointer-events-none -z-10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(238,176,87,0.06)_0%,rgba(14,13,11,0)_70%)] pointer-events-none -z-10 blur-2xl"
      />

      {/* Header */}
      <VanKaalHeader />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Vankaal Hero Eyebrow & Headline */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEB057]/10 text-[#EEB057] border border-[#EEB057]/30 text-[11px] font-mono tracking-widest uppercase mb-3">
            <span>⚡ Autonomous Intelligence // Enterprise AI &amp; IVR Telemetry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Intelligent Technology{' '}
            <span className="bg-gradient-to-r from-white via-[#EEB057] to-[#FFC978] bg-clip-text text-transparent">
              for Modern Healthcare.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl font-serif leading-relaxed">
            Van-Kaal turns business complexity into intelligent action. Real-time mission control for Twilio carrier transit costs, contractual partner billing, and distributed Redis BullMQ queue telemetry.
          </p>
        </div>

        {/* Financial & Metered Volume Engine (FINAI) */}
        <VanKaalRevenueCards />

        {/* BullMQ Redis Distributed Queue & Worker Telemetry (VoxKaal) */}
        <VanKaalQueueMonitor />

        {/* B2B Clients / Tenants Metered Invoicing Table (UniteKaal) */}
        <VanKaalTenantTable />
      </main>

      {/* Vankaal Official Sovereign Footer */}
      <footer className="border-t border-[#EEB057]/20 bg-[#0A0908] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">VAN-KAAL TECHNOLOGIES</span>
            <span>•</span>
            <span className="text-[#EEB057]">Sovereign AI Suite</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">HIPAA Boundary: Zero PHI Stored in Telemetry</span>
            <span>•</span>
            <span className="text-[#EEB057]">All Systems Nominal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
