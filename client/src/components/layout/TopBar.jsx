import { useEffect, useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { api } from '../../api/client.js';

/**
 * Top navigation bar. In RTL: brand/avatar on the RIGHT, connection status on the LEFT.
 * (UI Kit §4.1: header height 56px.)
 */
export function TopBar() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        await api.ping();
        if (!cancelled) setStatus('online');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    };
    check();
    const id = setInterval(check, 15000); // re-check periodically
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-pm-border bg-pm-bg-surface px-5">
      {/* Right side (RTL start): brand */}
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-pm-md bg-pm-brand-subtle text-pm-brand">
          ◆
        </span>
        <div className="leading-tight">
          <p className="text-title text-pm-text-primary">مدیریت پروژه</p>
          <p className="text-caption text-pm-text-tertiary">Personal PM</p>
        </div>
      </div>

      {/* Left side (RTL end): connection status */}
      <div className="flex items-center gap-2 text-body-sm">
        {status === 'online' ? (
          <span className="inline-flex items-center gap-1.5 text-pm-feedback-success">
            <CircleCheck size={16} />
            متصل ✓
          </span>
        ) : status === 'offline' ? (
          <span className="inline-flex items-center gap-1.5 text-pm-feedback-error">
            <CircleX size={16} />
            آفلاین ✗
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-pm-text-tertiary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pm-brand-muted" />
            در حال بررسی…
          </span>
        )}
      </div>
    </header>
  );
}
