import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';
import { CurrentBanner } from './CurrentBanner.jsx';

/**
 * App shell (UI Kit §4.1).
 * RTL layout: Sidebar on the RIGHT, content column on the LEFT.
 *
 * flex-row-reverse so that in RTL the Sidebar (first child) lands on the right.
 */
export function AppShell({ selectedPath, children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-pm-bg-app text-pm-text-primary">
      <div className="flex h-full w-full flex-row-reverse">
        <Sidebar selectedPath={selectedPath} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="mx-auto w-full max-w-content flex-1 overflow-y-auto px-6 py-5">
            <div className="mb-4">
              <CurrentBanner />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
