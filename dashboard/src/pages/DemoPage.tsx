import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  Sparkles,
  Calendar,
  User,
  RefreshCw,
  Building2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Bot,
  UserCheck,
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+1', country: 'United States', flag: '🇺🇸', placeholder: 'e.g. (555) 000-0000' },
  { code: '+91', country: 'India', flag: '🇮🇳', placeholder: 'e.g. 98765 43210' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', placeholder: 'e.g. 7911 123456' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', placeholder: 'e.g. 412 345 678' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', id: 'CA', placeholder: 'e.g. (555) 000-0000' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', placeholder: 'e.g. 1512 3456789' },
  { code: '+33', country: 'France', flag: '🇫🇷', placeholder: 'e.g. 6 12 34 56 78' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', placeholder: 'e.g. 8123 4567' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', placeholder: 'e.g. 50 123 4567' },
];

export const DemoPage: React.FC = () => {
  // Form State
  const [selectedCountry, setSelectedCountry] = useState('+91');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [patientName, setPatientName] = useState('Alex Morgan');
  const [birthYear, setBirthYear] = useState('1998');
  const [phoneLast4, setPhoneLast4] = useState('9727');

  // Calling State
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatusText, setCallStatusText] = useState<'IDLE' | 'CONNECTING' | 'IN-CALL' | 'ENDED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Stream State
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);

  const timerRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);

  // Current Country-Matched Placeholder
  const matchedCountry = COUNTRY_CODES.find((c) => c.code === selectedCountry);
  const currentPlaceholder = matchedCountry?.placeholder || 'e.g. (555) 000-0000';

  // Clean full phone number
  const fullPhoneNumber = `${selectedCountry}${phoneDigits.replace(/[^\d]/g, '')}`;

  // Handle phone digit input and auto-derive last 4 if not custom
  const handlePhoneChange = (val: string) => {
    setPhoneDigits(val);
    const digitsOnly = val.replace(/[^\d]/g, '');
    if (digitsOnly.length >= 4) {
      setPhoneLast4(digitsOnly.slice(-4));
    }
  };

  // Dispatch Live Call
  const handleTriggerCall = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isCalling || callActive) return;

    const cleanNumber = fullPhoneNumber.replace(/[^\d+]/g, '');
    if (cleanNumber.length < 9) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    setIsCalling(true);
    setErrorMessage(null);
    setCallStatusText('CONNECTING');
    setCallDuration(0);
    setLiveTranscript('');
    setMessages([]);

    // Start timer immediately upon user action
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    try {
      const response = await fetch('/v1/voice-agent/demo-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientPhone: cleanNumber,
          birthYear: birthYear.trim() || '1998',
          doctorName: 'Dr. Michael Smith',
          practiceName: 'Manhattan Health Center',
          appointmentDate: '2026-10-01',
          appointmentTime: '10:30 AM',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch live outbound call');
      }

      setActiveCallId(data.callId);
      setCallActive(true);
      setCallStatusText('IN-CALL');
    } catch (err: any) {
      console.error('Call dispatch error:', err);
      setErrorMessage(err.message || 'Failed to connect to telephony provider');
      setCallStatusText('IDLE');
      setIsCalling(false);
      setCallActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Poll Call Status
  const pollStatus = useCallback(async () => {
    if (!activeCallId) return;

    try {
      const res = await fetch(`/v1/voice-agent/call-status/${activeCallId}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.status === 'in-progress' || data.status === 'ringing') {
        setCallStatusText('IN-CALL');
      } else if (data.status === 'ended') {
        setCallStatusText('ENDED');
        setCallActive(false);
        setIsCalling(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }

      if (data.transcript) {
        setLiveTranscript(data.transcript);
      }
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.warn('Call status polling error:', err);
    }
  }, [activeCallId]);

  useEffect(() => {
    if (activeCallId) {
      pollStatus();
      pollIntervalRef.current = setInterval(pollStatus, 2000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCallId, pollStatus]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Global Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FACC15] flex items-center justify-center shadow-md shadow-amber-400/20 text-slate-900 border border-yellow-400">
              <Sparkles className="w-5 h-5 fill-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">Van-Kaal</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Voice AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Healthcare Outbound Voice Automation</p>
            </div>
          </div>

          {/* Navigation Switcher Pills */}
          <nav className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <a
              href="/demo"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-sm transition border border-slate-200"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Interactive Demo</span>
            </a>
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
              title="Open Zocdoc Clinic Portal"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Zocdoc Clinic EHR</span>
              <span className="sm:hidden">Zocdoc</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Neutral Subtitle Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Test Outbound Healthcare Voice AI
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Enter your details below to receive an instant outbound appointment reminder call.
          </p>
        </div>

        {/* Calling Console & Live Visualizer (Balanced Heights items-stretch) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Calling Console (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Calling Console
                  </span>
                </div>
              </div>

              <form onSubmit={handleTriggerCall} className="space-y-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Patient Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition font-medium"
                    />
                  </div>
                </div>

                {/* Phone Input with Country Selector & Country-Matched Placeholder */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Phone Number (Will receive the call)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition font-medium cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c, idx) => (
                        <option key={`${c.code}-${c.country}-${idx}`} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phoneDigits}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={currentPlaceholder}
                        required
                        className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Split Verification into Two Clean Fields Side-by-Side */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Identity Verification Details
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left: Birth Year */}
                    <div>
                      <span className="block text-[11px] text-slate-500 mb-1 font-medium">Birth Year</span>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          placeholder="e.g. 1998"
                          maxLength={4}
                          className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition font-medium"
                        />
                      </div>
                    </div>

                    {/* Right: Phone Last 4 */}
                    <div>
                      <span className="block text-[11px] text-slate-500 mb-1 font-medium">Phone Last 4</span>
                      <div className="relative">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phoneLast4}
                          onChange={(e) => setPhoneLast4(e.target.value)}
                          placeholder="e.g. 9727"
                          maxLength={4}
                          className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment & Clinic Details Strip */}
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Upcoming Visit: <strong className="text-slate-800 font-semibold">Dr. Michael Smith</strong> • Oct 1, 2026 at 10:30 AM
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-6 text-[11px] text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <strong className="text-slate-700">Manhattan Health Center</strong> • 123 Medical Center Dr, Suite 400, NY 10001
                    </span>
                  </div>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Dispatch Button in Butter-Yellow (Very Last Element) */}
                <button
                  type="submit"
                  disabled={isCalling || callActive}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
                    callActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-default'
                      : isCalling
                      ? 'bg-amber-200 text-amber-900 cursor-wait'
                      : 'bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 border border-yellow-400/40 active:scale-[0.99] shadow-amber-400/20'
                  }`}
                >
                  {callActive ? (
                    <>
                      <PhoneForwarded className="w-4 h-4 animate-bounce text-amber-800" />
                      <span>Call In-Progress ({formatSeconds(callDuration)})</span>
                    </>
                  ) : isCalling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-900" />
                      <span>Initiating Outbound Carrier Session...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4 text-slate-900" />
                      <span>Dispatch Live Voice Call Now</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Clean Conversation Stream (7 cols, matches height) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
            {/* Header with Live Status & Duration */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Real-Time Conversation Stream
                </span>
              </div>
              <div className="flex items-center gap-3">
                {callActive && (
                  <div className="flex items-center gap-1 h-3 mr-1">
                    {[40, 90, 60, 100, 50].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-amber-500 rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDuration: `${0.3 + i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-500">
                  Duration: <strong className="text-slate-800">{formatSeconds(callDuration)}</strong>
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    callStatusText === 'IN-CALL'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                      : callStatusText === 'CONNECTING'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                      : callStatusText === 'ENDED'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {callStatusText}
                </span>
              </div>
            </div>

            {/* Conversation Stream Box */}
            <div className="my-4 flex-1 min-h-[380px] overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs font-sans scrollbar-thin flex flex-col justify-between">
              {liveTranscript ? (
                <div className="text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
                  {liveTranscript}
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-3.5">
                  {messages.map((m: any, idx: number) => {
                    const isAi = m.role === 'assistant';
                    return (
                      <div key={idx} className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}>
                        {isAi && (
                          <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-xs ${
                            isAi
                              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                              : 'bg-emerald-600 text-white rounded-tr-none font-medium'
                          }`}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                            {isAi ? 'Dr. Michael (AI Receptionist)' : patientName}
                          </span>
                          {m.message || m.content}
                        </div>
                        {!isAi && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : callActive || callStatusText === 'CONNECTING' || callStatusText === 'IN-CALL' ? (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Live greeting bubble */}
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-none max-w-[85%] text-xs leading-relaxed shadow-xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-amber-800">
                        AI Receptionist • Manhattan Health Center
                      </span>
                      "Hello {patientName}, this is Manhattan Health Center calling on behalf of Dr. Michael Smith. Do you have a quick moment regarding your upcoming cardiology appointment?"
                    </div>
                  </div>

                  {/* HIPAA Auth Tag */}
                  <div className="flex justify-center my-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>[HIPAA Birth Year: {birthYear || '1998'} Verified]</span>
                    </div>
                  </div>

                  {/* Patient Listening Indicator */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-tr-none text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="italic">Patient answering phone & listening...</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state with ~ ~ ~, centered text, and 3 subtle feature chips */
                <div className="flex-1 flex flex-col items-center justify-between text-center py-6 px-4">
                  <div />
                  <div className="flex flex-col items-center my-auto">
                    <div className="text-slate-300 tracking-widest text-lg font-mono mb-2">~ ~ ~</div>
                    <p className="text-sm text-slate-700 font-semibold">Waiting for call initiation...</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Transcript and AI tool actions will stream here live.
                    </p>
                  </div>
                  {/* 3 Subtle Empty-State Feature Chips across bottom */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium shadow-2xs">
                      <span className="text-emerald-600 font-bold">✓</span> Bi-lingual (EN / ES)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium shadow-2xs">
                      <span className="text-emerald-600 font-bold">✓</span> HIPAA Verification
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium shadow-2xs">
                      <span className="text-emerald-600 font-bold">✓</span> Live EHR Auto-Sync
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-16">
        <p>© 2026 Van-Kaal Health Systems • HIPAA Compliant Enterprise Infrastructure</p>
      </footer>
    </div>
  );
};
