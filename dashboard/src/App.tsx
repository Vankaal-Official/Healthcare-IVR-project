import { useState, useEffect } from 'react';
import { ZocdocPortalPage } from './pages/ZocdocPortalPage';
import { VanKaalPortalPage } from './pages/VanKaalPortalPage';
import { DemoPage } from './pages/DemoPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isDemo =
    currentPath === '/demo' ||
    currentPath.startsWith('/demo');

  const isVanKaal =
    currentPath === '/vankaal' ||
    currentPath.startsWith('/vankaal/') ||
    currentPath === '/admin';

  useEffect(() => {
    if (isDemo) {
      document.title = 'Van-Kaal | Interactive Voice AI Simulator';
    } else if (isVanKaal) {
      document.title = 'Van-Kaal | Healthcare Operations & Telemetry';
    } else {
      document.title = 'Zocdoc | Clinic Appointment Reminders Hub';
    }
  }, [isDemo, isVanKaal]);

  if (isDemo) {
    return <DemoPage />;
  }

  if (isVanKaal) {
    return <VanKaalPortalPage />;
  }

  return <ZocdocPortalPage />;
}

