import React from 'react';
import { AppointmentStatus, ReminderStatus } from '../../types/appointment';

export const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const styles: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Scheduled' },
    late_booking: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Late Booking' },
    confirmed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Confirmed' },
    at_risk: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', label: 'At Risk' },
    cancelled: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Cancelled' },
    too_late: { bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-600', label: 'Too Late' },
  };

  const current = styles[status] || styles.scheduled;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text}`}>
      {current.label}
    </span>
  );
};

export const ReminderBadge: React.FC<{ type: 'sms' | 'ivr'; status: ReminderStatus }> = ({ type, status }) => {
  const badgeMap: Record<ReminderStatus, { bg: string; text: string }> = {
    pending: { bg: 'bg-zinc-100', text: 'text-zinc-600' },
    queued: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    sent: { bg: 'bg-sky-50', text: 'text-sky-700' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    failed: { bg: 'bg-rose-50', text: 'text-rose-700' },
    skipped: { bg: 'bg-zinc-100', text: 'text-zinc-400' },
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${badgeMap[status].bg} ${badgeMap[status].text}`}>
      <span>{type}:</span>
      <span>{status}</span>
    </span>
  );
};
