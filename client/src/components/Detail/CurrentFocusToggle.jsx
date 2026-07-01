import { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { PauseNoteModal } from './PauseNoteModal.jsx';
import { useCurrent } from '../../hooks/useCurrent.js';
import { useAppStore } from '../../store/useAppStore.js';

/**
 * The "make this my current focus" button.
 * - If NOTHING is currently focused → immediate switchFocus({ path }).
 * - If ANOTHER task is focused → open PauseNoteModal, then switchFocus({ path, stop_note }).
 * - If THIS task is already focused → show the active state (no action).
 */
export function CurrentFocusToggle({ path, isCurrent, onChanged }) {
  const current = useAppStore((s) => s.current);
  const { switchFocus, switching } = useCurrent();
  const [pauseOpen, setPauseOpen] = useState(false);

  const anotherIsCurrent = !!current && current.path !== path && !isCurrent;

  const handleClick = async () => {
    if (isCurrent) return;
    if (anotherIsCurrent) {
      setPauseOpen(true);
      return;
    }
    // Nothing else is focused → switch directly.
    try {
      await switchFocus({ path });
      onChanged?.();
    } catch {
      /* toast already shown in hook */
    }
  };

  const confirmPause = async (stop_note) => {
    setPauseOpen(false);
    try {
      await switchFocus({ path, stop_note });
      onChanged?.();
    } catch {
      /* toast already shown */
    }
  };

  if (isCurrent) {
    return (
      <div className="inline-flex items-center gap-2 rounded-pm-md bg-pm-brand-subtle px-3 py-2 text-body-sm font-medium text-pm-brand">
        <Crosshair size={16} />
        این تسک الان تمرکز شماست
      </div>
    );
  }

  return (
    <>
      <Button variant="primary" onClick={handleClick} disabled={switching}>
        <Crosshair size={16} />
        {anotherIsCurrent ? 'سوییچ تمرکز به این تسک' : 'این رو الان دارم کار می‌کنم'}
      </Button>

      <PauseNoteModal
        open={pauseOpen}
        previousTitle={current?.frontmatter?.title || current?.path || 'تسک فعلی'}
        onConfirm={confirmPause}
        onClose={() => setPauseOpen(false)}
      />
    </>
  );
}
