import React, { useState } from 'react';
import type { Appointment, UserRole, CurrentUser } from '../../types/appointment';
import { AppointmentDetailModal } from '../appointments/AppointmentDetailModal';
import { 
  LayoutDashboard, Calendar, Bell, MessageSquare, PhoneCall, 
  BarChart3, Receipt, Sliders, Users, Settings, Search, 
  Clock, Check, AlertCircle, RefreshCw, RotateCcw, Key, 
  ShieldCheck, UserPlus, Eye
} from 'lucide-react';

interface Props {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  currentUser: CurrentUser;
  onRoleChange: (role: UserRole) => void;
}

type ActiveTab = 
  | 'dashboard' | 'appointments' | 'reminders' | 'sms' 
  | 'voice' | 'analytics' | 'billing' | 'integrations' 
  | 'team' | 'settings';

export const DashboardLayout: React.FC<Props> = ({
  appointments,
  isLoading,
  error,
  onRefresh,
  currentUser,
  onRoleChange
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser.role === 'Admin';
  const isReadOnly = currentUser.role === 'Read-Only';
  const hasBillingAccess = currentUser.role === 'Admin';

  // Safeguard: re-route if permission is revoked
  if (!isAdmin && (activeTab === 'integrations' || activeTab === 'team' || activeTab === 'settings')) {
    setActiveTab('dashboard');
  }
  if (!hasBillingAccess && activeTab === 'billing') {
    setActiveTab('dashboard');
  }

  const filteredAppointments = appointments.filter(apt => 
    apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    atRisk: appointments.filter(a => a.status === 'At Risk').length,
    confirmedRate: appointments.length ? Math.round((appointments.filter(a => a.status === 'Confirmed').length / appointments.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Tenant / Client Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                +
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight tracking-tight">[CLIENT LOGO]</h2>
                <p className="text-[11px] text-slate-500 font-medium">Healthcare Operations</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 text-xs">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overview</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'appointments' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Calendar className="w-4 h-4" /> Appointments
                </button>
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Communications</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'reminders' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Bell className="w-4 h-4" /> Reminders
                </button>
                <button
                  onClick={() => setActiveTab('sms')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'sms' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <MessageSquare className="w-4 h-4" /> SMS
                </button>
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'voice' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <PhoneCall className="w-4 h-4" /> Voice / IVR
                </button>
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Insights</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <BarChart3 className="w-4 h-4" /> Analytics
                </button>
                {hasBillingAccess && (
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'billing' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Receipt className="w-4 h-4" /> Usage & Billing
                  </button>
                )}
              </nav>
            </div>

            {/* Admin Section: Restricted strictly to Administrator role */}
            {isAdmin && (
              <div>
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Admin</p>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">RBAC</span>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('integrations')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'integrations' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Sliders className="w-4 h-4" /> Integrations
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'team' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Users className="w-4 h-4" /> Team & Access
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Operational
          </span>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-base font-bold text-slate-900">Good morning, {currentUser.name}</h1>
            <p className="text-xs text-slate-500">Friday, September 18, 2026</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Contextual Connection Health */}
            {!error ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Live Connection
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Connection Degraded
              </span>
            )}

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Authenticated User & Actual Role Indicator */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                SS
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-6xl w-full mx-auto pb-24">
          {/* Client-facing Error State */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="font-semibold text-rose-900">Unable to load appointments</p>
                <p className="text-rose-700 mt-0.5">We couldn't retrieve the latest appointment data from the service.</p>
              </div>
              <button 
                onClick={onRefresh} 
                className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold rounded-lg text-xs transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 block">Appointments Today</span>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
                </div>

                {/* Confirmed Rate Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 block">Confirmed Rate</span>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.confirmedRate}%</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{stats.confirmed} of {stats.total} appointments</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 block">At Risk Attention</span>
                  <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.atRisk}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Requires follow-up</p>
                </div>
              </div>

              {/* Today's Appointments Mini Queue */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-slate-900">Today's Appointments</h2>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Time</th>
                        <th className="px-6 py-3">Patient</th>
                        <th className="px-6 py-3">Provider</th>
                        <th className="px-6 py-3">Reminder</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.appointment_id} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-3.5 text-slate-700">{apt.time}</td>
                          <td className="px-6 py-3.5 text-slate-900 font-semibold">{apt.patient.name}</td>
                          <td className="px-6 py-3.5 text-slate-600">{apt.doctor}</td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              {apt.reminderStatus === 'Delivered' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              {apt.reminderStatus === 'Pending' && <Clock className="w-3.5 h-3.5 text-blue-500" />}
                              {apt.reminderStatus === 'Failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                              {apt.reminderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              apt.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedApt(apt)}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">Reminder Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">SMS Delivery</span>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">96.8% Delivered</p>
                    </div>
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Voice / IVR Completion</span>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">91.4% Completed</p>
                    </div>
                    <PhoneCall className="w-5 h-5 text-violet-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-bold text-slate-900">Appointments Management</h2>
                <p className="text-xs text-slate-500">Search and review patient schedules across affiliated practices</p>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Practice</th>
                    <th className="px-4 py-3">Reminder</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt.appointment_id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-600">Sep 18</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{apt.patient.name}</td>
                      <td className="px-4 py-3 text-slate-600">{apt.doctor}</td>
                      <td className="px-4 py-3 text-slate-600">{apt.practice}</td>
                      <td className="px-4 py-3">{apt.reminderStatus}</td>
                      <td className="px-4 py-3 font-semibold">{apt.status}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelectedApt(apt)} className="text-indigo-600 font-semibold hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: REMINDERS (QUEUE OVERVIEW) */}
          {activeTab === 'reminders' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Reminder Queue</h2>
                <p className="text-xs text-slate-500">Active communication workflows: Queued → Processing → Sent → Delivered / Failed</p>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Appointment</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Scheduled Lead</th>
                    <th className="px-4 py-3">Delivery Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold">APT-101</td>
                    <td className="px-4 py-3">SMS</td>
                    <td className="px-4 py-3">8:30 AM (T-60)</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">Delivered</td>
                    <td className="px-4 py-3 text-right text-slate-400">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold">APT-103</td>
                    <td className="px-4 py-3">SMS</td>
                    <td className="px-4 py-3">10:00 AM (T-60)</td>
                    <td className="px-4 py-3 text-rose-600 font-semibold">Failed</td>
                    <td className="px-4 py-3 text-right">
                      {isReadOnly ? (
                        <span className="text-slate-400 inline-flex items-center gap-1"><Eye className="w-3 h-3" /> View Only</span>
                      ) : (
                        <button className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline">
                          <RotateCcw className="w-3 h-3" /> Retry
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: SMS MESSAGES */}
          {activeTab === 'sms' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">SMS Messages</h2>
                <p className="text-xs text-slate-500">Outbound notifications, provider carrier acknowledgments, and patient replies</p>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Appointment</th>
                    <th className="px-4 py-3">Sent</th>
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3">Patient Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">J. Anderson</td>
                    <td className="px-4 py-3">9:30 AM</td>
                    <td className="px-4 py-3 text-slate-500">8:30 AM</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">Delivered</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold">CONFIRMED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: VOICE / IVR */}
          {activeTab === 'voice' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Voice / IVR Telephony</h2>
                <p className="text-xs text-slate-500">Interactive voice call sessions and patient keypad acknowledgments</p>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Call Status</th>
                    <th className="px-4 py-3">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">J. Anderson</td>
                    <td className="px-4 py-3 text-slate-500">9:00 AM</td>
                    <td className="px-4 py-3">42 sec</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">Completed</td>
                    <td className="px-4 py-3 font-mono">Pressed 1 (Confirmed)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Attendance & Confirmation Overview</h2>
                    <p className="text-xs text-slate-500">No-show reduction target: 25–35% (Baseline evaluation underway)</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">Target: 25–35%</span>
                </div>
                <div className="h-44 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 text-xs">
                  [Historical Attendance & Verification Trend Line]
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: USAGE & BILLING (ZERO PHI) */}
          {activeTab === 'billing' && hasBillingAccess && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Usage & Billing Metering</h2>
                <p className="text-xs text-slate-500">Resource metrics retrieved via /v1/usage (Contains no ePHI or patient identifiers)</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">SMS Segments</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">12,480</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Voice Minutes</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">842</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Practices</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Current Bill</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">$349.50</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: INTEGRATIONS (ADMIN ONLY) */}
          {activeTab === 'integrations' && isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">API & Webhook Integrations</h2>
                <p className="text-xs text-slate-500">Authorized credentials for source booking engine</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" /> API Access Key
                    </span>
                    <button className="text-indigo-600 font-semibold hover:underline">Regenerate</button>
                  </div>
                  <input 
                    type="password" 
                    readOnly 
                    value="vk_live_98234871239847129384" 
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded font-mono text-slate-600"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Webhook Receiver
                    </span>
                    <span className="text-emerald-700 font-semibold">● Active</span>
                  </div>
                  <input 
                    type="text" 
                    readOnly 
                    value="https://client-system.com/webhooks/vankaal" 
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded font-mono text-slate-600"
                  />
                  <div className="pt-2">
                    <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition">
                      Send Test Webhook
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: TEAM & ACCESS (ADMIN ONLY) */}
          {activeTab === 'team' && isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Team & Access Permissions</h2>
                  <p className="text-xs text-slate-500">Workforce authorization and MFA compliance status</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition">
                  <UserPlus className="w-3.5 h-3.5" /> Invite Member
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">MFA</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">Sarah Smith</td>
                    <td className="px-4 py-3">Administrator</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">Enabled</td>
                    <td className="px-4 py-3">Active</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">John Lee</td>
                    <td className="px-4 py-3">Practice Staff</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">Enabled</td>
                    <td className="px-4 py-3">Active</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">Emily Brown</td>
                    <td className="px-4 py-3">Read-Only</td>
                    <td className="px-4 py-3 text-slate-400">—</td>
                    <td className="px-4 py-3">Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 10: SETTINGS (ADMIN ONLY) */}
          {activeTab === 'settings' && isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6 text-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Reminder Schedule & Practice Policies</h2>
                <p className="text-slate-500 mt-0.5">Automated dispatch rules and regional timezone configurations</p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="font-semibold text-slate-900 block mb-1">SMS Trigger Timing</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700">
                    <option>60 minutes before appointment (Default)</option>
                    <option>120 minutes before appointment</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-900 block mb-1">Voice / IVR Call Timing</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700">
                    <option>30 minutes before appointment (Default)</option>
                    <option>45 minutes before appointment</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-900 block mb-1">Practice Timezone</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700">
                    <option>America/New_York (Eastern Time)</option>
                    <option>America/Chicago (Central Time)</option>
                    <option>America/Denver (Mountain Time)</option>
                    <option>America/Los_Angeles (Pacific Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Demo Role Simulator (Quarantined for Dev / Presentation Demo) */}
      <aside aria-label="Development Utility" className="fixed bottom-4 right-6 bg-slate-900/90 backdrop-blur-sm text-white px-3.5 py-2 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 z-40 text-xs">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Demo Preview:</span>
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          {(['Admin', 'Practice Staff', 'Read-Only'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                currentUser.role === r 
                  ? 'bg-indigo-600 text-white font-semibold' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </aside>

      <AppointmentDetailModal appointment={selectedApt} onClose={() => setSelectedApt(null)} currentUserRole={currentUser.role} />
    </div>
  );
};
