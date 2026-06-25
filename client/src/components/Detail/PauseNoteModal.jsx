import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Input.jsx';
import { STOP_NOTE_MIN } from '../../lib/constants.js';

/**
 * Mandatory stop-note modal shown when switching focus AWAY from another task.
 * (UI Kit §5.9.) Primary button (right in RTL) is disabled until the note is
 * long enough — mirrors the server-side STOP_NOTE_MIN check.
 *
 * Props:
 *  - open: bool
 *  - previousTitle: string  (the task being stopped)
 *  - onConfirm(note): called with the trimmed note
 *  - onClose()
 */
export function PauseNoteModal({ open, previousTitle, onConfirm, onClose }) {
  const [note, setNote] = useState('');

  // Reset whenever (re)opened.
  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  const trimmed = note.trim();
  const valid = trimmed.length >= STOP_NOTE_MIN;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="قبل از توقف، یادداشت بنویسید"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button disabled={!valid} onClick={() => onConfirm(trimmed)}>
            توقف و سوییچ تمرکز
          </Button>
        </>
      }
    >
      <p className="mb-3 text-body-sm text-pm-text-secondary">
        در حال توقفِ تمرکز روی{' '}
        <span className="font-medium text-pm-text-primary">{previousTitle}</span> است.
        بنویس تا کجای کار پیش رفتی، تا دفعه‌ی بعد ادامه‌اش دهی.
      </p>
      <Textarea
        autoFocus
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`یادداشت توقف (حداقل ${STOP_NOTE_MIN} کاراکتر)`}
        className="min-h-[110px]"
      />
      <p className={`mt-1.5 text-caption ${valid ? 'text-pm-text-tertiary' : 'text-pm-feedback-warning'}`}>
        {trimmed.length}/{STOP_NOTE_MIN} کاراکتر
      </p>
    </Modal>
  );
}
