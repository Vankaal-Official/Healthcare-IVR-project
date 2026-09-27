import { useState, useEffect, useCallback } from 'react';
import { ZocdocHeader } from '../components/zocdoc/ZocdocHeader';
import { ZocdocKpiCards } from '../components/zocdoc/ZocdocKpiCards';
import { ZocdocTable } from '../components/zocdoc/ZocdocTable';
import { ZocdocModal } from '../components/zocdoc/ZocdocModal';
import { ZocdocLogin } from '../components/zocdoc/ZocdocLogin';
import { apiFetch } from '../config/api';
import type { ZocdocAppointment } from '../types/portal';

interface ZocdocPortalPageProps {
  activeTab?: 'demo' | 'zocdoc';
  onTabChange?: (tab: 'demo' | 'zocdoc') => void;
}

export const ZocdocPortalPage = ({ activeTab = 'zocdoc', onTabChange }: ZocdocPortalPageProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('zocdoc_auth') === 'true';
  });

  const [staffUser, setStaffUser] = useState<{ name: string; email: string; practice: string } | null>(() => {
    const saved = localStorage.getItem('zocdoc_staff_user');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Front Desk Staff',
          email: 'reception@manhattanhealth.org',
          practice: 'Manhattan Health Center',
        };
  });

  const [appointments, setAppointments] = useState<ZocdocAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<ZocdocAppointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (user: { name: string; email: string; practice: string }) => {
    setIsAuthenticated(true);
    setStaffUser(user);
    localStorage.setItem('zocdoc_auth', 'true');
    localStorage.setItem('zocdoc_staff_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('zocdoc_auth');
  };

  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await apiFetch('/v1/appointments');
      if (Array.isArray(data)) {
        setAppointments(data);
        setError(null);
      }
    } catch (_err) {
      // Backend not linked yet or empty
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAppointments();
    const interval = setInterval(() => {
      // Only poll when the user is actively viewing this tab and logged in
      if (document.visibilityState === 'visible') {
        fetchAppointments();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchAppointments, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
      {/* 1. Zocdoc Header: Partner Portal + System Operational + Navigation + Staff Info */}
      <ZocdocHeader
        onRefresh={fetchAppointments}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isAuthenticated={isAuthenticated}
        staffUser={staffUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      {!isAuthenticated ? (
        <ZocdocLogin onLogin={handleLogin} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 animate-fade-in">
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

          {/* 3. Main Content: The Appointment Table directly below it */}
          <ZocdocTable
            appointments={appointments}
            onSelectAppointment={(app) => setSelectedAppointment(app)}
          />
        </main>
      )}

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
            <span>256-bit TLS Encrypted</span>
            <span>•</span>
            <span>Audit Logging Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
