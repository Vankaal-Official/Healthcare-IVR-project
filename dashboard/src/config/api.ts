/**
 * Centralized API client helper for Van-Kaal & Zocdoc Dashboards
 * Supports VITE_API_URL environment variable for cloud deployments (Netlify/Vercel)
 * and guards against HTML error pages being parsed as JSON.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // Strip trailing /v1 if the user entered it in VITE_API_URL
    if (clean.endsWith('/v1')) {
      clean = clean.slice(0, -3);
    }
    return clean;
  }
  // If running locally on localhost, relative URLs work with Vite's dev proxy
  return '';
};

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<any> => {
  const baseUrl = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Prevent accidental double /v1/ if both baseUrl and endpoint contain /v1
  if (baseUrl.endsWith('/v1') && cleanEndpoint.startsWith('/v1/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/v1/, '');
  } else if (cleanEndpoint.startsWith('/v1/v1/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/v1/, '');
  }

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
