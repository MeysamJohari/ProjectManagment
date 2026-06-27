import { CalendarCheck, Crosshair, FileText } from 'lucide-react';
import { useToday } from '../../hooks/useToday.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Card, CardBody } from '../ui/Card.jsx';
import { StatusBadge, PriorityBadge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { Skeleton, EmptyState } from '../ui/Feedback.jsx';
import { toFa } from '../../lib/format.js';

/**
 * The "today" view (UI Kit §8.1).
 *  - Large hero card for the current-focus task (if any).
 *  - Grid of cards for active / priority=today tasks.
 * Clicking a card switches to the Projects view and opens the detail panel.
 */
export function TodayView() {
  const { current, tasks, loading } = useToday();
  const select = useAppStore((s) => s.select);
  const setView = useAppStore((s) => s.setView);

  const open = (path) => select(path); // select() already switches to 'projects'

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-4 h-28 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <CalendarCheck size={24} className="text-pm-brand" />
        <h1 className="text-display text-pm-text-primary">امروز</h1>
        <span className="rounded-full bg-pm-bg-subtle px-2.5 py-0.5 text-body-sm text-pm-text-secondary">
          {toFa(tasks.length + (current ? 1 : 0))}
        </span>
      </div>

      {/* Hero: current focus */}
      {current ? (
        <Card className="mb-6 border-pm-brand-muted/50 shadow-pm-md">
          <CardBody>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-pm-brand">
                  <Crosshair size={16} />
                  اکنون روی این کار می‌کنید
                </div>
                <h2 className="text-title-lg text-pm-text-primary">
                  {current.frontmatter?.title || current.path}
                </h2>
                <p className="mt-1 text-caption text-pm-text-tertiary pm-ltr">{current.path}</p>
                {current.frontmatter?.last_note && (
                  <p className="mt-3 rounded-pm-md bg-pm-bg-muted px-3 py-2 text-body-sm text-pm-text-secondary">
                    {current.frontmatter.last_note}
                  </p>
                )}
              </div>
              <Button className="shrink-0 whitespace-nowrap" onClick={() => open(current.path)}>باز کردن</Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardBody>
            <EmptyState
              icon={Crosshair}
              title="تمرکزی تنظیم نشده"
              description="یک تسک را باز کنید و روی «این رو الان دارم کار می‌کنم» بزنید."
            />
          </CardBody>
        </Card>
      )}

      {/* Task grid */}
      {tasks.length === 0 && !current ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="تسک فعالی ندارید"
            description="از درخت پروژه یک تسک باز کنید یا تسک جدید بسازید."
            action={
              <Button variant="dashed" onClick={() => setView('projects')}>
                + رفتن به پروژه‌ها
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <p className="mb-3 text-label text-pm-text-secondary">فعال‌ها و اولویت امروز</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((t) => (
              <TaskCard key={t.path} task={t} onOpen={() => open(t.path)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TaskCard({ task, onOpen }) {
  const fm = task.frontmatter || {};
  const projectPath = task.path.includes('/')
    ? task.path.slice(0, task.path.lastIndexOf('/'))
    : '_inbox';

  return (
    <button
      onClick={onOpen}
      className="flex w-full flex-col gap-2 rounded-pm-lg border border-pm-border bg-pm-bg-surface p-4 text-right shadow-pm-sm transition-all hover:-translate-y-0.5 hover:shadow-pm-md"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {fm.status && <StatusBadge status={fm.status} />}
        {fm.priority && <PriorityBadge priority={fm.priority} />}
      </div>
      <h3 className="text-title text-pm-text-primary">{fm.title || task.path}</h3>
      <p className="text-caption text-pm-text-tertiary pm-ltr">{projectPath}</p>
      {fm.last_note && (
        <p className="line-clamp-2 text-body-sm text-pm-text-secondary">«{fm.last_note}»</p>
      )}
    </button>
  );
}
