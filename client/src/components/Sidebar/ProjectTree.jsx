import { useTree } from '../../hooks/useTree.js';
import { TreeNode } from './TreeNode.jsx';
import { api } from '../../api/client.js';
import { slugify } from '../../lib/format.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Skeleton } from '../ui/Feedback.jsx';
import { FolderTree } from 'lucide-react';

/**
 * Renders the recursive project tree (incl. _inbox).
 * Creating a task: builds a path under the parent folder and POSTs /api/item.
 */
export function ProjectTree({ selectedPath, onSelect }) {
  const { tree, loading, error, refresh } = useTree();
  const pushToast = useAppStore((s) => s.pushToast);

  const handleCreate = async ({ parentPath, title }) => {
    // parentPath is a folder path (relative to data/). Task file = parentPath/<slug>.md
    const slug = slugify(title);
    const path = `${parentPath.replace(/\/$/, '')}/task-${slug}.md`;
    try {
      await api.createItem({
        path,
        frontmatter: { title, type: 'task', status: 'backlog', priority: 'normal' },
        body: '',
      });
      pushToast('success', 'تسک ساخته شد.');
      await refresh();
      onSelect?.(path);
    } catch (err) {
      pushToast('error', err.message || 'ساخت تسک ناموفق بود.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 px-3 py-2">
        {[14, 22, 18, 26, 30].map((w, i) => (
          <Skeleton key={i} className="h-6" style={{ width: `${100 - w}%` }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-4 text-center text-body-sm text-pm-feedback-error">
        بارگذاری درخت ناموفق بود.
      </div>
    );
  }

  if (!tree || tree.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-3 py-6 text-center text-body-sm text-pm-text-tertiary">
        <FolderTree size={22} className="text-pm-text-tertiary" />
        هنوز پروژه‌ای وجود ندارد.
      </div>
    );
  }

  return (
    <div className="px-2 py-1" role="tree" aria-label="درخت پروژه">
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onCreate={handleCreate}
        />
      ))}
    </div>
  );
}
