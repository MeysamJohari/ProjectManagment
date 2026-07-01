import { useEffect, useState } from 'react';
import { Save, Trash2, FileText } from 'lucide-react';
import { useItem } from '../../hooks/useItem.js';
import { useAppStore } from '../../store/useAppStore.js';
import { buildBodyWithLog, extractLogRawText, stripLogFromBody, appendWorkNoteBlock } from '../../lib/format.js';
import { api } from '../../api/client.js';
import { Button } from '../ui/Button.jsx';
import { Card, CardBody } from '../ui/Card.jsx';
import { Skeleton, EmptyState, Spinner } from '../ui/Feedback.jsx';
import { Modal } from '../ui/Modal.jsx';
import { FrontmatterEditor } from './FrontmatterEditor.jsx';
import { TaskNotes } from './TaskNotes.jsx';
import { CurrentFocusToggle } from './CurrentFocusToggle.jsx';
import { LogTimeline } from './LogTimeline.jsx';

/**
 * Controller panel for the selected item. Composes all the editors and wires
 * up Save (POST /api/item — never touches is_current) and permanent delete.
 */
export function DetailPanel({ path }) {
  const { item, loading, error, reload, save, remove } = useItem(path);
  const pushToast = useAppStore((s) => s.pushToast);
  const current = useAppStore((s) => s.current);

  const [fmDraft, setFmDraft] = useState(null);
  const [fmDirty, setFmDirty] = useState(false);
  const [notesDraft, setNotesDraft] = useState(null);
  const [logDraft, setLogDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset drafts when item changes.
  useEffect(() => {
    setFmDraft(null);
    setFmDirty(false);
    setNotesDraft(null);
    setLogDraft(null);
  }, [path]);

  if (!path) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="تسکی انتخاب نشده"
          description="از درخت پروژه یک تسک باز کنید یا تسک جدید بسازید."
        />
      </Card>
    );
  }

  if (loading || !item) {
    if (error) {
      return (
        <Card>
          <EmptyState
            icon={FileText}
            title="بارگذاری تسک ناموفق بود"
            description={error.message}
            action={<Button variant="secondary" onClick={reload}>تلاش دوباره</Button>}
          />
        </Card>
      );
    }
    return (
      <Card>
        <CardBody>
          <Skeleton className="h-8 w-1/2" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="بارگذاری تسک ناموفق بود"
          description={error.message}
          action={<Button variant="secondary" onClick={reload}>تلاش دوباره</Button>}
        />
      </Card>
    );
  }

  const isCurrent = !!current && current.path === path;

  const handleFmChange = (next, dirty) => {
    setFmDraft(next);
    setFmDirty(dirty);
  };

  const handleNotesChange = (val) => {
    setNotesDraft(val);
  };

  const handleLogChange = async (val) => {
    setLogDraft(val);
    setSaving(true);
    try {
      const notes = notesDraft !== null ? notesDraft : stripLogFromBody(item.body);
      const body = buildBodyWithLog(notes, val);
      await save({ frontmatter: {}, body });
      setLogDraft(null);
      pushToast('success', 'تاریخچه ذخیره شد.');
    } catch (err) {
      pushToast('error', err.message || 'ذخیره تاریخچه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWorkEntry = async (text) => {
    setSaving(true);
    try {
      const notes = notesDraft !== null ? notesDraft : stripLogFromBody(item.body);
      const nextNotes = appendWorkNoteBlock(notes, text);

      const updated = await api.appendLogNote({ path, text });
      const logRaw = extractLogRawText(updated.body);
      const body = buildBodyWithLog(nextNotes, logRaw);
      await save({ frontmatter: {}, body });
      setNotesDraft(null);
      setLogDraft(null);
      pushToast('success', 'کار در تاریخچه و یادداشت ثبت شد.');
    } catch (err) {
      pushToast('error', err.message || 'ثبت کار ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const resolvedNotes = notesDraft !== null ? notesDraft : stripLogFromBody(item.body);
  const resolvedLog = logDraft !== null ? logDraft : extractLogRawText(item.body);

  const isBodyDirty = () => {
    if (notesDraft !== null && notesDraft !== stripLogFromBody(item.body)) return true;
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fmToSave = fmDraft && fmDirty ? fmDraft : null;
      const notes = notesDraft !== null ? notesDraft : stripLogFromBody(item.body);
      const logRaw = logDraft !== null ? logDraft : extractLogRawText(item.body);
      const body = buildBodyWithLog(notes, logRaw);
      await save({ frontmatter: fmToSave || {}, body });
      setNotesDraft(null);
      setLogDraft(null);
      setFmDirty(false);
      pushToast('success', 'ذخیره شد.');
    } catch (err) {
      pushToast('error', err.message || 'ذخیره ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await remove();
      useAppStore.getState().bumpTree();
      pushToast('success', 'تسک حذف شد.');
      useAppStore.getState().select(null);
      useAppStore.getState().setView('projects');
    } catch (err) {
      pushToast('error', err.message || 'حذف ناموفق بود.');
    }
  };

  const dirty = fmDirty || isBodyDirty();

  return (
    <Card>
      <CardBody>
        {/* Header row: title + current-focus toggle */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption text-pm-text-tertiary pm-ltr">{path}</p>
            <h2 className="text-title-lg text-pm-text-primary">
              {fmDraft?.title || item.frontmatter?.title || item.path}
            </h2>
          </div>
          <CurrentFocusToggle path={path} isCurrent={isCurrent} onChanged={reload} />
        </div>

        {/* Frontmatter */}
        <div className="mb-5 rounded-pm-md border border-pm-border bg-pm-bg-subtle/40 p-4">
          <FrontmatterEditor frontmatter={item.frontmatter || {}} onChange={handleFmChange} />
        </div>

        {/* Optional static notes */}
        <div className="mb-5 rounded-pm-md border border-pm-border p-4">
          <TaskNotes body={item.body} onChange={handleNotesChange} />
        </div>

        {/* Activity roadmap + editable log */}
        <div className="mb-5 rounded-pm-md border border-pm-border p-4">
          <LogTimeline
            body={item.body}
            notes={resolvedNotes}
            logRawText={resolvedLog}
            onLogChange={handleLogChange}
            onAddWork={handleAddWorkEntry}
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-pm-border pt-4">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} />
            حذف تسک
          </Button>
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? <Spinner size={16} /> : <Save size={16} />}
            ذخیره
          </Button>
        </div>
      </CardBody>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="حذف تسک"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>انصراف</Button>
            <Button variant="danger" onClick={handleDelete}>حذف</Button>
          </>
        }
      >
        <p className="text-body-sm text-pm-text-secondary">
          این تسک برای همیشه حذف می‌شود و قابل بازیابی نیست. ادامه می‌دهید؟
        </p>
      </Modal>
    </Card>
  );
}
