import { useState, useEffect } from 'react';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import type { Appointment, CurrentUser, UserRole } from './types/appointment';

const DEFAULT_OPERATIONAL_DATA: Appointment[] = [
  {
    appointment_id: 'APT-101',
    patient: { name: 'J. Anderson', phone: '+14155551234' },
    time: '9:30',
    appointment_time: '2026-09-18T09:30:00Z',
    timezone: 'America/New_York',
    doctor: 'Dr. Smith',
    practice: 'Downtown Health',
    status: 'Confirmed',
    reminderStatus: 'Delivered',
    reminders: {
      smsStatus: 'Delivered',
      ivrStatus: 'Delivered',
      smsScheduledAt: '2026-09-18T08:30:00Z',
      smsDeliveredAt: '2026-09-18T08:30:15Z'
    },
    patient_response: {
      channel: 'SMS Reply',
      response: 'confirmed',
      received_at: '2026-09-18T08:32:00Z'
    }
  },
  {
    appointment_id: 'APT-102',
    patient: { name: 'M. Williams', phone: '+14155555678' },
    time: '10:15',
    appointment_time: '2026-09-18T10:15:00Z',
    timezone: 'America/New_York',
    doctor: 'Dr. Lee',
    practice: 'Westside Clinic',
    status: 'Pending',
    reminderStatus: 'Pending',
    reminders: {
      smsStatus: 'Pending',
      ivrStatus: 'Scheduled',
      smsScheduledAt: '2026-09-18T09:15:00Z'
    }
  },
  {
    appointment_id: 'APT-103',
    patient: { name: 'R. Johnson', phone: '+14155558765' },
    time: '11:00',
    appointment_time: '2026-09-18T11:00:00Z',
    timezone: 'America/New_York',
    doctor: 'Dr. Smith',
    practice: 'Downtown Health',
    status: 'At Risk',
    reminderStatus: 'Failed',
    reminders: {
      smsStatus: 'Failed',
      ivrStatus: 'Failed'
    }
  }
];

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_OPERATIONAL_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    name: 'Sarah Smith',
    role: 'Admin',
    practiceId: 'practice_001'
  });

  const fetchLiveAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/v1/appointments');
      if (!response.ok) {
        throw new Error('Endpoint not responding');
      }
      const json = await response.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        setAppointments(json.data);
      }
      setError(null);
    } catch {
      setError('Unable to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAppointments();
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role: newRole }));
  };

  return (
    <DashboardLayout
      appointments={appointments}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchLiveAppointments}
      currentUser={currentUser}
      onRoleChange={handleRoleChange}
    />
  );
}
