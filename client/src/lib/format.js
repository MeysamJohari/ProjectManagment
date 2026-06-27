// Persian-friendly formatting + Log parsing helpers (client-side).

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert a number/string to Persian digits. */
export function toFa(value) {
  return String(value ?? '').replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format an ISO timestamp for display: «۱۴:۳۰ — ۱۴۰۴/۰۴/۰۱» (Fa digits). */
export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${toFa(hh)}:${toFa(mi)} — ${toFa(yyyy)}/${toFa(mm)}/${toFa(dd)}`;
}

/** Short time only: «۱۴:۳۰». */
export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${toFa(hh)}:${toFa(mi)}`;
}

/**
 * Parse a single Log line into a structured event.
 * Mirrors server/lib/log.js parseLogLine — keep in sync.
 */
export function parseLogLine(rawLine) {
  const line = String(rawLine).replace(/^[-•]\s*/, '').trim();
  if (!line) return null;

  const pipeIdx = line.indexOf('|');
  if (pipeIdx === -1) return null;

  const timestamp = line.slice(0, pipeIdx).trim();
  const rest = line.slice(pipeIdx + 1).trim();

  let m;
  if ((m = rest.match(/^status:\s*(\w+)\s*→\s*(\w+)$/))) {
    return { timestamp, kind: 'status', from: m[1], to: m[2] };
  }
  if ((m = rest.match(/^focus:\s*started$/))) {
    return { timestamp, kind: 'focus', action: 'started' };
  }
  if ((m = rest.match(/^focus:\s*stopped\s*\|\s*"(.*)"$/))) {
    return { timestamp, kind: 'focus', action: 'stopped', note: m[1] };
  }
  return { timestamp, kind: 'unknown', text: rest };
}

/** Extract the `## Log` block from a body string and return parsed events. */
export function parseLogFromBody(body) {
  if (!body) return [];
  const m = body.match(/^##\s+Log\b[^\n]*\n([\s\S]*?)(?=\n##\s|$)/m);
  if (!m) return [];
  return m[1].split('\n').map(parseLogLine).filter(Boolean);
}

/** Strip the `## Log` section from a body string (for the editable body). */
export function stripLogFromBody(body) {
  if (!body) return '';
  return body
    .replace(/^##\s+Log\b[\s\S]*?(?=\n##\s|$)/m, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Turn a label into a safe-ish markdown filename slug (latin). */
export function slugify(text) {
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug && slug !== 'task' ? slug : `task-${Date.now()}`;
}
