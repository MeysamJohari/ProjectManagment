import { STATUS, PRIORITY } from '../../lib/constants.js';

/** Generic small pill with a leading dot. */
export function DotBadge({ label, dotClass, textClass, chipClass, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-label font-medium ${chipClass} ${textClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass} bg-current`} />
      {label}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const s = STATUS[status];
  if (!s) return null;
  return (
    <DotBadge
      label={s.label}
      dotClass={s.dot}
      textClass={s.text}
      chipClass={s.chip}
      className={className}
    />
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const p = PRIORITY[priority];
  if (!p) return null;
  return (
    <DotBadge
      label={p.label}
      dotClass={p.dot}
      textClass={p.text}
      chipClass={p.chip}
      className={className}
    />
  );
}
