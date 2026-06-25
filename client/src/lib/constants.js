// Persian labels + Tailwind class maps for status & priority (UI Kit §5.4).

export const STATUS = {
  active: { label: 'فعال', dot: 'bg-pm-status-active', text: 'text-pm-status-active', chip: 'bg-pm-status-activeBg' },
  paused: { label: 'متوقف', dot: 'bg-pm-status-paused', text: 'text-pm-status-paused', chip: 'bg-pm-status-pausedBg' },
  done: { label: 'انجام‌شده', dot: 'bg-pm-status-done', text: 'text-pm-status-done', chip: 'bg-pm-status-doneBg' },
  backlog: { label: 'بک‌لاگ', dot: 'bg-pm-status-backlog', text: 'text-pm-status-backlog', chip: 'bg-pm-status-backlogBg' },
};

export const STATUS_OPTIONS = [
  { value: 'active', label: 'فعال' },
  { value: 'paused', label: 'متوقف' },
  { value: 'done', label: 'انجام‌شده' },
  { value: 'backlog', label: 'بک‌لاگ' },
];

export const PRIORITY = {
  today: { label: 'امروز', dot: 'bg-pm-priority-today', text: 'text-pm-priority-today', chip: 'bg-pm-priority-todayBg' },
  high: { label: 'بالا', dot: 'bg-pm-priority-high', text: 'text-pm-priority-high', chip: 'bg-pm-priority-highBg' },
  normal: { label: 'عادی', dot: 'bg-pm-priority-normal', text: 'text-pm-priority-normal', chip: 'bg-pm-priority-normalBg' },
  low: { label: 'پایین', dot: 'bg-pm-priority-low', text: 'text-pm-priority-low', chip: 'bg-pm-priority-lowBg' },
};

export const PRIORITY_OPTIONS = [
  { value: 'today', label: 'امروز' },
  { value: 'high', label: 'بالا' },
  { value: 'normal', label: 'عادی' },
  { value: 'low', label: 'پایین' },
];

export const RECURRENCE_OPTIONS = [
  { value: '', label: 'بدون تکرار' },
  { value: 'weekly', label: 'هفتگی' },
  { value: 'monthly', label: 'ماهانه' },
];

export const STOP_NOTE_MIN = 10;

export const VIEWS = {
  today: 'امروز',
  projects: 'پروژه‌ها',
};
