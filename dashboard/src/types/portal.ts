export type AppointmentStatus = 'Confirmed' | 'Pending' | 'At Risk' | 'Cancelled';
export type DeliveryStatus = 'Delivered' | 'Pending' | 'Failed' | 'Skipped';
export type ChannelType = 'SMS' | 'Voice / IVR';

export interface ZocdocAppointment {
  appointment_id: string;
  patient_name: string;
  patient_phone_masked: string;
  doctor: string;
  practice_name: string;
  time: string;
  date: string;
  sms_status: DeliveryStatus;
  sms_scheduled_at: string;
  sms_delivered_at?: string;
  voice_status: DeliveryStatus;
  voice_scheduled_at?: string;
  voice_completed_at?: string;
  status: AppointmentStatus;
  patient_response?: {
    channel: 'SMS Reply' | 'Voice DTMF' | 'Secure Link';
    response: 'confirmed' | 'cancelled';
    received_at: string;
  };
  webhook_status: 'Delivered' | 'Pending' | 'Failed';
}

export interface VanKaalMetrics {
  total_api_requests: number;
  sms_segments_used: number;
  voice_minutes_used: number;
  estimated_zocdoc_bill: number;
  twilio_infra_cost: number;
  gross_margin_usd: number;
  gross_margin_percent: number;
  queue_delayed_jobs: number;
  queue_active_workers: number;
  p95_latency_ms: number;
  error_rate_percent: number;
  postgres_pool_active: number;
  postgres_pool_max: number;
}

export interface PartnerTenant {
  tenant_id: string;
  name: string;
  slug: string;
  practices_count: number;
  api_calls_mtd: number;
  reminders_mtd: number;
  current_bill_usd: number;
  status: 'Active' | 'Testing' | 'Suspended';
  api_key_prefix: string;
  webhook_url: string;
  webhook_latency_ms: number;
  webhook_success_rate: number;
}
