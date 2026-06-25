import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client.js';

/**
 * Load + mutate a single item. Pass `path` = null to idle.
 * Mutations return the server response so callers can react.
 */
export function useItem(path) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!path) {
      setItem(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getItem(path);
      setItem(data);
    } catch (err) {
      setError(err);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async ({ frontmatter, body }) => {
      const data = await api.createItem({ path, frontmatter, body });
      setItem(data);
      return data;
    },
    [path]
  );

  const remove = useCallback(async () => {
    await api.deleteItem(path);
    setItem(null);
  }, [path]);

  return {
    item,
    loading,
    error: error instanceof ApiError ? error : null,
    reload: load,
    save,
    remove,
  };
}
