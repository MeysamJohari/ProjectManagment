import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { formatDateTime } from '../../lib/format.js';
import { STATUS } from '../../lib/constants.js';

/** Detail view for a single timeline event (opened on card click). */
export function LogEventModal({ event, open, onClose }) {
  if (!event) return null;

  const title = eventTitle(event);
  const body = eventBody(event);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={<Button onClick={onClose}>بستن</Button>}
    >
      <div className="space-y-3">
        <p className="text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(event.timestamp)}</p>
        {body}
        {event.rawLine && (
          <div className="rounded-pm-md border border-pm-border bg-pm-bg-muted/60 p-3">
            <p className="mb-1 text-label text-pm-text-tertiary">خط خام</p>
            <p className="whitespace-pre-wrap break-all text-body-sm text-pm-text-secondary pm-ltr" dir="ltr">
              {event.rawLine}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function eventTitle(ev) {
  if (ev.kind === 'status') return 'تغییر وضعیت';
  if (ev.kind === 'focus' && ev.action === 'started') return 'شروع تمرکز';
  if (ev.kind === 'focus' && ev.action === 'stopped') return 'توقف تمرکز';
  if (ev.kind === 'note') return 'ثبت کار انجام‌شده';
  return 'رویداد';
}

function eventBody(ev) {
  if (ev.kind === 'status') {
    const from = STATUS[ev.from]?.label || ev.from;
    const to = STATUS[ev.to]?.label || ev.to;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-pm-bg-subtle px-2.5 py-0.5 text-body-sm text-pm-text-secondary">
          {from}
        </span>
        <span className="text-pm-text-tertiary">←</span>
        <span className="rounded-full bg-pm-brand-subtle px-2.5 py-0.5 text-body-sm font-medium text-pm-brand">
          {to}
        </span>
      </div>
    );
  }
  if (ev.kind === 'focus' && ev.action === 'started') {
    return <p className="text-body-sm text-pm-text-secondary">تمرکز روی این تسک شروع شد.</p>;
  }
  if (ev.kind === 'focus' && ev.action === 'stopped') {
    return (
      <blockquote className="border-r-2 border-pm-brand/40 pr-3 text-body-sm leading-relaxed text-pm-text-primary">
        {ev.note || '—'}
      </blockquote>
    );
  }
  if (ev.kind === 'note') {
    return (
      <blockquote className="border-r-2 border-pm-chart-2/50 pr-3 text-body-sm leading-relaxed text-pm-text-primary">
        {ev.text || '—'}
      </blockquote>
    );
  }
  return <p className="text-body-sm text-pm-text-secondary">{ev.text || '—'}</p>;
}
