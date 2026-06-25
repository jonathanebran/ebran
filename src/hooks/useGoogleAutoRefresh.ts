import { useEffect } from 'react';
import { refreshExpiringTokens } from '../lib/googleAuth';

// Checks every 5 minutes if any Google token is about to expire and silently refreshes it.
// Silent refresh works as long as the user is logged in to Google in the browser.
export function useGoogleAutoRefresh() {
  useEffect(() => {
    // Check immediately on mount
    refreshExpiringTokens();

    // Then check every 5 minutes
    const id = setInterval(() => refreshExpiringTokens(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
}
