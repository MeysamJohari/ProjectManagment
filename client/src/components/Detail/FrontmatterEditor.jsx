import { useEffect, useState } from 'react';
import { Field, Input, Select, AutoResizeTextarea } from '../ui/Input.jsx';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../lib/constants.js';

/**
 * Editable frontmatter fields: title, status, priority, last_note.
 * Controlled via a local draft + reports its value & dirty state upward.
 */
export function FrontmatterEditor({ frontmatter, onChange }) {
  const [draft, setDraft] = useState(() => normalize(frontmatter));

  // Resync when a different item is loaded.
  useEffect(() => {
    setDraft(normalize(frontmatter));
  }, [frontmatter]);

  const update = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onChange?.(next, isDirty(next, frontmatter));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="عنوان" className="md:col-span-2">
        <Input
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="عنوان تسک را وارد کنید"
        />
      </Field>

      <Field label="وضعیت">
        <Select value={draft.status} onChange={(e) => update({ status: e.target.value })}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="اولویت">
        <Select value={draft.priority} onChange={(e) => update({ priority: e.target.value })}>
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="یادداشت زمینه" className="md:col-span-2" hint="زمینه‌ی کوتاه برای جلسه‌ی بعدی کار">
        <AutoResizeTextarea
          value={draft.last_note || ''}
          onChange={(e) => update({ last_note: e.target.value })}
          placeholder="مثلاً: منتظر بررسی طراحی"
        />
      </Field>
    </div>
  );
}

function normalize(fm = {}) {
  return {
    title: fm.title || '',
    status: fm.status || 'backlog',
    priority: fm.priority || 'normal',
    last_note: fm.last_note || '',
  };
}

function isDirty(draft, original = {}) {
  const o = normalize(original);
  return (
    draft.title !== o.title ||
    draft.status !== o.status ||
    draft.priority !== o.priority ||
    (draft.last_note || '') !== (o.last_note || '')
  );
}
