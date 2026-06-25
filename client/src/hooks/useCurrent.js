import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client.js';
import { useAppStore } from '../store/useAppStore.js';

/**
 * Tracks the global current-focus task and keeps the store banner in sync.
 * `switchFocus` enforces the stop_note flow client-side but the server is
 * the final authority (returns 400 if validation fails).
 */
export function useCurrent() {
  const [error, setError] = useState(null);
  const [switching, setSwitching] = useState(false);
  const setCurrent = useAppStore((s) => s.setCurrent);
  const pushToast = useAppStore((s) => s.pushToast);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getCurrent();
      setCurrent(data.current);
    } catch (err) {
      setError(err);
    }
  }, [setCurrent]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const switchFocus = useCallback(
    async ({ path, stop_note }) => {
      setSwitching(true);
      setError(null);
      try {
        const data = await api.setCurrent({ path, stop_note });
        await refresh();
        pushToast('success', 'تمرکز بروز شد.');
        return data;
      } catch (err) {
        setError(err);
        pushToast('error', err.message || 'سوییچ تمرکز ناموفق بود.');
        throw err;
      } finally {
        setSwitching(false);
      }
    },
    [refresh, pushToast]
  );

  return {
    refresh,
    switchFocus,
    switching,
    error: error instanceof ApiError ? error : null,
  };
}
