import { useEffect, useState } from 'react';
import { Field, AutoResizeTextarea } from '../ui/Input.jsx';
import { stripLogFromBody } from '../../lib/format.js';

/**
 * Optional static task notes (separate from the activity log).
 * Plain text — not a full markdown editor.
 */
export function TaskNotes({ body, onChange }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(stripLogFromBody(body));
  }, [body]);

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <Field
      label="یادداشت تسک"
      hint="توضیحات ثابت درباره‌ی تسک — با «ثبت کار»، هر اقدام با خط جدا در یادداشت و باکس در تاریخچه ثبت می‌شود."
      className="mb-0"
    >
      <AutoResizeTextarea
        value={value}
        onChange={handleChange}
        minHeight={72}
        maxHeight="50vh"
        placeholder="هدف تسک، لینک‌ها، نکات مهم…"
      />
    </Field>
  );
}
