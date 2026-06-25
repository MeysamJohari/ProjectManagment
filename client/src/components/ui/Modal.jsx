import { useEffect } from 'react';
import { X } from 'lucide-react';

/** RTL modal: primary action on the right. Closes on overlay click + Esc. */
export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} animate-[fadeIn_120ms_ease-out] rounded-pm-xl bg-pm-bg-surface shadow-pm-lg`}
      >
        <div className="flex items-center justify-between border-b border-pm-border px-5 py-3">
          <h3 className="text-title text-pm-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-pm-sm p-1 text-pm-text-tertiary hover:bg-pm-bg-subtle hover:text-pm-text-primary"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          // In RTL, justify-end puts the primary button on the right.
          <div className="flex justify-end gap-2 border-t border-pm-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
