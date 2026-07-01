import { useMemo, useState } from 'react';
import {
  History,
  ArrowLeft,
  Play,
  Square,
  PenLine,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  parseLogFromBody,
  extractLogRawText,
  formatDateTime,
  appendLogLine,
  noteLogPayload,
  buildBodyWithLog,
  stripLogFromBody,
} from '../../lib/format.js';
import { STATUS } from '../../lib/constants.js';
import { EmptyState } from '../ui/Feedback.jsx';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Input.jsx';
import { LogEventModal } from './LogEventModal.jsx';
import { AddLogEntryModal } from './AddLogEntryModal.jsx';

/**
 * Interactive activity roadmap: clickable milestone cards + manual log editing.
 * RTL spine on the right (UI Kit §5.8).
 */
export function LogTimeline({ body, notes, logRawText, onLogChange, onAddWork }) {
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState('');

  const effectiveLog = logRawText ?? extractLogRawText(body);
  const effectiveBody = buildBodyWithLog(notes ?? stripLogFromBody(body), effectiveLog);

  const events = useMemo(() => {
    const parsed = parseLogFromBody(effectiveBody);
    const lines = effectiveLog.split('\n').filter((l) => l.trim());
    return parsed.map((ev, i) => ({
      ...ev,
      index: i,
      rawLine: lines[i] || '',
    }));
  }, [effectiveBody, effectiveLog]);

  const handleAddEntry = (text) => {
    setAddOpen(false);
    if (onAddWork) {
      onAddWork(text);
      return;
    }
    const next = appendLogLine(effectiveLog, noteLogPayload(text));
    onLogChange?.(next);
  };

  const openRawEditor = () => {
    setEditDraft(effectiveLog);
    setEditOpen(true);
  };

  const saveRawEditor = () => {
    onLogChange?.(editDraft.trimEnd());
    setEditOpen(false);
  };

  if (events.length === 0 && !editOpen) {
    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-label text-pm-text-secondary">تاریخچه</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
              <PenLine size={14} />
              ثبت کار
            </Button>
            <Button variant="ghost" size="sm" onClick={() => (editOpen ? setEditOpen(false) : openRawEditor())}>
              ویرایش دستی
            </Button>
          </div>
        </div>
        <div className="py-4">
          <EmptyState
            icon={History}
            title="هنوز رویدادی ثبت نشده"
            description="تغییر وضعیت، سوییچ تمرکز یا «ثبت کار» اولین مرحله را اضافه می‌کند."
          />
        </div>
        <AddLogEntryModal open={addOpen} onConfirm={handleAddEntry} onClose={() => setAddOpen(false)} />
        {editOpen && (
          <RawLogEditor
            value={editDraft}
            onChange={setEditDraft}
            onSave={saveRawEditor}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </div>
    );
  }

  // Oldest → newest for roadmap (bottom = latest).
  const ordered = [...events];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-label text-pm-text-secondary">تاریخچه</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
            <PenLine size={14} />
            ثبت کار
          </Button>
          <Button variant="ghost" size="sm" onClick={() => (editOpen ? setEditOpen(false) : openRawEditor())}>
            {editOpen ? (
              <>
                <ChevronUp size={14} />
                بستن ویرایش
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                ویرایش دستی
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="pr-1">
        <ol className="relative mr-2 border-r-2 border-pm-border pr-4">
          {ordered.map((ev, i) => (
            <li key={`${ev.timestamp}-${i}`} className="relative mb-4 last:mb-0">
              <span
                className={`absolute -right-[calc(0.5rem+7px)] top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                  ev.kind === 'focus'
                    ? 'bg-pm-brand'
                    : ev.kind === 'note'
                      ? 'bg-pm-chart-2'
                      : ev.kind === 'status'
                        ? 'bg-pm-chart-3'
                        : 'bg-pm-text-tertiary'
                }`}
              />
              <button
                type="button"
                onClick={() => setSelected(ev)}
                className="group w-full rounded-pm-md border border-pm-border bg-pm-bg-surface p-3 text-right shadow-pm-sm transition-all hover:border-pm-brand/40 hover:bg-pm-brand-subtle/30 hover:shadow-pm-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pm-brand/30"
              >
                <EventCard ev={ev} isLatest={i === ordered.length - 1} />
              </button>
            </li>
          ))}
        </ol>
      </div>

      {editOpen && (
        <RawLogEditor
          value={editDraft}
          onChange={setEditDraft}
          onSave={saveRawEditor}
          onCancel={() => setEditOpen(false)}
        />
      )}

      <LogEventModal event={selected} open={!!selected} onClose={() => setSelected(null)} />
      <AddLogEntryModal open={addOpen} onConfirm={handleAddEntry} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function EventCard({ ev, isLatest }) {
  if (ev.kind === 'status') {
    const from = STATUS[ev.from]?.label || ev.from;
    const to = STATUS[ev.to]?.label || ev.to;
    return (
      <>
        <div className="flex items-center justify-between gap-2">
          <span className="text-body-sm font-medium text-pm-text-primary">تغییر وضعیت</span>
          {isLatest && (
            <span className="rounded-full bg-pm-brand-subtle px-2 py-0.5 text-caption text-pm-brand">
              آخرین
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-body-sm text-pm-text-secondary">
          <span>{from}</span>
          <ArrowLeft size={13} className="shrink-0 text-pm-text-tertiary" />
          <span className="font-medium text-pm-text-primary">{to}</span>
        </div>
        <p className="mt-1.5 text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(ev.timestamp)}</p>
      </>
    );
  }

  if (ev.kind === 'focus') {
    const started = ev.action === 'started';
    const Icon = started ? Play : Square;
    return (
      <>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-body-sm font-medium text-pm-brand">
            <Icon size={14} />
            {started ? 'شروع تمرکز' : 'توقف تمرکز'}
          </div>
          {isLatest && (
            <span className="rounded-full bg-pm-brand-subtle px-2 py-0.5 text-caption text-pm-brand">
              آخرین
            </span>
          )}
        </div>
        {!started && ev.note && (
          <p className="mt-1.5 line-clamp-2 text-body-sm text-pm-text-secondary">«{ev.note}»</p>
        )}
        <p className="mt-1.5 text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(ev.timestamp)}</p>
      </>
    );
  }

  if (ev.kind === 'note') {
    return (
      <>
        <div className="flex items-center justify-between gap-2">
          <span className="text-body-sm font-medium text-pm-text-primary">کار انجام‌شده</span>
          {isLatest && (
            <span className="rounded-full bg-pm-brand-subtle px-2 py-0.5 text-caption text-pm-brand">
              آخرین
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-3 text-body-sm text-pm-text-secondary">{ev.text}</p>
        <p className="mt-1.5 text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(ev.timestamp)}</p>
      </>
    );
  }

  return (
    <>
      <p className="text-body-sm text-pm-text-primary">{ev.text || 'رویداد'}</p>
      <p className="mt-1 text-caption text-pm-text-tertiary pm-ltr">{formatDateTime(ev.timestamp)}</p>
    </>
  );
}

function RawLogEditor({ value, onChange, onSave, onCancel }) {
  return (
    <div className="mt-4 rounded-pm-md border border-pm-border bg-pm-bg-muted/40 p-3">
      <p className="mb-2 text-label text-pm-text-secondary">ویرایش دستی لاگ</p>
      <p className="mb-2 text-caption text-pm-text-tertiary">
        هر خط با «- timestamp | …» — می‌توانید خط اشتباه را پاک کنید یا خط جدید اضافه کنید.
      </p>
      <Textarea
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[140px] font-mono text-body-sm leading-relaxed pm-ltr"
        spellCheck={false}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          انصراف
        </Button>
        <Button size="sm" onClick={onSave}>
          اعمال ویرایش
        </Button>
      </div>
    </div>
  );
}
