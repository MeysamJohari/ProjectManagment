import { History, ArrowLeft, Play, Square } from 'lucide-react';
import { parseLogFromBody, formatDateTime } from '../../lib/format.js';
import { STATUS } from '../../lib/constants.js';
import { EmptyState } from '../ui/Feedback.jsx';

/**
 * Vertical timeline of parsed Log events (UI Kit §5.8).
 * The spine is on the RIGHT (border-r-2). Focus events get a brand dot +
 * play/stop icon; status events get a chart dot + status arrow.
 */
export function LogTimeline({ body }) {
  const events = parseLogFromBody(body);

  if (events.length === 0) {
    return (
      <div className="py-4">
        <EmptyState icon={History} title="هنوز رویدادی ثبت نشده" description="تغییر وضعیت یا سوییچ تمرکز اینجا نشان داده می‌شود." />
      </div>
    );
  }

  // Newest first.
  const ordered = [...events].reverse();

  return (
    <div className="pr-3">
      <ol className="relative border-r-2 border-pm-border">
        {ordered.map((ev, i) => (
          <li key={i} className="mb-5 pr-5 last:mb-0">
            {/* Node dot */}
            <span
              className={`absolute -right-[7px] mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                ev.kind === 'focus' ? 'bg-pm-brand' : 'bg-pm-chart-2'
              }`}
            />

            {ev.kind === 'status' ? (
              <StatusEvent ev={ev} />
            ) : ev.kind === 'focus' ? (
              <FocusEvent ev={ev} />
            ) : (
              <p className="text-body-sm text-pm-text-tertiary pm-ltr">{ev.text}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function StatusEvent({ ev }) {
  const from = STATUS[ev.from]?.label || ev.from;
  const to = STATUS[ev.to]?.label || ev.to;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-body text-pm-text-primary">
        <span className="text-pm-text-tertiary">{from}</span>
        <ArrowLeft size={14} className="text-pm-text-tertiary" />
        <span className="font-medium">{to}</span>
      </div>
      <p className="mt-0.5 text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(ev.timestamp)}</p>
    </div>
  );
}

function FocusEvent({ ev }) {
  const started = ev.action === 'started';
  const Icon = started ? Play : Square;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-body text-pm-text-primary">
        <Icon size={14} className="text-pm-brand" />
        <span className="font-medium text-pm-brand">
          {started ? 'شروع تمرکز' : 'توقف تمرکز'}
        </span>
      </div>
      {ev.note && <p className="mt-1 text-body-sm text-pm-text-secondary">«{ev.note}»</p>}
      <p className="mt-0.5 text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(ev.timestamp)}</p>
    </div>
  );
}
