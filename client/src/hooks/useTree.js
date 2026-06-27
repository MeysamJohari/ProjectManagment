import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client.js';
import { useAppStore } from '../store/useAppStore.js';

export function useTree() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const treeVersion = useAppStore((s) => s.treeVersion);

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
  }, [refresh, treeVersion]);

  return { tree, loading, error: error instanceof ApiError ? error : null, refresh };
}
