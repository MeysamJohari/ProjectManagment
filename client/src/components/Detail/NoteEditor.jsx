import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { stripLogFromBody } from '../../lib/format.js';

/**
 * Markdown editor with live preview. The body the user edits EXCLUDES the
 * `## Log` section (which is server-managed & append-only). On save, only this
 * edited body is sent back; the server preserves the Log.
 */
export function NoteEditor({ body, onChange }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(stripLogFromBody(body));
  }, [body]);

  const handleChange = (val) => {
    setValue(val ?? '');
    onChange?.(val ?? '');
  };

  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={handleChange}
        height={320}
        preview="live"
        dir="rtl"
      />
    </div>
  );
}
