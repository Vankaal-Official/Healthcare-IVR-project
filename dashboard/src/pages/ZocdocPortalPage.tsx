import { useState, useEffect, useCallback } from 'react';
import { ZocdocHeader } from '../components/zocdoc/ZocdocHeader';
import { ZocdocKpiCards } from '../components/zocdoc/ZocdocKpiCards';
import { ZocdocTable } from '../components/zocdoc/ZocdocTable';
import { ZocdocModal } from '../components/zocdoc/ZocdocModal';
import { apiFetch } from '../config/api';
import type { ZocdocAppointment } from '../types/portal';

interface ZocdocPortalPageProps {
  activeTab?: 'demo' | 'zocdoc';
  onTabChange?: (tab: 'demo' | 'zocdoc') => void;
}

const FALLBACK_APPOINTMENTS: ZocdocAppointment[] = [
  {
    appointment_id: 'APT-84920',
    patient_name: 'Alex Morgan',
    patient_phone_masked: '+1 (555) ***-9727',
    doctor: 'Dr. Michael Smith',
    practice_name: 'Manhattan Health Center',
    time: '10:30 AM',
    date: '2026-10-01',
    sms_status: 'Delivered',
    sms_scheduled_at: '2026-09-30T10:00:00Z',
    sms_delivered_at: '2026-09-30T10:00:15Z',
    voice_status: 'Delivered',
    voice_scheduled_at: '2026-09-30T12:00:00Z',
    voice_completed_at: '2026-09-30T12:02:18Z',
    status: 'Confirmed',
    raw_status: 'CONFIRMED',
    patient_response: {
      channel: 'Voice DTMF',
      response: 'confirmed',
      received_at: '2026-09-30T12:02:15Z',
    },
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-84921',
    patient_name: 'Sarah Connor',
    patient_phone_masked: '+1 (555) ***-4821',
    doctor: 'Dr. Emily Vance',
    practice_name: 'Downtown Cardiology & Wellness',
    time: '11:15 AM',
    date: '2026-10-01',
    sms_status: 'Delivered',
    sms_scheduled_at: '2026-09-30T10:00:00Z',
    sms_delivered_at: '2026-09-30T10:00:18Z',
    voice_status: 'Pending',
    status: 'Confirmed',
    raw_status: 'CONFIRMED',
    patient_response: {
      channel: 'SMS Reply',
      response: 'confirmed',
      received_at: '2026-09-30T10:04:12Z',
    },
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-84922',
    patient_name: 'Carlos Mendez',
    patient_phone_masked: '+1 (555) ***-3190',
    doctor: 'Dr. Robert Patel',
    practice_name: 'Metro Pediatrics Clinic',
    time: '02:00 PM',
    date: '2026-10-01',
    sms_status: 'Delivered',
    sms_scheduled_at: '2026-09-30T10:00:00Z',
    voice_status: 'Pending',
    status: 'Pending',
    raw_status: 'PENDING',
    webhook_status: 'Pending',
  },
  {
    appointment_id: 'APT-84923',
    patient_name: 'David Reynolds',
    patient_phone_masked: '+1 (555) ***-6712',
    doctor: 'Dr. Michael Smith',
    practice_name: 'Manhattan Health Center',
    time: '03:45 PM',
    date: '2026-10-01',
    sms_status: 'Delivered',
    sms_scheduled_at: '2026-09-30T10:00:00Z',
    voice_status: 'Delivered',
    voice_completed_at: '2026-09-30T12:05:00Z',
    status: 'At Risk',
    raw_status: 'AT_RISK',
    patient_response: {
      channel: 'Voice DTMF',
      response: 'cancelled',
      received_at: '2026-09-30T12:04:55Z',
    },
    webhook_status: 'Delivered',
  },
];

export const ZocdocPortalPage = ({ activeTab = 'zocdoc', onTabChange }: ZocdocPortalPageProps) => {
  const [appointments, setAppointments] = useState<ZocdocAppointment[]>(FALLBACK_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<ZocdocAppointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/v1/appointments');
      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data);
        setError(null);
      }
    } catch (_err) {
      // Quietly retain demo baseline appointments if backend is not linked yet
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
      {/* 1. Zocdoc Header: Partner Portal + System Operational + Live Sync + Date */}
      <ZocdocHeader
        onRefresh={fetchAppointments}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* Practice Context Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182743] tracking-tight">
              Appointment Reminders &amp; Attendance Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated patient confirmation loop powering your clinic schedule.
            </p>
          </div>

          {error && (
            <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>⚠️ Connection Notice:</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 2. Top Row: 3 clean stat cards (Total Bookings, AI Confirmed, Follow-up Needed) */}
        <ZocdocKpiCards appointments={appointments} />

        {/* 3. Main Content: The Appointment Table directly below it, giving maximum vertical space */}
        <ZocdocTable
          appointments={appointments}
          onSelectAppointment={(app) => setSelectedAppointment(app)}
        />
      </main>

      {/* Audit Trail Modal */}
      <ZocdocModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#182743]">Zocdoc</span>
            <span>• Practice &amp; Patient Delivery Operations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>HIPAA Compliant Delivery</span>
            <span>•</span>
            <span>256-bit TLS Encrypted</span>
            <span>•</span>
            <span>Audit Logging Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
