import { useState, useEffect } from 'react';
import { DemoPage } from './pages/DemoPage';
import { ZocdocPortalPage } from './pages/ZocdocPortalPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'zocdoc'>(() => {
    // If URL explicitly asks for zocdoc, honor it; otherwise default to interactive demo
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path.includes('zocdoc') || search.includes('tab=zocdoc')) {
      return 'zocdoc';
    }
    return 'demo';
  });

  useEffect(() => {
    if (activeTab === 'demo') {
      document.title = 'Van-Kaal | Interactive Voice AI Demo';
    } else {
      document.title = 'Zocdoc | Clinic Reminders & Attendance Hub';
    }
  }, [activeTab]);

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

