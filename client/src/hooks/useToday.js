import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client.js';

export function useToday() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await api.getToday();
      setData(d);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    current: data?.current ?? null,
    tasks: data?.tasks ?? [],
    loading,
    error: error instanceof ApiError ? error : null,
    refresh,
  };
}
