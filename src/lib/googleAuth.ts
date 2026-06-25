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

// ─── GIS loading ──────────────────────────────────────────────────────────────

let gisReady: Promise<void> | null = null;

export function loadGIS(): Promise<void> {
  if (gisReady) return gisReady;
  gisReady = new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).google !== 'undefined') { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { gisReady = null; reject(new Error('GIS load failed')); };
    document.head.appendChild(script);
  });
  return gisReady;
}

// ─── Token clients ─────────────────────────────────────────────────────────────
// Must be created BEFORE the user taps, then called synchronously ON the tap.
// iOS Safari only allows popups in direct synchronous response to user gestures.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeClients: Record<string, any> = {};

async function fetchUserEmail(token: string): Promise<string> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { email?: string };
    return data.email ?? 'Conta Google';
  } catch { return 'Conta Google'; }
}

// Call on component mount. Loads GIS and pre-creates one client per service.
export async function preInitClients(
  onResult: (service: string, result: { success: boolean; email?: string }) => void
): Promise<void> {
  try { await loadGIS(); } catch { return; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (window as any).google;

  for (const service of Object.keys(SERVICE_SCOPES)) {
    const scope = SERVICE_SCOPES[service];
    activeClients[service] = g.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: `${scope} https://www.googleapis.com/auth/userinfo.email`,
      callback: async (response: { access_token?: string; error?: string; expires_in?: number }) => {
        if (response.error || !response.access_token) {
          onResult(service, { success: false });
          return;
        }
        const existing = getStoredToken(service);
        const email = existing?.email ?? await fetchUserEmail(response.access_token);
        const expiry = Date.now() + (response.expires_in ?? 3600) * 1000;
        localStorage.setItem(tokenKey(service), JSON.stringify({ token: response.access_token, expiry, email }));
        onResult(service, { success: true, email });
      },
      error_callback: () => onResult(service, { success: false }),
    });
  }
}

// Call SYNCHRONOUSLY inside a click handler — iOS Safari requires this.
export function requestTokenSync(service: string, firstTime = false): boolean {
  const client = activeClients[service];
  if (!client) return false;
  client.requestAccessToken({ prompt: firstTime ? 'consent' : '' });
  return true;
}

// ─── Background silent refresh ────────────────────────────────────────────────

export async function refreshExpiringTokens(): Promise<void> {
  const TEN_MIN = 10 * 60 * 1000;
  try { await loadGIS(); } catch { return; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (window as any).google;

  for (const service of Object.keys(SERVICE_SCOPES)) {
    const raw = localStorage.getItem(tokenKey(service));
    if (!raw) continue;
    try {
      const data = JSON.parse(raw) as TokenData;
      if (data.expiry - Date.now() > TEN_MIN) continue;
      await new Promise<void>(resolve => {
        const client = g.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: `${SERVICE_SCOPES[service]} https://www.googleapis.com/auth/userinfo.email`,
          prompt: '',
          callback: (response: { access_token?: string; expires_in?: number }) => {
            if (response.access_token) {
              const expiry = Date.now() + (response.expires_in ?? 3600) * 1000;
              localStorage.setItem(tokenKey(service), JSON.stringify({ token: response.access_token, expiry, email: data.email }));
            }
            resolve();
          },
          error_callback: () => resolve(),
        });
        client.requestAccessToken({ prompt: '' });
      });
    } catch { continue; }
  }
}

export function getConnectedServices(): string[] {
  return Object.keys(SERVICE_SCOPES).filter(s => !!localStorage.getItem(tokenKey(s)));
}
