import type { PartnerTenant } from '../../types/portal';

const SAMPLE_TENANTS: PartnerTenant[] = [
  {
    tenant_id: 'ten_zocdoc_prod_us',
    name: 'Zocdoc Inc. (US East Cluster)',
    slug: 'zocdoc-prod',
    practices_count: 312,
    api_calls_mtd: 85420,
    reminders_mtd: 77300,
    current_bill_usd: 4285.00,
    status: 'Active',
    api_key_prefix: 'vk_live_89f02...',
    webhook_url: 'https://api.zocdoc.com/v2/reminders/callback',
    webhook_latency_ms: 142,
    webhook_success_rate: 99.98,
  },
  {
    tenant_id: 'ten_zocdoc_sandbox',
    name: 'Zocdoc Staging / QA Environment',
    slug: 'zocdoc-stage',
    practices_count: 14,
    api_calls_mtd: 3410,
    reminders_mtd: 2890,
    current_bill_usd: 172.50,
    status: 'Testing',
    api_key_prefix: 'vk_test_21a48...',
    webhook_url: 'https://stage-api.zocdoc.com/v2/reminders/callback',
    webhook_latency_ms: 165,
    webhook_success_rate: 99.4,
  },
  {
    tenant_id: 'ten_healthfirst_pilot',
    name: 'HealthFirst Pilot Network',
    slug: 'healthfirst-pilot',
    practices_count: 22,
    api_calls_mtd: 1240,
    reminders_mtd: 1100,
    current_bill_usd: 62.00,
    status: 'Testing',
    api_key_prefix: 'vk_test_90b11...',
    webhook_url: 'https://pilot.healthfirst.org/api/webhooks',
    webhook_latency_ms: 210,
    webhook_success_rate: 100.0,
  },
];

export const VanKaalTenantTable = () => {
  return (
    <div className="bg-[#151310] border border-[#EEB057]/20 rounded-2xl shadow-xl overflow-hidden mb-12">
      {/* Table Header */}
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#EEB057] font-bold tracking-widest">
            // UniteKaal Enterprise Mesh
          </div>
          <h3 className="text-base font-bold text-white tracking-wide mt-0.5">
            B2B Client Tenants &amp; Metered Invoicing
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active healthcare partners consuming Van-Kaal Healthcare API endpoints
          </p>
        </div>

        <button
          onClick={() => alert('Add Tenant modal will be available in next release')}
          className="px-4 py-2 bg-[#EEB057] hover:bg-[#ffc978] text-[#0E0D0B] rounded-xl text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-[#EEB057]/20 transition-all cursor-pointer self-start md:self-auto"
        >
          + Provision New Client Key
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#0F0E0B] border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">B2B Partner &amp; Tenant ID</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">API Key Prefix</th>
              <th className="py-3.5 px-6">MTD Traffic</th>
              <th className="py-3.5 px-6">Webhook Delivery SLA</th>
              <th className="py-3.5 px-6 text-right">Invoiced MTD</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {SAMPLE_TENANTS.map((tenant) => (
              <tr key={tenant.tenant_id} className="hover:bg-white/[0.02] transition-colors">
                {/* Partner Name & Tenant ID */}
                <td className="py-4 px-6">
                  <div className="font-bold text-white">{tenant.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {tenant.tenant_id} • {tenant.practices_count} connected practices
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                      tenant.status === 'Active'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-[#EEB057]/10 text-[#EEB057] border border-[#EEB057]/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        tenant.status === 'Active' ? 'bg-emerald-400' : 'bg-[#EEB057]'
                      }`}
                    ></span>
                    {tenant.status}
                  </span>
                </td>

                {/* API Key */}
                <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-300">
                  <span className="bg-[#1C1813] px-2 py-1 rounded border border-[#EEB057]/20">
                    {tenant.api_key_prefix}
                  </span>
                </td>

                {/* Traffic */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="font-mono text-white font-semibold">
                    {tenant.api_calls_mtd.toLocaleString()} calls
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {tenant.reminders_mtd.toLocaleString()} reminders
                  </div>
                </td>

                {/* Webhook SLA */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#EEB057]">
                      {tenant.webhook_success_rate}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({tenant.webhook_latency_ms}ms)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px] mt-0.5">
                    {tenant.webhook_url}
                  </div>
                </td>

                {/* Invoiced MTD */}
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="font-mono font-bold text-[#EEB057] text-sm">
                    ${tenant.current_bill_usd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Contract billing</div>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <button
                    onClick={() => alert(`Rotated API Key for ${tenant.name}`)}
                    className="px-2.5 py-1 bg-[#1C1813] hover:bg-[#EEB057]/20 text-[#EEB057] border border-[#EEB057]/30 rounded text-xs font-mono transition-colors cursor-pointer"
                  >
                    Rotate Key
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
