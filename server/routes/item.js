import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readItem, writeItem, appendToLog } from '../lib/files.js';
import { resolveDataPath, toRelPath, ensureDir } from '../lib/paths.js';
import { statusChangeLine } from '../lib/log.js';
import { autoCommit } from '../lib/backup.js';

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
    const item = await writeItem(relPath, frontmatter, body);

    // 2. If status actually changed, append a Log line.
    if (statusChanged) {
      await appendToLog(relPath, [statusChangeLine(oldStatus, newStatus)]);
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
// Soft-delete: move to DATA_DIR/.trash/{timestamp}-{filename}.
itemRouter.delete('/item', async (req, res) => {
  const { path: relPath } = req.query;
  if (!relPath) return res.status(400).json({ error: 'Missing "path" query param' });

  try {
    const abs = resolveDataPath(relPath);
    if (!existsSync(abs)) return res.status(404).json({ error: 'Not found', path: relPath });

    const dataDir = resolveDataPath('.');
    const trashDir = path.join(dataDir, '.trash');
    ensureDir(trashDir);

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(trashDir, `${stamp}-${path.basename(abs)}`);
    await fs.rename(abs, dest);

    autoCommit(`${toRelPath(abs)} soft-deleted`);
    res.json({ ok: true, moved: toRelPath(dest) });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[item:delete]', err);
    res.status(500).json({ error: 'Failed to delete item', message: err.message });
  }
});
