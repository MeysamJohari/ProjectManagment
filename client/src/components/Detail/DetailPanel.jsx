import { useEffect, useRef, useState } from 'react';
import { Save, Trash2, FileText } from 'lucide-react';
import { useItem } from '../../hooks/useItem.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/Button.jsx';
import { Card, CardBody } from '../ui/Card.jsx';
import { Skeleton, EmptyState, Spinner } from '../ui/Feedback.jsx';
import { Modal } from '../ui/Modal.jsx';
import { FrontmatterEditor } from './FrontmatterEditor.jsx';
import { NoteEditor } from './NoteEditor.jsx';
import { CurrentFocusToggle } from './CurrentFocusToggle.jsx';
import { LogTimeline } from './LogTimeline.jsx';

/**
 * Controller panel for the selected item. Composes all the editors and wires
 * up Save (POST /api/item — never touches is_current) and soft-delete.
 */
export function DetailPanel({ path }) {
  const { item, loading, error, reload, save, remove } = useItem(path);
  const pushToast = useAppStore((s) => s.pushToast);
  const current = useAppStore((s) => s.current);

  const [fmDraft, setFmDraft] = useState(null);
  const [fmDirty, setFmDirty] = useState(false);
  const bodyRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset drafts when item changes.
  useEffect(() => {
    setFmDraft(null);
    setFmDirty(false);
    bodyRef.current = null;
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

  if (loading && !item) {
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

  if (error && !item) {
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

  const handleBodyChange = (val) => {
    bodyRef.current = val;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fmToSave = fmDraft && fmDirty ? fmDraft : null;
      // Always send the body (server replaces it). If untouched, send the
      // original (minus Log) so we don't clobber it.
      const body = bodyRef.current !== null ? bodyRef.current : item.body;
      await save({ frontmatter: fmToSave || {}, body });
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
      pushToast('success', 'تسک به سطل بازگردانی منتقل شد.');
      useAppStore.getState().select(null);
      useAppStore.getState().setView('projects');
    } catch (err) {
      pushToast('error', err.message || 'حذف ناموفق بود.');
    }
  };

  return (
    <Card>
      <CardBody>
        {/* Header row: title + current-focus toggle */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption text-pm-text-tertiary pm-ltr">{path}</p>
            <h2 className="text-title-lg text-pm-text-primary">
              {fmDraft?.title || item.frontmatter.title || item.name}
            </h2>
          </div>
          <CurrentFocusToggle path={path} isCurrent={isCurrent} />
        </div>

        {/* Frontmatter */}
        <div className="mb-5">
          <FrontmatterEditor frontmatter={item.frontmatter} onChange={handleFmChange} />
        </div>

        {/* Body editor */}
        <div className="mb-5">
          <p className="mb-1.5 text-label text-pm-text-secondary">بدنه (مارک‌داون)</p>
          <NoteEditor body={item.body} onChange={handleBodyChange} />
        </div>

        {/* Log timeline */}
        <div className="mb-5">
          <p className="mb-2 text-label text-pm-text-secondary">تاریخچه</p>
          <LogTimeline body={item.body} />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-pm-border pt-4">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} />
            حذف تسک
          </Button>
          <Button onClick={handleSave} disabled={saving || (!fmDirty && bodyRef.current === null)}>
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
          این تسک به <span className="font-mono pm-ltr">data/.trash/</span> منتقل می‌شود
          (حذف نرم) و از طریق گیت محلی قابل بازیابی است. ادامه می‌دهید؟
        </p>
      </Modal>
    </Card>
  );
}
