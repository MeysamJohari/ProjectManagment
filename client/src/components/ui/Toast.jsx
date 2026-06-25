import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: 'text-pm-feedback-success',
  warning: 'text-pm-feedback-warning',
  error: 'text-pm-feedback-error',
  info: 'text-pm-brand',
};

// UI Kit §5.10: toasts live in the TOP-LEFT corner (RTL).
export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="fixed left-4 top-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            className="flex items-start gap-2 rounded-pm-md bg-pm-bg-surface px-4 py-3 text-body-sm text-pm-text-primary shadow-pm-md border border-pm-border"
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${STYLES[t.type] || STYLES.info}`} />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-pm-text-tertiary hover:text-pm-text-primary"
              aria-label="بستن"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
