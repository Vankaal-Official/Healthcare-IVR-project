import { useState, useEffect } from 'react';
import { DemoPage } from './pages/DemoPage';
import { ZocdocPortalPage } from './pages/ZocdocPortalPage';
import { VanKaalPortalPage } from './pages/VanKaalPortalPage';

export default function App() {
  const isOpsMode =
    import.meta.env.VITE_APP_MODE === 'ops' ||
    window.location.hostname.includes('vankaal-ops') ||
    window.location.hostname.includes('telemetry');

  const [activeTab, setActiveTab] = useState<'demo' | 'zocdoc'>(() => {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path.includes('zocdoc') || search.includes('tab=zocdoc')) {
      return 'zocdoc';
    }
    return 'demo';
  });

  useEffect(() => {
    if (isOpsMode) {
      document.title = 'Van-Kaal | Healthcare Operations & Telemetry';
    } else if (activeTab === 'demo') {
      document.title = 'Van-Kaal | Interactive Voice AI Demo';
    } else {
      document.title = 'Zocdoc | Clinic Reminders & Attendance Hub';
    }
  }, [isOpsMode, activeTab]);

  if (isOpsMode) {
    return <VanKaalPortalPage />;
  }

  return (
    <div>
      {activeTab === 'demo' ? (
        <DemoPage activeTab={activeTab} onTabChange={setActiveTab} />
      ) : (
        <ZocdocPortalPage activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

