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
  // Fallback: keep the raw text so nothing is lost.
  return { timestamp, kind: 'unknown', text: rest };
}

/** Extract the `## Log` block from a body string and return parsed events. */
export function parseLogFromBody(body) {
  if (!body) return [];
  const m = body.match(/^##\s+Log\b[^\n]*\n([\s\S]*?)(?=\n##\s|$)/m);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map(parseLogLine)
    .filter(Boolean);
}
