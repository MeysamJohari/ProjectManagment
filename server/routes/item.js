import { Router } from 'express';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readItem, writeItem, appendToLog } from '../lib/files.js';
import { resolveDataPath, toRelPath } from '../lib/paths.js';
import { statusChangeLine, noteLine } from '../lib/log.js';
import { autoCommit } from '../lib/backup.js';
import { setFolderOrder } from '../lib/treeOrder.js';

export const itemRouter = Router();

// ── GET /api/item?path=... ──────────────────────────────────────────────
itemRouter.get('/item', async (req, res) => {
  const { path: relPath } = req.query;
  if (!relPath) return res.status(400).json({ error: 'Missing "path" query param' });

  try {
    const item = await readItem(relPath);
    if (!item) return res.status(404).json({ error: 'Not found', path: relPath });
    res.json(item);
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:get]', err);
    res.status(500).json({ error: 'Failed to read item', message: err.message });
  }
});

// ── POST /api/item/log ──────────────────────────────────────────────────
// Append a manual work-note line to the task's ## Log section.
itemRouter.post('/item/log', async (req, res) => {
  const { path: relPath, text } = req.body || {};
  if (!relPath) return res.status(400).json({ error: 'Missing "path" in body' });
  const trimmed = String(text ?? '').trim();
  if (trimmed.length < 3) {
    return res.status(400).json({ error: 'Note text is too short (min 3 characters)' });
  }

  try {
    if (!existsSync(resolveDataPath(relPath))) {
      return res.status(404).json({ error: 'Not found', path: relPath });
    }
    await appendToLog(relPath, [noteLine(trimmed)]);
    const item = await readItem(relPath);
    autoCommit(`${relPath} work logged`);
    res.json(item);
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:log]', err);
    res.status(500).json({ error: 'Failed to append log entry', message: err.message });
  }
});

// ── POST /api/item ──────────────────────────────────────────────────────
// Create or update. On status change → append Log line.
// NEVER allows is_current to change here (must go through /api/current).
itemRouter.post('/item', async (req, res) => {
  const { path: relPath, frontmatter = {}, body } = req.body || {};
  if (!relPath) return res.status(400).json({ error: 'Missing "path" in body' });

  // Enforce: is_current must NOT be mutated here.
  if (Object.prototype.hasOwnProperty.call(frontmatter, 'is_current')) {
    return res.status(400).json({
      error: 'is_current cannot be set via /api/item',
      message: 'Use PUT /api/current to change the current focus.',
    });
  }

  try {
    const abs = resolveDataPath(relPath);
    let oldStatus = undefined;

    if (existsSync(abs)) {
      const parsed = matter(await fs.readFile(abs, 'utf8'));
      oldStatus = parsed.data?.status;
    } else {
      // Brand-new file: pick sensible defaults if not provided.
      frontmatter.created_at = frontmatter.created_at || new Date().toISOString();
      if (!('type' in frontmatter)) frontmatter.type = 'task';
      if (!('status' in frontmatter)) frontmatter.status = 'backlog';
    }

    const newStatus = frontmatter.status;
    const statusChanged =
      newStatus !== undefined && oldStatus !== undefined && newStatus !== oldStatus;

    // 1. Write the file (frontmatter merge + body replace).
    let item = await writeItem(relPath, frontmatter, body);

    // 2. If status actually changed, append a Log line.
    if (statusChanged) {
      await appendToLog(relPath, [statusChangeLine(oldStatus, newStatus)]);
      item = (await readItem(relPath)) || item;
    }

    autoCommit(`${toRelPath(abs)} updated`);
    res.json(item);
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:post]', err);
    res.status(500).json({ error: 'Failed to write item', message: err.message });
  }
});

// ── DELETE /api/item?path=... ───────────────────────────────────────────
// Permanent delete: remove the file from disk.
itemRouter.delete('/item', async (req, res) => {
  const { path: relPath } = req.query;
  if (!relPath) return res.status(400).json({ error: 'Missing "path" query param' });

  try {
    const abs = resolveDataPath(relPath);
    if (!existsSync(abs)) return res.status(404).json({ error: 'Not found', path: relPath });

    await fs.unlink(abs);

    autoCommit(`${relPath} deleted`);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:delete]', err);
    res.status(500).json({ error: 'Failed to delete item', message: err.message });
  }
});

// ── POST /api/move ─────────────────────────────────────────────────────
// Move a task file from one folder to another.
itemRouter.post('/move', async (req, res) => {
  const { from, to } = req.body || {};
  if (!from || !to) return res.status(400).json({ error: 'Missing "from" or "to" in body' });

  try {
    const srcAbs = resolveDataPath(from);
    const destDirAbs = resolveDataPath(to);

    if (!existsSync(srcAbs)) return res.status(404).json({ error: 'Source not found', path: from });

    // Prevent moving non-task files (dotfiles, _project.md, etc.)
    const srcName = path.basename(srcAbs);
    if (srcName.startsWith('.') || srcName === '_project.md') {
      return res.status(400).json({ error: 'Cannot move this file' });
    }

    // Ensure destination directory exists.
    fsSync.mkdirSync(destDirAbs, { recursive: true });

    // If a file with the same name exists in dest, add a timestamp suffix.
    let destAbs = path.join(destDirAbs, srcName);
    if (existsSync(destAbs) && srcAbs !== destAbs) {
      const ext = path.extname(srcName);
      const base = path.basename(srcName, ext);
      destAbs = path.join(destDirAbs, `${base}-${Date.now()}${ext}`);
    }

    // Final check: destination must still be inside DATA_DIR.
    // destAbs is derived from destDirAbs (already resolved safe) + basename, so it's safe.

    await fs.rename(srcAbs, destAbs);

    autoCommit(`moved ${from} → ${toRelPath(destAbs)}`);
    res.json({ ok: true, newPath: toRelPath(destAbs) });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:move]', err);
    res.status(500).json({ error: 'Failed to move item', message: err.message });
  }
});

// ── POST /api/reorder ───────────────────────────────────────────────────
// Persist sidebar folder order for a parent directory.
// Body: { parentPath?: string, orderedPaths: string[] }
itemRouter.post('/reorder', async (req, res) => {
  const { parentPath = '', orderedPaths } = req.body || {};
  if (!Array.isArray(orderedPaths) || orderedPaths.length === 0) {
    return res.status(400).json({ error: 'Missing "orderedPaths" array in body' });
  }

  try {
    const parent = String(parentPath || '')
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '');

    if (parent === '_inbox' || parent.startsWith('_inbox/')) {
      return res.status(400).json({ error: 'Cannot reorder inside _inbox' });
    }

    for (const p of orderedPaths) {
      const cleaned = String(p).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      if (cleaned === '_inbox' || cleaned.startsWith('_inbox/')) {
        return res.status(400).json({ error: 'Cannot reorder _inbox' });
      }
      const abs = resolveDataPath(cleaned);
      if (!existsSync(abs)) {
        return res.status(404).json({ error: 'Folder not found', path: cleaned });
      }
    }

    const saved = await setFolderOrder(parent, orderedPaths);
    autoCommit(`reordered folders under ${parent || 'root'}`);
    res.json({ ok: true, order: saved });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:reorder]', err);
    res.status(500).json({ error: 'Failed to reorder folders', message: err.message });
  }
});
