export type UserRole = 'Admin' | 'Practice Staff' | 'Read-Only';

export interface CurrentUser {
  name: string;
  role: UserRole;
  practiceId: string;
}

export type FinalStatus = 'Confirmed' | 'Pending' | 'At Risk' | 'Cancelled';
export type ReminderDeliveryStatus = 'Delivered' | 'Pending' | 'Failed' | 'Scheduled';

export interface PatientContact {
  name: string;
  phone: string;
}

export interface ReminderWorkflow {
  smsStatus: ReminderDeliveryStatus;
  ivrStatus: ReminderDeliveryStatus;
  smsScheduledAt?: string;
  smsDeliveredAt?: string;
  ivrCompletedAt?: string;
}

export interface Appointment {
  appointment_id: string;
  patient: PatientContact;
  time: string;
  appointment_time: string;
  timezone: string;
  doctor: string;
  practice: string;
  status: FinalStatus;
  reminderStatus: ReminderDeliveryStatus;
  reminders: ReminderWorkflow;
  patient_response?: {
    channel: string;
    response: string;
    received_at: string;
  };
}
