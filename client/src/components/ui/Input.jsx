import { useEffect, useRef } from 'react';

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

/** Textarea that grows with content up to an optional max height, then scrolls. */
export function AutoResizeTextarea({
  className = '',
  value,
  onChange,
  minHeight = 80,
  maxHeight,
  ...props
}) {
  const ref = useRef(null);

  const getMaxHeightPx = () => {
    if (maxHeight == null) return Infinity;
    if (typeof maxHeight === 'number') return maxHeight;
    if (typeof maxHeight === 'string' && maxHeight.endsWith('vh')) {
      const vh = parseFloat(maxHeight);
      return (window.innerHeight * vh) / 100;
    }
    return Infinity;
  };

  const adjustHeight = () => {
    const el = ref.current;
    if (!el) return;

    el.style.height = 'auto';
    const maxPx = getMaxHeightPx();
    const contentHeight = el.scrollHeight;
    const nextHeight = Math.min(Math.max(contentHeight, minHeight), maxPx);

    el.style.height = `${nextHeight}px`;
    el.style.overflowY = contentHeight > maxPx ? 'auto' : 'hidden';
  };

  useEffect(() => {
    adjustHeight();
  }, [value, maxHeight, minHeight]);

  useEffect(() => {
    if (maxHeight == null || typeof maxHeight !== 'string' || !maxHeight.endsWith('vh')) return;
    const onResize = () => adjustHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [value, maxHeight, minHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      rows={1}
      className={`${baseField} resize-none py-2 leading-relaxed ${className}`}
      style={{ minHeight: `${minHeight}px` }}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseField} h-9 ${className}`} {...props}>
      {children}
    </select>
  );
}
