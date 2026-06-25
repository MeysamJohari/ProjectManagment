import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client.js';

export function useTree() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTree();
      setTree(data.tree);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tree, loading, error: error instanceof ApiError ? error : null, refresh };
}
