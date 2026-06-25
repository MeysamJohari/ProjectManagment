import { create } from 'zustand';

/**
 * Global app state (UI navigation + the current-focus banner).
 * Tree/item data lives in the hooks (with their own local cache), but
 * navigation + the persistent "currently working on" banner belong here so
 * they survive view switches.
 */
export const useAppStore = create((set) => ({
  view: 'today', // 'today' | 'projects'
  selectedPath: null, // currently open item in the detail panel
  current: null, // { path, frontmatter } | null — the is_current task
  toasts: [], // [{ id, type, message }]
  setView: (view) => set({ view }),
  select: (path) => set({ view: 'projects', selectedPath: path }),
  setCurrent: (current) => set({ current }),
  pushToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
