export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-pm-bg-surface rounded-pm-lg shadow-pm-sm border border-pm-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={`border-b border-pm-border px-5 py-3 ${className}`}>{children}</div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
