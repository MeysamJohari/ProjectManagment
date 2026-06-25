import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// ESM has no __dirname; derive it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve DATA_DIR. Must be loaded *after* dotenv has run in index.js.
let _dataDir = null;

export function getDataDir() {
  if (_dataDir) return _dataDir;

  const raw = process.env.DATA_DIR || './data';
  // Resolve relative to the project ROOT (parent of server/), not server/.
  const projectRoot = path.resolve(__dirname, '..', '..');
  const resolved = path.isAbsolute(raw) ? raw : path.resolve(projectRoot, raw);

  _dataDir = resolved;
  return _dataDir;
}

/**
 * Resolve a relative path against DATA_DIR and verify it stays inside it.
 * Prevents path traversal (e.g. `../../etc/passwd`).
 * @param {string} relPath  path relative to DATA_DIR (POSIX or Win separators)
 * @returns {string} absolute, normalized path inside DATA_DIR
 */
export function resolveDataPath(relPath) {
  const dataDir = getDataDir();
  // Normalise separators and drop any leading slashes so it's treated as relative.
  const cleaned = String(relPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const abs = path.resolve(dataDir, cleaned);

  const rel = path.relative(dataDir, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    const err = new Error('Path escapes DATA_DIR');
    err.code = 'E_ESCAPE';
    throw err;
  }
  return abs;
}

/** Trailing-relative form of an absolute path (POSIX separators) for API output. */
export function toRelPath(absPath) {
  const dataDir = getDataDir();
  return path.relative(dataDir, absPath).replace(/\\/g, '/');
}

/** Ensure a directory exists (recursive). */
export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
