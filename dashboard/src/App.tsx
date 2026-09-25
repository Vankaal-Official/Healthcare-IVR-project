import { useState, useEffect } from 'react';
import { ZocdocPortalPage } from './pages/ZocdocPortalPage';
import { VanKaalPortalPage } from './pages/VanKaalPortalPage';

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

  const isVanKaal =
    currentPath === '/vankaal' ||
    currentPath.startsWith('/vankaal/') ||
    currentPath === '/admin';

  // Completely independent standalone portals with ZERO cross-portal links or switchers
  if (isVanKaal) {
    return <VanKaalPortalPage />;
  }

  return <ZocdocPortalPage />;
}
