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
  raw_status?: string;
  patient_response?: {
    channel: 'SMS Reply' | 'Voice DTMF' | 'Secure Link';
    response: 'confirmed' | 'cancelled';
    received_at: string;
  };
  webhook_status: 'Delivered' | 'Pending' | 'Failed';
  billing?: {
    billed_amount: number;
    channel_type: string;
    vapi_cost: number;
    net_profit: number;
    margin_percent: string;
  };
}

export interface VanKaalMetrics {
  smsCount: number;
  voiceCalls: number;
  totalRequests: number;
  totalB2BInvoice: number;
  totalCost: number;
  totalTwilioCost: number;
  netMargin: number;
  marginPercent: string;
  billingRateSms: number;
  billingRateVoice: number;
  costRateVoice: number;
  costRateSms: number;
  vapiBreakdown?: {
    llmGpt4o: number;
    vapiPlatform: number;
    ttsVoice: number;
    sttDeepgram: number;
  };
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
