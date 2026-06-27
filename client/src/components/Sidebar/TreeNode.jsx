import { useState } from 'react';
import { ChevronLeft, Folder, FolderPlus, Inbox, FileText, Plus, Star, Trash2 } from 'lucide-react';
import { StatusBadge } from '../ui/Badge.jsx';

function nodeLabel(node) {
  if (!node) return '';
  if (node.type === 'inbox') return 'صندوق ورودی';
  return node.meta?.title || node.name;
}

/**
 * A single tree node. Recursive: folders render their children.
 * RTL notes (UI Kit §5.7):
 *  - chevron points LEFT and opens leftward
 *  - selected row: border-r-2 border-pm-brand bg-pm-brand-subtle (border on the RIGHT/start side)
 *  - "+" button sits on the far end (start of the LTR reading = right in RTL)
 */
export function TreeNode({
  node,
  depth = 0,
  selectedPath,
  onSelect,
  onCreateTask,
  onCreateProject,
  onDelete,
  showAdd = true,
}) {
  const isFolder = node.type !== 'task';
  const isInbox = node.type === 'inbox';
  // Folders start collapsed by default. The inbox stays open so new inbox tasks
  // are immediately visible; everything else opens on user click.
  const [open, setOpen] = useState(isInbox);
  const [adding, setAdding] = useState(false);
  const [addMode, setAddMode] = useState('task'); // 'task' | 'project'
  const [addValue, setAddValue] = useState('');

  const selected = node.path === selectedPath;
  // Auto-open a folder when it (or a descendant) is the selected item, so the
  // user always sees where they are in the tree.
  const containsSelected =
    selectedPath && (selectedPath === node.path || selectedPath.startsWith(`${node.path}/`));
  const effectivelyOpen = open || containsSelected;
  const padInline = { paddingInlineStart: `${depth * 16 + 8}px` };

  const handleRowClick = () => {
    if (isFolder) {
      setOpen((o) => !o);
    } else {
      onSelect?.(node.path);
    }
  };

  const submitAdd = (e) => {
    e.preventDefault();
    const title = addValue.trim();
    if (!title) return;
    if (addMode === 'project' && !isInbox) {
      onCreateProject?.({ parentPath: node.path, title });
    } else {
      onCreateTask?.({ parentPath: node.path, title });
    }
    setAddValue('');
    setAdding(false);
    setOpen(true);
  };

  const openAddForm = (mode) => {
    setAddMode(mode);
    setAdding(true);
    setOpen(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(node);
  };

  return (
    <div>
      <div
        role="treeitem"
        className={`group relative flex h-8 items-center gap-1.5 rounded-pm-sm text-body-sm transition-colors ${
          selected
            ? 'bg-pm-brand-subtle text-pm-brand'
            : 'text-pm-text-secondary hover:bg-pm-bg-subtle hover:text-pm-text-primary'
        }`}
        style={padInline}
      >
        {selected && (
          <span className="absolute inset-inline-end-0 h-full w-0.5 rounded-full bg-pm-brand" />
        )}

        {isFolder ? (
          <button
            onClick={handleRowClick}
            className="shrink-0 rounded-pm-sm p-0.5 hover:bg-pm-bg-muted"
            aria-label={effectivelyOpen ? 'جمع کردن' : 'باز کردن'}
          >
            <ChevronLeft
              size={14}
              className={`transition-transform ${effectivelyOpen ? '-rotate-90' : ''}`}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        <button
          onClick={handleRowClick}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-right"
        >
          {node.type === 'inbox' ? (
            <Inbox size={15} className="shrink-0 text-pm-brand" />
          ) : node.type === 'project' ? (
            <Folder size={15} className="shrink-0 text-pm-chart-5" />
          ) : (
            <FileText size={15} className="shrink-0 text-pm-text-tertiary" />
          )}
          <span className="truncate">{nodeLabel(node)}</span>

          {node.meta?.is_current && (
            <Star size={13} className="shrink-0 fill-pm-brand text-pm-brand" />
          )}
        </button>

        {node.type === 'task' && node.meta?.status && (
          <StatusBadge status={node.meta.status} className="shrink-0" />
        )}

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {isFolder && showAdd && (
            <>
              {!isInbox && (
                <button
                  onClick={() => openAddForm('project')}
                  className="rounded-pm-sm p-0.5 hover:bg-pm-bg-muted"
                  aria-label="افزودن زیرپروژه"
                  title="زیرپروژه جدید"
                >
                  <FolderPlus size={14} />
                </button>
              )}
              <button
                onClick={() => openAddForm('task')}
                className="rounded-pm-sm p-0.5 hover:bg-pm-bg-muted"
                aria-label="افزودن تسک جدید"
                title="تسک جدید"
              >
                <Plus size={14} />
              </button>
            </>
          )}

          {!isInbox && (
            <button
              onClick={handleDeleteClick}
              className="rounded-pm-sm p-0.5 text-pm-feedback-error hover:bg-red-50"
              aria-label={node.type === 'task' ? 'حذف تسک' : 'حذف پروژه'}
              title={node.type === 'task' ? 'حذف تسک' : 'حذف پروژه'}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {adding && isFolder && (
        <form
          onSubmit={submitAdd}
          className="mt-1 space-y-1.5 rounded-pm-md border border-pm-border bg-pm-bg-muted p-2"
          style={{ marginInlineStart: `${(depth + 1) * 16 + 8}px` }}
        >
          <p className="text-caption text-pm-text-tertiary">
            {addMode === 'project' ? 'زیرپروژه جدید' : 'تسک جدید'}
          </p>
          <div className="flex items-center gap-1.5">
            {addMode === 'project' ? (
              <FolderPlus size={14} className="text-pm-text-tertiary" />
            ) : (
              <FileText size={14} className="text-pm-text-tertiary" />
            )}
            <input
              autoFocus
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onBlur={() => !addValue && setAdding(false)}
              placeholder={addMode === 'project' ? 'نام زیرپروژه…' : 'عنوان تسک…'}
              className="h-7 flex-1 rounded-pm-sm border border-pm-border bg-white px-2 text-body-sm focus:border-pm-border-focus focus:outline-none"
            />
            <button
              type="submit"
              disabled={!addValue.trim()}
              className="rounded-pm-sm bg-pm-brand px-2 py-1 text-caption text-white disabled:opacity-40"
            >
              افزودن
            </button>
          </div>
        </form>
      )}

      {isFolder && effectivelyOpen && node.children?.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCreateTask={onCreateTask}
              onCreateProject={onCreateProject}
              onDelete={onDelete}
              showAdd={showAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
