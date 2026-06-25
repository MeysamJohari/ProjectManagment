import { useState } from 'react';
import { ChevronLeft, Folder, Inbox, FileText, Plus, Star } from 'lucide-react';
import { StatusBadge } from '../ui/Badge.jsx';

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
  onCreate,
  showAdd = true,
}) {
  const isFolder = node.type !== 'task';
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState('');

  const selected = node.path === selectedPath;
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
    // Create a task under this folder by default. Parent path is the folder's path.
    onCreate?.({ parentPath: node.path, title });
    setAddValue('');
    setAdding(false);
    setOpen(true);
  };

  return (
    <div>
      <div
        role={isFolder ? 'treeitem' : 'treeitem'}
        className={`group relative flex h-8 items-center gap-1.5 rounded-pm-sm text-body-sm transition-colors ${
          selected
            ? 'bg-pm-brand-subtle text-pm-brand'
            : 'text-pm-text-secondary hover:bg-pm-bg-subtle hover:text-pm-text-primary'
        }`}
        style={padInline}
      >
        {/* Selected marker on the right (RTL start) */}
        {selected && (
          <span className="absolute inset-inline-end-0 h-full w-0.5 rounded-full bg-pm-brand" />
        )}

        {/* Chevron for folders */}
        {isFolder ? (
          <button
            onClick={handleRowClick}
            className="shrink-0 rounded-pm-sm p-0.5 hover:bg-pm-bg-muted"
            aria-label={open ? 'جمع کردن' : 'باز کردن'}
          >
            <ChevronLeft
              size={14}
              className={`transition-transform ${open ? '-rotate-90' : ''}`}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {/* Icon + label */}
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
          <span className="truncate">
            {node.type === 'project' ? node.meta?.title || node.name : node.name}
          </span>

          {/* current-focus star */}
          {node.meta?.is_current && (
            <Star size={13} className="shrink-0 fill-pm-brand text-pm-brand" />
          )}
        </button>

        {/* Status badge for tasks */}
        {node.type === 'task' && node.meta?.status && (
          <StatusBadge status={node.meta.status} className="shrink-0" />
        )}

        {/* "+" add button (folders + inbox) */}
        {isFolder && showAdd && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="shrink-0 rounded-pm-sm p-0.5 opacity-0 transition-opacity hover:bg-pm-bg-muted group-hover:opacity-100"
            aria-label="افزودن تسک جدید"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Inline add form */}
      {adding && isFolder && (
        <form
          onSubmit={submitAdd}
          className="mt-1 flex items-center gap-1.5"
          style={{ paddingInlineStart: `${(depth + 1) * 16 + 8}px` }}
        >
          <FileText size={14} className="text-pm-text-tertiary" />
          <input
            autoFocus
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onBlur={() => !addValue && setAdding(false)}
            placeholder="عنوان تسک…"
            className="h-7 flex-1 rounded-pm-sm border border-pm-border bg-white px-2 text-body-sm focus:border-pm-border-focus focus:outline-none"
          />
          <button
            type="submit"
            disabled={!addValue.trim()}
            className="rounded-pm-sm bg-pm-brand px-2 py-1 text-caption text-white disabled:opacity-40"
          >
            افزودن
          </button>
        </form>
      )}

      {/* Children */}
      {isFolder && open && node.children?.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCreate={onCreate}
              showAdd={showAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
