// Primitive UI atoms (UI Kit §5). Plain functions + className composition.

const VARIANTS = {
  primary:
    'bg-pm-brand text-white hover:bg-pm-brand-hover active:bg-pm-brand-active',
  secondary:
    'bg-pm-bg-subtle text-pm-text-primary border border-pm-border hover:bg-pm-bg-muted',
  ghost: 'text-pm-text-secondary hover:bg-pm-bg-subtle hover:text-pm-text-primary',
  danger:
    'text-pm-feedback-error border border-red-200 hover:bg-red-50 bg-white',
  dashed:
    'border border-dashed border-pm-border-strong text-pm-text-secondary hover:bg-pm-bg-subtle hover:text-pm-text-primary bg-transparent',
};

const SIZES = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-9 px-4 text-body gap-2',
  lg: 'h-10 px-5 text-body gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-pm-md font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none';
  return (
    <button
      className={`${base} ${VARIANTS[variant] || ''} ${SIZES[size] || ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
