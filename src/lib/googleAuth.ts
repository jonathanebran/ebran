const CLIENT_ID = '478837324590-fn7k408ftt4hpvg8ptoj2252rirl3qgn.apps.googleusercontent.com';

const SERVICE_SCOPES: Record<string, string> = {
  calendar: 'https://www.googleapis.com/auth/calendar.readonly',
  drive:    'https://www.googleapis.com/auth/drive.readonly',
  gmail:    'https://www.googleapis.com/auth/gmail.readonly',
  tasks:    'https://www.googleapis.com/auth/tasks',
};

interface TokenData {
  token: string;
  expiry: number;
  email: string;
}

function tokenKey(service: string) {
  return `ebran:gtoken:${service}:v1`;
}

export function getStoredToken(service: string): TokenData | null {
  try {
    const raw = localStorage.getItem(tokenKey(service));
    if (!raw) return null;
    const data = JSON.parse(raw) as TokenData;
    if (Date.now() > data.expiry) {
      localStorage.removeItem(tokenKey(service));
      return null;
    }
    return data;
  } catch { return null; }
}

export function isServiceConnected(service: string): boolean {
  return !!getStoredToken(service);
}

export function disconnectService(service: string) {
  localStorage.removeItem(tokenKey(service));
}

export function hasPublicApi(service: string): boolean {
  return service in SERVICE_SCOPES;
}

function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as unknown as Record<string, unknown>).google !== 'undefined') {
      resolve();
      return;
    }
    if (document.getElementById('gsi-script')) {
      const existing = document.getElementById('gsi-script') as HTMLScriptElement;
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function fetchUserEmail(token: string): Promise<string> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { email?: string };
    return data.email ?? 'Conta Google';
  } catch { return 'Conta Google'; }
}

async function requestToken(
  service: string,
  silent: boolean
): Promise<{ success: boolean; email?: string }> {
  const scope = SERVICE_SCOPES[service];
  if (!scope) return { success: false };

  try { await loadGIS(); } catch { return { success: false }; }

  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    const client = g.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: `${scope} https://www.googleapis.com/auth/userinfo.email`,
      prompt: silent ? '' : undefined,
      callback: async (response: { access_token?: string; error?: string; expires_in?: number }) => {
        if (response.error || !response.access_token) {
          resolve({ success: false });
          return;
        }
        // Reuse stored email on silent refresh to avoid extra fetch
        const existingToken = getStoredToken(service);
        const email = existingToken?.email ?? await fetchUserEmail(response.access_token);
        const expiry = Date.now() + (response.expires_in ?? 3600) * 1000;
        localStorage.setItem(tokenKey(service), JSON.stringify({ token: response.access_token, expiry, email }));
        resolve({ success: true, email });
      },
      error_callback: () => resolve({ success: false }),
    });
    client.requestAccessToken();
  });
}

export async function connectService(service: string): Promise<{ success: boolean; email?: string }> {
  return requestToken(service, false);
}

// Silently refreshes a token without showing a popup.
// Works if the user is still signed in to Google and has previously granted access.
export async function silentRefreshService(service: string): Promise<boolean> {
  const result = await requestToken(service, true);
  return result.success;
}

// Returns all services that have stored (possibly expired) tokens
export function getConnectedServices(): string[] {
  return Object.keys(SERVICE_SCOPES).filter(s => !!localStorage.getItem(tokenKey(s)));
}

// Refresh all services whose tokens expire within the next 10 minutes
export async function refreshExpiringTokens(): Promise<void> {
  const TEN_MIN = 10 * 60 * 1000;
  const services = Object.keys(SERVICE_SCOPES);
  for (const service of services) {
    const raw = localStorage.getItem(tokenKey(service));
    if (!raw) continue;
    try {
      const data = JSON.parse(raw) as TokenData;
      if (data.expiry - Date.now() < TEN_MIN) {
        await silentRefreshService(service);
      }
    } catch { continue; }
  }
}
