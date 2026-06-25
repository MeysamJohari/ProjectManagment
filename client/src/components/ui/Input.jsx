const baseField =
  'w-full rounded-pm-md border border-pm-border bg-white px-3 text-body text-pm-text-primary placeholder:text-pm-text-tertiary focus:border-pm-border-focus focus:ring-2 focus:ring-pm-brand/20 focus:outline-none transition-colors';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-label text-pm-text-secondary">{label}</span>
      )}
      {children}
      {hint && <span className="mt-1 block text-caption text-pm-text-tertiary">{hint}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`${baseField} h-9 ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${baseField} min-h-[80px] py-2 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseField} h-9 ${className}`} {...props}>
      {children}
    </select>
  );
}
