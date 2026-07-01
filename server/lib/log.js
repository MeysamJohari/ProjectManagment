// Helpers that build Log line payloads. The actual appending happens in files.js.
// Keeping the format strings in one place so Log parsing on the client stays in sync.

export function statusChangeLine(from, to) {
  return `status: ${from} → ${to}`;
}

export function focusStartLine() {
  return `focus: started`;
}

export function focusStopLine(note) {
  // Wrap the note in quotes so the timeline parser can split on the leading quote.
  const safe = String(note ?? '').replace(/"/g, "'");
  return `focus: stopped | "${safe}"`;
}

export function noteLine(text) {
  const safe = String(text ?? '').replace(/"/g, "'");
  return `note: "${safe}"`;
}

/**
 * Parse a single Log line into a structured event.
 * Examples it handles:
 *   - 2026-06-20T14:30:00Z | status: active → paused
 *   - 2026-06-21T09:00:00Z | focus: started
 *   - 2026-06-21T12:15:00Z | focus: stopped | "until here..."
 * Returns null for unrecognised lines.
 */
export function parseLogLine(rawLine) {
  const line = rawLine.replace(/^[-•]\s*/, '').trim();
  if (!line) return null;

  // Split timestamp | rest
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
  // Fallback: keep the raw text so nothing is lost.
  return { timestamp, kind: 'unknown', text: rest };
}

/** Extract the `## Log` block from a body string and return parsed events. */
export function parseLogFromBody(body) {
  if (!body) return [];
  const range = findLogSectionRange(body);
  if (!range) return [];
  const raw = body.slice(range.contentStart, range.end);
  return raw.split('\n').map(parseLogLine).filter(Boolean);
}

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
