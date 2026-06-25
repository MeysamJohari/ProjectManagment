import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell.jsx';
import { ToastHost } from './components/ui/Toast.jsx';
import { TodayView } from './components/Today/TodayView.jsx';
import { DetailPanel } from './components/Detail/DetailPanel.jsx';
import { useAppStore } from './store/useAppStore.js';
import { useCurrent } from './hooks/useCurrent.js';

export default function App() {
  const view = useAppStore((s) => s.view);
  const selectedPath = useAppStore((s) => s.selectedPath);
  const select = useAppStore((s) => s.select);
  const { refresh: refreshCurrent } = useCurrent();

  // Keep the "currently working on" banner fresh on load.
  useEffect(() => {
    refreshCurrent();
  }, [refreshCurrent]);

  return (
    <>
      <ToastHost />
      <AppShell selectedPath={selectedPath}>
        {view === 'today' ? (
          <TodayView />
        ) : (
          <ProjectsView selectedPath={selectedPath} onSelect={select} />
        )}
      </AppShell>
    </>
  );
}

/**
 * Projects view: a two-column workspace.
 * LEFT (in RTL = main side): the detail panel.
 * The tree itself lives in the Sidebar component (see Sidebar.jsx), so here we
 * only render the detail editor.
 */
function ProjectsView({ selectedPath }) {
  return (
    <div>
      <h1 className="mb-4 text-display text-pm-text-primary">پروژه‌ها</h1>
      <DetailPanel path={selectedPath} />
    </div>
  );
}
