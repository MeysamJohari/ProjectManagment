import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Input.jsx';

const NOTE_MIN = 3;

/**
 * Modal for manually logging what was done on this task.
 */
export function AddLogEntryModal({ open, onConfirm, onClose }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (open) setText('');
  }, [open]);

  const trimmed = text.trim();
  const valid = trimmed.length >= NOTE_MIN;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ثبت کار انجام‌شده"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button disabled={!valid} onClick={() => onConfirm(trimmed)}>
            ثبت در تاریخچه
          </Button>
        </>
      }
    >
      <p className="mb-3 text-body-sm text-pm-text-secondary">
        بنویس چه کاری انجام دادی — در نقشه‌ی تاریخچه به‌صورت یک مرحله‌ی جدید اضافه می‌شود.
      </p>
      <Textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="مثلاً: API لاگین را پیاده کردم و تست نوشتم"
        className="min-h-[100px]"
      />
      <p className={`mt-1.5 text-caption ${valid ? 'text-pm-text-tertiary' : 'text-pm-feedback-warning'}`}>
        {trimmed.length}/{NOTE_MIN} کاراکتر
      </p>
    </Modal>
  );
}
