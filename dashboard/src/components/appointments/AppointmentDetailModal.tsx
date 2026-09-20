import React from 'react';
import type { Appointment, UserRole } from '../../types/appointment';
import { 
  X, Calendar, Clock, User, Phone, Stethoscope, Building2, 
  MessageSquare, PhoneCall, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, RotateCcw
} from 'lucide-react';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
  currentUserRole?: UserRole;
}

export const AppointmentDetailModal: React.FC<Props> = ({ 
  appointment, 
  onClose,
  currentUserRole = 'Practice Staff'
}) => {
  if (!appointment) return null;

  const isReadOnly = currentUserRole === 'Read-Only';
  const hasResponse = Boolean(appointment.patient_response);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
              {appointment.appointment_id}
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Appointment & Reminder Lifecycle
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* 4-STAGE LIFECYCLE STEPPER */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              End-to-End Workflow Stages
            </p>
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              
              {/* Stage 1: Appointment */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 block">1. Appointment</span>
                <p className="font-bold text-slate-900 leading-tight">Scheduled</p>
                <p className="text-[11px] text-slate-500">{appointment.time} ({appointment.timezone.split('/')[1] || 'Local'})</p>
              </div>

              {/* Stage 2: Reminders */}
              <div className="space-y-1 border-l border-slate-200 pl-3">
                <span className="text-[10px] font-bold text-indigo-600 block">2. Reminders</span>
                <p className="font-bold text-slate-900 leading-tight">
                  SMS: {appointment.reminders.smsStatus}
                </p>
                <p className="text-[11px] text-slate-500">
                  IVR: {appointment.reminders.ivrStatus}
                </p>
              </div>

              {/* Stage 3: Patient Response */}
              <div className="space-y-1 border-l border-slate-200 pl-3">
                <span className="text-[10px] font-bold text-indigo-600 block">3. Patient Response</span>
                {hasResponse ? (
                  <>
                    <p className="font-bold text-emerald-600 capitalize leading-tight">
                      {appointment.patient_response?.response}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      via {appointment.patient_response?.channel}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-400 leading-tight">Awaiting</p>
                    <p className="text-[11px] text-slate-400">No reply yet</p>
                  </>
                )}
              </div>

              {/* Stage 4: Final Status */}
              <div className="space-y-1 border-l border-slate-200 pl-3">
                <span className="text-[10px] font-bold text-indigo-600 block">4. Final Status</span>
                <p className={`font-bold leading-tight ${
                  appointment.status === 'Confirmed' ? 'text-emerald-600' :
                  appointment.status === 'At Risk' ? 'text-amber-600' :
                  appointment.status === 'Cancelled' ? 'text-rose-600' : 'text-blue-600'
                }`}>
                  {appointment.status}
                </p>
                <p className="text-[11px] text-slate-500">System of Record</p>
              </div>

            </div>
          </div>

          {/* APPOINTMENT CONTEXT */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Patient & Provider Summary
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1 text-slate-400 font-semibold">
                  <User className="w-3.5 h-3.5" /> Patient Details
                </div>
                <p className="text-sm font-bold text-slate-900">{appointment.patient.name}</p>
                <p className="text-slate-500 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3" /> {appointment.patient.phone}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1 text-slate-400 font-semibold">
                  <Stethoscope className="w-3.5 h-3.5" /> Provider & Clinic
                </div>
                <p className="text-sm font-bold text-slate-900">{appointment.doctor}</p>
                <p className="text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {appointment.practice}
                </p>
              </div>
            </div>
          </div>

          {/* DETAILED REMINDER LOGS */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Communication Timeline & Delivery Receipts
            </p>
            <div className="space-y-2.5">
              
              {/* T-60 SMS Card */}
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">T-60 SMS Reminder</p>
                    <p className="text-slate-500 text-[11px]">
                      {appointment.reminders.smsScheduledAt ? `Scheduled for ${new Date(appointment.reminders.smsScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Trigger: T-60 Minutes'}
                      {appointment.reminders.smsDeliveredAt && ` • Delivered at ${new Date(appointment.reminders.smsDeliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  appointment.reminders.smsStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                  appointment.reminders.smsStatus === 'Failed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {appointment.reminders.smsStatus}
                </span>
              </div>

              {/* T-30 IVR Card */}
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">T-30 Voice / IVR Call</p>
                    <p className="text-slate-500 text-[11px]">
                      Trigger: T-30 Minutes • Keypad confirmation flow
                      {appointment.reminders.ivrCompletedAt && ` • Completed at ${new Date(appointment.reminders.ivrCompletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  appointment.reminders.ivrStatus === 'Delivered' || appointment.reminders.ivrStatus === 'Scheduled' ? 'bg-indigo-50 text-indigo-700' :
                  appointment.reminders.ivrStatus === 'Failed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {appointment.reminders.ivrStatus}
                </span>
              </div>

            </div>
          </div>

          {/* STAGE 3 & 4: OUTCOME SUMMARY */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            {hasResponse ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900">
                    Patient Confirmed via {appointment.patient_response?.channel}
                  </p>
                  <p className="text-slate-500">
                    Response was recorded at {new Date(appointment.patient_response?.received_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. The appointment status in your system of record has been updated to <strong className="text-emerald-700">Confirmed</strong>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900">
                    Pending Patient Confirmation
                  </p>
                  <p className="text-slate-500">
                    Awaiting response. If no confirmation is received after the scheduled reminders, the appointment is marked <strong className="text-amber-700">At Risk</strong> for staff attention.
                  </p>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Role Access: <strong className="text-slate-600">{currentUserRole}</strong>
          </span>

          <div className="flex items-center gap-2">
            {!isReadOnly && appointment.status === 'At Risk' && (
              <button 
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition flex items-center gap-1.5"
                onClick={() => alert(`Retry reminder queued for ${appointment.appointment_id}`)}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Reminders
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
