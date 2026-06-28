import { useState } from 'react';
import { FolderPlus, FolderTree, Plus } from 'lucide-react';
import { useTree } from '../../hooks/useTree.js';
import { TreeNode } from './TreeNode.jsx';
import { api } from '../../api/client.js';
import { slugify } from '../../lib/format.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/Button.jsx';
import { Skeleton } from '../ui/Feedback.jsx';
import { Modal } from '../ui/Modal.jsx';

const INBOX_PATH = '_inbox';

function nodeLabel(node) {
  if (!node) return '';
  if (node.type === 'inbox') return 'صندوق ورودی';
  return node.meta?.title || node.name;
}

/**
 * Renders the recursive project tree (incl. _inbox).
 * Creating a task: builds a path under the parent folder and POSTs /api/item.
 * Creating a project: POSTs /api/project with title + optional parentPath.
 */
export function ProjectTree({ selectedPath, onSelect }) {
  const { tree, loading, error } = useTree();
  const pushToast = useAppStore((s) => s.pushToast);
  const bumpTree = useAppStore((s) => s.bumpTree);
  const setView = useAppStore((s) => s.setView);
  const select = useAppStore((s) => s.select);
  const [addingProject, setAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateTask = async ({ parentPath, title }) => {
    // A task with no explicit parent goes to the inbox.
    const folder = parentPath || INBOX_PATH;
    const slug = slugify(title);
    const path = `${folder.replace(/\/$/, '')}/task-${slug}.md`;
    try {
      await api.createItem({
        path,
        frontmatter: { title, type: 'task', status: 'backlog', priority: 'normal' },
        body: '',
      });
      pushToast('success', 'تسک ساخته شد.');
      bumpTree();
      setView('projects');
      onSelect?.(path);
    } catch (err) {
      pushToast('error', err.message || 'ساخت تسک ناموفق بود.');
    }
  };

  const handleCreateProject = async ({ parentPath = '', title }) => {
    try {
      const created = await api.createProject({ title, parentPath });
      pushToast('success', 'پروژه ساخته شد.');
      bumpTree();
      setView('projects');
      return created;
    } catch (err) {
      pushToast('error', err.message || 'ساخت پروژه ناموفق بود.');
      throw err;
    }
  };

  const handleDeleteRequest = (node) => {
    setDeleteTarget(node);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'task') {
        await api.deleteItem(deleteTarget.path);
        pushToast('success', 'تسک به سطل بازیافت منتقل شد.');
      } else {
        await api.deleteProject(deleteTarget.path);
        pushToast('success', 'پروژه به سطل بازیافت منتقل شد.');
      }
      if (selectedPath === deleteTarget.path || selectedPath?.startsWith(`${deleteTarget.path}/`)) {
        select(null);
      }
      bumpTree();
      setDeleteTarget(null);
    } catch (err) {
      pushToast('error', err.message || 'حذف ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  const handleRename = async ({ node, title }) => {
    const isProject = node.type === 'project';
    try {
      await api.rename({ path: node.path, title, isProject });
      pushToast('success', 'نام تغییر کرد.');
      bumpTree();
    } catch (err) {
      pushToast('error', err.message || 'تغییر نام ناموفق بود.');
    }
  };

  const handleMove = async ({ from, to }) => {
    try {
      const result = await api.moveItem({ from, to });
      // If the moved item was selected, update selectedPath to the new location.
      if (selectedPath === from) {
        select(result.newPath);
      }
      bumpTree();
      pushToast('success', 'آیتم منتقل شد.');
    } catch (err) {
      pushToast('error', err.message || 'انتقال ناموفق بود.');
    }
  };

  const submitRootProject = async (e) => {
    e.preventDefault();
    const title = projectTitle.trim();
    if (!title) return;
    setCreatingProject(true);
    try {
      await handleCreateProject({ title });
      setProjectTitle('');
      setAddingProject(false);
    } catch {
      /* toast shown */
    } finally {
      setCreatingProject(false);
    }
  };

  const submitRootTask = async (e) => {
    e.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    setCreatingTask(true);
    try {
      // No parentPath → lands in _inbox.
      await handleCreateTask({ parentPath: '', title });
      setTaskTitle('');
      setAddingTask(false);
    } catch {
      /* toast shown */
    } finally {
      setCreatingTask(false);
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

  const deleteTitle =
    deleteTarget?.type === 'task' ? 'حذف تسک' : 'حذف پروژه';

  return (
    <div className="px-2 py-1">
      <div className="mb-2 px-1">
        {addingProject ? (
          <form onSubmit={submitRootProject} className="space-y-2 rounded-pm-md border border-pm-border bg-pm-bg-muted p-2">
            <input
              autoFocus
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="نام پروژه جدید…"
              className="h-8 w-full rounded-pm-sm border border-pm-border bg-white px-2 text-body-sm focus:border-pm-border-focus focus:outline-none"
            />
            <div className="flex items-center gap-1.5">
              <Button type="submit" size="sm" disabled={!projectTitle.trim() || creatingProject}>
                ساخت پروژه
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingProject(false);
                  setProjectTitle('');
                }}
              >
                انصراف
              </Button>
            </div>
          </form>
        ) : addingTask ? (
          <form onSubmit={submitRootTask} className="space-y-2 rounded-pm-md border border-pm-border bg-pm-bg-muted p-2">
            <input
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="عنوان تسک جدید…"
              className="h-8 w-full rounded-pm-sm border border-pm-border bg-white px-2 text-body-sm focus:border-pm-border-focus focus:outline-none"
            />
            <div className="flex items-center gap-1.5">
              <Button type="submit" size="sm" disabled={!taskTitle.trim() || creatingTask}>
                ساخت تسک
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingTask(false);
                  setTaskTitle('');
                }}
              >
                انصراف
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="dashed"
              size="sm"
              className="flex-1"
              onClick={() => setAddingProject(true)}
            >
              <FolderPlus size={16} />
              پروژه
            </Button>
            <Button
              variant="dashed"
              size="sm"
              className="flex-1"
              onClick={() => setAddingTask(true)}
            >
              <Plus size={16} />
              تسک
            </Button>
          </div>
        )}
      </div>

      {!tree || tree.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-pm-md px-3 py-6 text-center text-body-sm text-pm-text-tertiary">
          <FolderTree size={22} className="text-pm-text-tertiary" />
          هنوز پروژه‌ای وجود ندارد. با دکمهٔ بالا یکی بسازید.
        </div>
      ) : (
        <div role="tree" aria-label="درخت پروژه">
          {tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCreateTask={handleCreateTask}
              onCreateProject={handleCreateProject}
              onDelete={handleDeleteRequest}
              onRename={handleRename}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={deleteTitle}
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              انصراف
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'در حال حذف…' : 'حذف'}
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-pm-text-secondary">
          {deleteTarget?.type === 'task' ? (
            <>
              تسک <span className="font-medium text-pm-text-primary">{nodeLabel(deleteTarget)}</span> به
              سطل بازیافت منتقل می‌شود. پس از ۱۰ روز به‌طور دائم حذف می‌شود.
            </>
          ) : deleteTarget?.type === 'project' ? (
            <>
              پروژه <span className="font-medium text-pm-text-primary">{nodeLabel(deleteTarget)}</span> و
              تمام تسک‌ها و زیرپروژه‌هایش به سطل بازیافت منتقل می‌شوند. پس از ۱۰ روز به‌طور دائم حذف
              می‌شوند.
            </>
          ) : null}
        </p>
      </Modal>
    </div>
  );
}
