import { useState } from 'react';
import { ZocdocHeader } from '../components/zocdoc/ZocdocHeader';
import { ZocdocKpiCards } from '../components/zocdoc/ZocdocKpiCards';
import { ZocdocPipeline } from '../components/zocdoc/ZocdocPipeline';
import { ZocdocAlerts } from '../components/zocdoc/ZocdocAlerts';
import { ZocdocTable } from '../components/zocdoc/ZocdocTable';
import { ZocdocModal } from '../components/zocdoc/ZocdocModal';
import type { ZocdocAppointment } from '../types/portal';

const INITIAL_APPOINTMENTS: ZocdocAppointment[] = [
  {
    appointment_id: 'APT-98214',
    patient_name: 'Eleanor Vance',
    patient_phone_masked: '+1 (555) •••-9012',
    doctor: 'Dr. Sarah Jenkins, MD',
    practice_name: 'Metro Health Cardiology',
    time: '09:30 AM',
    date: 'Today',
    sms_status: 'Delivered',
    sms_scheduled_at: 'Yesterday 09:30 AM',
    sms_delivered_at: 'Yesterday 09:30 AM',
    voice_status: 'Skipped',
    status: 'Confirmed',
    patient_response: {
      channel: 'SMS Reply',
      response: 'confirmed',
      received_at: 'Yesterday 09:34 AM',
    },
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-98215',
    patient_name: 'Marcus Holloway',
    patient_phone_masked: '+1 (555) •••-4389',
    doctor: 'Dr. David Cho, DDS',
    practice_name: 'Bayview Smiles Dental',
    time: '10:15 AM',
    date: 'Today',
    sms_status: 'Delivered',
    sms_scheduled_at: 'Yesterday 10:15 AM',
    sms_delivered_at: 'Yesterday 10:15 AM',
    voice_status: 'Delivered',
    voice_completed_at: 'Today 08:15 AM',
    status: 'Confirmed',
    patient_response: {
      channel: 'Voice DTMF',
      response: 'confirmed',
      received_at: 'Today 08:16 AM',
    },
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-98216',
    patient_name: 'Sophia Patel',
    patient_phone_masked: '+1 (555) •••-1123',
    doctor: 'Dr. Elena Rostova, MD',
    practice_name: 'Allied Pediatrics NYC',
    time: '11:00 AM',
    date: 'Today',
    sms_status: 'Delivered',
    sms_scheduled_at: 'Yesterday 11:00 AM',
    sms_delivered_at: 'Yesterday 11:00 AM',
    voice_status: 'Pending',
    status: 'Pending',
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-98217',
    patient_name: 'Arthur Pendelton',
    patient_phone_masked: '+1 (555) •••-7704',
    doctor: 'Dr. Kevin Hartwell, MD',
    practice_name: 'Orthopedic Spine Specialists',
    time: '11:45 AM',
    date: 'Today',
    sms_status: 'Failed',
    sms_scheduled_at: 'Yesterday 11:45 AM',
    voice_status: 'Delivered',
    status: 'At Risk',
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-98218',
    patient_name: 'Chloe Bennett',
    patient_phone_masked: '+1 (555) •••-8821',
    doctor: 'Dr. Rachel Green, DO',
    practice_name: 'Greenwich Family Medicine',
    time: '01:30 PM',
    date: 'Today',
    sms_status: 'Delivered',
    sms_scheduled_at: 'Yesterday 01:30 PM',
    sms_delivered_at: 'Yesterday 01:30 PM',
    voice_status: 'Skipped',
    status: 'Confirmed',
    patient_response: {
      channel: 'Secure Link',
      response: 'confirmed',
      received_at: 'Yesterday 02:10 PM',
    },
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-98219',
    patient_name: 'Jonathan Sterling',
    patient_phone_masked: '+1 (555) •••-3094',
    doctor: 'Dr. Sarah Jenkins, MD',
    practice_name: 'Metro Health Cardiology',
    time: '02:15 PM',
    date: 'Today',
    sms_status: 'Delivered',
    sms_scheduled_at: 'Yesterday 02:15 PM',
    sms_delivered_at: 'Yesterday 02:15 PM',
    voice_status: 'Skipped',
    status: 'Confirmed',
    patient_response: {
      channel: 'SMS Reply',
      response: 'confirmed',
      received_at: 'Yesterday 02:22 PM',
    },
    webhook_status: 'Delivered',
  },
  {
    appointment_id: 'APT-98220',
    patient_name: 'Camila Rodriguez',
    patient_phone_masked: '+1 (555) •••-5561',
    doctor: 'Dr. Elena Rostova, MD',
    practice_name: 'Allied Pediatrics NYC',
    time: '03:45 PM',
    date: 'Today',
    sms_status: 'Delivered',
    sms_scheduled_at: 'Yesterday 03:45 PM',
    sms_delivered_at: 'Yesterday 03:45 PM',
    voice_status: 'Pending',
    status: 'Pending',
    webhook_status: 'Delivered',
  },
];

export const ZocdocPortalPage = () => {
  const [appointments] = useState<ZocdocAppointment[]>(INITIAL_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<ZocdocAppointment | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
      {/* Zocdoc Official Header */}
      <ZocdocHeader />

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome / Practice Context */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182743] tracking-tight">
            Appointment Reminders & Status Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated 2-way SMS and Voice confirmation engine powering your booked clinic appointments.
          </p>
        </div>

        {/* Actionable alerts for reception staff */}
        <ZocdocAlerts />

        {/* 4 Core KPIs: Total Bookings, Confirmed %, Unreachable, No-show reduction */}
        <ZocdocKpiCards appointments={appointments} />

        {/* Communication Pipeline Status */}
        <ZocdocPipeline />

        {/* Live Appointments Roster */}
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
            <span>• Practice & Patient Delivery Operations</span>
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
