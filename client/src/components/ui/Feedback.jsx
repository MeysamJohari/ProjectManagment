export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-pm-md bg-pm-bg-subtle ${className}`} />;
}

export function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-pm-brand/30 border-t-pm-brand ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="در حال بارگذاری"
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pm-brand-subtle text-pm-brand">
          <Icon size={26} />
        </span>
      )}
      <div>
        <p className="text-title text-pm-text-primary">{title}</p>
        {description && (
          <p className="mt-1 text-body-sm text-pm-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
