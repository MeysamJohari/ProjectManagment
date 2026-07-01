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
  if ((m = rest.match(/^note:\s*"(.*)"$/))) {
    return { timestamp, kind: 'note', text: m[1] };
  }
  return { timestamp, kind: 'unknown', text: rest };
}

/**
 * Locate the `## Log` section in a body string.
 * Avoids `$` with the `m` flag (which matches end-of-line, not end-of-string).
 */
function findLogSectionRange(body) {
  if (!body) return null;
  const headingRe = /^##\s+Log\b[^\n]*$/m;
  const match = headingRe.exec(body);
  if (!match) return null;

  const start = match.index;
  let contentStart = start + match[0].length;
  if (body[contentStart] === '\n') contentStart += 1;

  const rest = body.slice(contentStart);
  const nextHeading = rest.search(/^##\s+/m);
  const end = nextHeading === -1 ? body.length : contentStart + nextHeading;
  return { start, contentStart, end };
}

/** Extract the `## Log` block from a body string and return parsed events. */
export function parseLogFromBody(body) {
  const range = findLogSectionRange(body);
  if (!range) return [];
  const raw = body.slice(range.contentStart, range.end);
  return raw.split('\n').map(parseLogLine).filter(Boolean);
}

/** Strip the `## Log` section from a body string (for task notes). */
export function stripLogFromBody(body) {
  const range = findLogSectionRange(body);
  if (!range) return (body ?? '').replace(/\n{3,}/g, '\n\n').trim();
  const stripped = body.slice(0, range.start) + body.slice(range.end);
  return stripped.replace(/\n{3,}/g, '\n\n').trim();
}

/** Raw markdown lines under `## Log` (including `- ` prefixes). */
export function extractLogRawText(body) {
  const range = findLogSectionRange(body);
  if (!range) return '';
  return body.slice(range.contentStart, range.end).replace(/\s+$/, '');
}

/** Append a formatted work-entry block to task notes (with a visible separator line). */
export function appendWorkNoteBlock(notes, text, timestamp = new Date().toISOString()) {
  const stamp = formatDateTime(timestamp);
  const divider = '────────────────────────';
  const entry = `${divider}\n**${stamp}**\n${String(text ?? '').trim()}`;
  const trimmed = (notes ?? '').trim();
  return trimmed ? `${trimmed}\n\n${entry}` : entry;
}

/** Build full body from optional notes + log raw text. */
export function buildBodyWithLog(notes, logRawText) {
  const trimmedNotes = (notes ?? '').trim();
  const trimmedLog = (logRawText ?? '').trim();
  if (!trimmedLog) return trimmedNotes;
  const logBlock = trimmedLog.startsWith('## Log') ? trimmedLog : `## Log\n${trimmedLog}`;
  if (!trimmedNotes) return logBlock;
  return `${trimmedNotes}\n\n${logBlock}`;
}

/** Append a structured log line to raw log text. */
export function appendLogLine(logRawText, payload) {
  const stamp = new Date().toISOString();
  const line = `- ${stamp} | ${payload}`;
  const trimmed = (logRawText ?? '').trimEnd();
  return trimmed ? `${trimmed}\n${line}` : line;
}

/** Format a manual work-note log payload. */
export function noteLogPayload(text) {
  const safe = String(text ?? '').replace(/"/g, "'");
  return `note: "${safe}"`;
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
