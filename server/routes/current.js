import { Router } from 'express';
import { existsSync } from 'node:fs';
import { buildTree, walkTasks } from '../lib/tree.js';
import { patchFrontmatter, appendToLog } from '../lib/files.js';
import { resolveDataPath, toRelPath } from '../lib/paths.js';
import { focusStartLine, focusStopLine } from '../lib/log.js';
import { autoCommit } from '../lib/backup.js';

export const currentRouter = Router();

const STOP_NOTE_MIN = 10;

// ── GET /api/current ────────────────────────────────────────────────────
currentRouter.get('/current', async (_req, res) => {
  try {
    const { tree } = await buildTree();
    const node = walkTasks(tree, (meta) => meta.is_current === true)[0] || null;
    if (!node) return res.json({ current: null });
    res.json({ current: { path: node.path, frontmatter: node.meta } });
  } catch (err) {
    console.error('[current:get]', err);
    res.status(500).json({ error: 'Failed to get current', message: err.message });
  }
});

// ── PUT /api/current ────────────────────────────────────────────────────
// Body: { path, stop_note? }
// The ONLY way to change is_current. Enforces the stop_note rule.
currentRouter.put('/current', async (req, res) => {
  const { path: targetPath, stop_note } = req.body || {};
  if (!targetPath) return res.status(400).json({ error: 'Missing "path" in body' });

  try {
    // 0. Target must exist.
    const targetAbs = resolveDataPath(targetPath);
    if (!existsSync(targetAbs)) {
      return res.status(404).json({ error: 'Not found', path: targetPath });
    }

    // 1. Find whatever is currently focused.
    const { tree } = await buildTree();
    const prevNode = walkTasks(tree, (meta) => meta.is_current === true)[0] || null;
    const previous = prevNode ? prevNode.path : null;

    // No-op: already current.
    if (previous && previous === targetPath) {
      return res.json({ previous, current: targetPath });
    }

    // 2. If something else is focused, a stop_note is mandatory.
    if (previous) {
      if (!stop_note || String(stop_note).trim().length < STOP_NOTE_MIN) {
        return res.status(400).json({
          error: 'stop_note required',
          message: `Another task is current. Provide a stop_note of at least ${STOP_NOTE_MIN} characters.`,
          previous,
        });
      }
      // Log focus: stopped on the old one, then clear its flag.
      await appendToLog(previous, [focusStopLine(stop_note)]);
      await patchFrontmatter(previous, { is_current: false });
    }

    // 3. Focus the new one.
    await patchFrontmatter(targetPath, { is_current: true });
    await appendToLog(targetPath, [focusStartLine()]);

    autoCommit(`focus → ${toRelPath(targetAbs)}`);
    res.json({ previous, current: targetPath });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[current:put]', err);
    res.status(500).json({ error: 'Failed to set current', message: err.message });
  }
});
