// Central API client. Injects the Authorization header on every request.
// In dev, Vite proxies /api → :4001, so we use a same-origin base by default.

const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(pathname, { method = 'GET', body, query } = {}) {
  // Use the proxy (same-origin) in dev; fall back to absolute URL if configured.
  const base = API_BASE && import.meta.env.DEV ? '/api' : `${API_BASE}/api`;
  const search = query
    ? '?' + new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null)
      ).toString()
    : '';
  const url = pathname.startsWith('/api') ? pathname : `${base}${pathname}${search}`;

  const headers = { 'Content-Type': 'application/json' };
  if (API_TOKEN) headers.Authorization = `Bearer ${API_TOKEN}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network error / server down.
    throw new ApiError('سرور در دسترس نیست.', { status: 0, cause: err });
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message = data?.message || data?.error || `خطای سرور (${res.status})`;
    throw new ApiError(message, { status: res.status, data });
  }
  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(message, opts = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.data = opts.data;
  }
}

// ── Endpoints ────────────────────────────────────────────────────────────
export const api = {
  ping: () => request('/ping'),
  getTree: () => request('/tree'),
  getItem: (path) => request('/item', { query: { path } }),
  createItem: ({ path, frontmatter, body }) =>
    request('/item', { method: 'POST', body: { path, frontmatter, body } }),
  deleteItem: (path) => request('/item', { method: 'DELETE', query: { path } }),
  getToday: () => request('/today'),
  getCurrent: () => request('/current'),
  setCurrent: ({ path, stop_note }) =>
    request('/current', { method: 'PUT', body: { path, stop_note } }),
  createProject: ({ title, parentPath }) =>
    request('/project', { method: 'POST', body: { title, parentPath } }),
  deleteProject: (path) => request('/project', { method: 'DELETE', query: { path } }),
  rename: ({ path, title, isProject }) => {
    const itemPath = isProject ? `${path.replace(/\/$/, '')}/_project.md` : path;
    return request('/item', { method: 'POST', body: { path: itemPath, frontmatter: { title } } });
  },
  moveItem: ({ from, to }) => request('/move', { method: 'POST', body: { from, to } }),
};
