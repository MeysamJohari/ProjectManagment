import { CalendarCheck, FolderTree } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { VIEWS } from '../../lib/constants.js';
import { ProjectTree } from '../Sidebar/ProjectTree.jsx';

// UI Kit §5.1: fixed-width sidebar (260px), on the RIGHT in RTL, with section labels.
export function Sidebar({ selectedPath }) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const select = useAppStore((s) => s.select);

  const NavItem = ({ id, icon: Icon, label }) => {
    const active = view === id;
    return (
      <button
        onClick={() => {
          setView(id);
        }}
        className={`flex w-full items-center gap-2 rounded-pm-md px-3 py-2 text-body-sm transition-colors ${
          active
            ? 'bg-pm-brand-subtle font-medium text-pm-brand'
            : 'text-pm-text-secondary hover:bg-pm-bg-subtle hover:text-pm-text-primary'
        }`}
      >
        <Icon size={18} className="shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-pm-border bg-pm-bg-surface">
      {/* Section: navigation */}
      <div className="px-3 pt-4 pb-2">
        <p className="mb-1.5 px-3 text-caption text-pm-text-tertiary">فضای کار</p>
        <nav className="space-y-0.5">
          <NavItem id="today" icon={CalendarCheck} label={VIEWS.today} />
          <NavItem id="projects" icon={FolderTree} label={VIEWS.projects} />
        </nav>
      </div>

      {/* Section: project tree */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-pm-border">
        <p className="px-5 pt-3 pb-1 text-caption text-pm-text-tertiary">درخت پروژه</p>
        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          {view === 'projects' ? (
            <ProjectTree selectedPath={selectedPath} onSelect={select} />
          ) : (
            <div className="px-5 py-3 text-body-sm text-pm-text-tertiary">
              برای مرور پروژه‌ها به بخش «پروژه‌ها» بروید.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
