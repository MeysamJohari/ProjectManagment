import { Crosshair } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

/**
 * Persistent banner showing the is_current task (or "Nothing set").
 * Lives at the top of the content area on every view (UI Kit §7 Phase 2).
 */
export function CurrentBanner() {
  const current = useAppStore((s) => s.current);
  const select = useAppStore((s) => s.select);

  return (
    <div className="flex items-center gap-2 rounded-pm-md border border-pm-brand-muted/40 bg-pm-brand-subtle px-3 py-2 text-body-sm">
      <Crosshair size={16} className="shrink-0 text-pm-brand" />
      <span className="text-pm-text-secondary">در حال کار روی:</span>
      {current ? (
        <button
          onClick={() => select(current.path)}
          className="font-medium text-pm-brand hover:underline"
        >
          {current.frontmatter?.title || current.path}
        </button>
      ) : (
        <span className="text-pm-text-tertiary">چیزی به‌عنوان تمرکز فعلی تنظیم نشده</span>
      )}
    </div>
  );
}
