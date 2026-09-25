import type { ZocdocAppointment } from '../../types/portal';

interface ZocdocModalProps {
  appointment: ZocdocAppointment | null;
  onClose: () => void;
}

export const ZocdocModal = ({ appointment, onClose }: ZocdocModalProps) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#FFF04B]/30 border-b border-amber-200/60 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#182743] text-white flex items-center justify-center font-bold text-base shadow-sm">
              ZD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#182743]">{appointment.patient_name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  {appointment.appointment_id}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {appointment.doctor} • {appointment.practice_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Time Slot</span>
              <p className="text-sm font-bold text-[#182743] mt-0.5">{appointment.time}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Phone</span>
              <p className="text-sm font-mono font-medium text-slate-700 mt-0.5">{appointment.patient_phone_masked}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</span>
              <p className={`text-sm font-bold mt-0.5 ${
                appointment.status === 'Confirmed' ? 'text-emerald-700' :
                appointment.status === 'At Risk' ? 'text-amber-700' : 'text-slate-700'
              }`}>
                {appointment.status}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Zocdoc Sync</span>
              <p className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                ✓ 200 OK
              </p>
            </div>
          </div>

          {/* Detailed Timeline */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-xs font-bold text-[#182743] uppercase tracking-wider">
                Automated Dispatch &amp; Patient Response Audit Trail
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                4-Step Automated Verification Loop
              </span>
            </div>

            {/* Stepper Logic */}
            {(() => {
              const isConfirmed =
                appointment.status === 'Confirmed' ||
                appointment.raw_status === 'RESCHEDULED' ||
                appointment.raw_status === 'CONFIRMED';

              const step1State = 'completed';

              let step2State: 'completed' | 'current' | 'pending' | 'failed' = 'pending';
              if (
                appointment.sms_status === 'Delivered' ||
                appointment.voice_status === 'Delivered' ||
                isConfirmed
              ) {
                step2State = 'completed';
              } else if (
                appointment.sms_status === 'Failed' &&
                appointment.voice_status === 'Failed'
              ) {
                step2State = 'failed';
              } else {
                step2State = 'current';
              }

              let step3State: 'completed' | 'current' | 'pending' | 'failed' = 'pending';
              if (appointment.patient_response || isConfirmed) {
                step3State = 'completed';
              } else if (step2State === 'completed') {
                step3State = 'current';
              } else {
                step3State = 'pending';
              }

              let step4State: 'completed' | 'current' | 'pending' | 'failed' = 'pending';
              if (appointment.webhook_status === 'Delivered' || isConfirmed) {
                step4State = 'completed';
              } else if (step3State === 'completed') {
                step4State = 'current';
              } else {
                step4State = 'pending';
              }

              const renderStepNode = (
                stepNumber: number,
                state: 'completed' | 'current' | 'pending' | 'failed',
              ) => {
                if (state === 'completed') {
                  return (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-white">
                      ✓
                    </div>
                  );
                }
                if (state === 'current') {
                  return (
                    <div className="w-6 h-6 rounded-full bg-[#182743] text-[#FFF04B] flex items-center justify-center font-bold text-xs ring-4 ring-[#FFF04B]/60 shadow-sm border-2 border-white animate-pulse">
                      {stepNumber}
                    </div>
                  );
                }
                if (state === 'failed') {
                  return (
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white">
                      ✕
                    </div>
                  );
                }
                return (
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center font-semibold text-xs">
                    {stepNumber}
                  </div>
                );
              };

              // Determine accurate outreach description
              const outreachText =
                appointment.voice_status === 'Delivered'
                  ? `2. IVR Voice Call Connected to ${appointment.patient_phone_masked}`
                  : appointment.sms_status === 'Delivered'
                  ? `2. SMS Reminder Delivered to ${appointment.patient_phone_masked}`
                  : `2. Patient Outreach Dispatched to ${appointment.patient_phone_masked}`;

              const responseText = appointment.patient_response
                ? `3. Patient Response Received via ${appointment.patient_response.channel} (${appointment.patient_response.response})`
                : isConfirmed
                ? '3. Patient Verified & Confirmed via Voice AI'
                : '3. Patient Response (Awaiting Patient Reply)';

              return (
                <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {/* Step 1 */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="absolute -left-7">
                        {renderStepNode(1, step1State)}
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        1. Booking Synchronized from Zocdoc API
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Completed
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="absolute -left-7">
                        {renderStepNode(2, step2State)}
                      </div>
                      <p
                        className={`text-xs ${
                          step2State === 'current'
                            ? 'font-black text-[#182743]'
                            : step2State === 'completed'
                            ? 'font-bold text-slate-800'
                            : 'font-medium text-slate-400'
                        }`}
                      >
                        {outreachText}
                      </p>
                    </div>
                    {step2State === 'current' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF04B] text-[#182743] border border-amber-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#182743] animate-ping"></span>
                        CURRENT STEP
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          step2State === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : step2State === 'failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {step2State === 'completed' ? 'Delivered' : step2State === 'failed' ? 'Failed' : 'Upcoming'}
                      </span>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="absolute -left-7">
                        {renderStepNode(3, step3State)}
                      </div>
                      <p
                        className={`text-xs ${
                          step3State === 'current'
                            ? 'font-black text-[#182743]'
                            : step3State === 'completed'
                            ? 'font-bold text-slate-800'
                            : 'font-medium text-slate-400'
                        }`}
                      >
                        {responseText}
                      </p>
                    </div>
                    {step3State === 'current' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF04B] text-[#182743] border border-amber-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#182743] animate-ping"></span>
                        CURRENT STEP
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          step3State === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {step3State === 'completed' ? 'Confirmed' : 'Upcoming'}
                      </span>
                    )}
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="absolute -left-7">
                        {renderStepNode(4, step4State)}
                      </div>
                      <p
                        className={`text-xs ${
                          step4State === 'current'
                            ? 'font-black text-[#182743]'
                            : step4State === 'completed'
                            ? 'font-bold text-slate-800'
                            : 'font-medium text-slate-400'
                        }`}
                      >
                        4. Live Status Callback Dispatched to Zocdoc
                      </p>
                    </div>
                    {step4State === 'current' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF04B] text-[#182743] border border-amber-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#182743] animate-ping"></span>
                        CURRENT STEP
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          step4State === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {step4State === 'completed' ? 'Synced (200 OK)' : 'Upcoming'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {appointment.status === 'Confirmed' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
                <span>✓</span>
                <span>Patient Confirmed &amp; Attendance Secured</span>
              </span>
            ) : (
              <>
                <button
                  onClick={() => alert(`Resending SMS reminder to ${appointment.patient_name}...`)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-[#182743] rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Resend SMS
                </button>
                <button
                  onClick={() => alert(`Initiating manual IVR call for ${appointment.patient_name}...`)}
                  className="px-4 py-2 bg-[#182743] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Trigger IVR Call Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
