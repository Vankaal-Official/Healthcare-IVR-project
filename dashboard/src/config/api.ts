/**
 * Centralized API client helper for Van-Kaal & Zocdoc Dashboards
 * Supports VITE_API_URL environment variable for cloud deployments (Netlify/Vercel)
 * and guards against HTML error pages being parsed as JSON.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  // If running locally on localhost, relative URLs work with Vite's dev proxy
  return '';
};

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<any> => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  // Guard against HTML responses (e.g. Netlify 404 or index.html fallback)
  if (text.trim().startsWith('<') || !contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    // Return empty array/object or descriptive error if backend is not linked
    throw new Error(
      'Live backend API not reachable. Please configure VITE_API_URL in Netlify site settings.'
    );
  }

  try {
    return JSON.parse(text);
  } catch (parseErr) {
    throw new Error('Invalid JSON payload received from server');
  }
};
