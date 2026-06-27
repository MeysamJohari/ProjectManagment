import { Router } from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { resolveDataPath, toRelPath, ensureDir } from '../lib/paths.js';
import { autoCommit } from '../lib/backup.js';
import { moveToTrash } from '../lib/trash.js';

export const projectRouter = Router();

function slugifyFolderName(text) {
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `project-${Date.now()}`;
}

// ── POST /api/project ───────────────────────────────────────────────────
// Create a project folder with a `_project.md` manifest.
// Body: { title, parentPath? } — parentPath is relative to DATA_DIR (optional).
projectRouter.post('/project', async (req, res) => {
  const { title, parentPath = '' } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Missing "title" in body' });
  }

  const cleanTitle = String(title).trim();
  const parent = String(parentPath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');

  if (parent === '_inbox' || parent.startsWith('_inbox/')) {
    return res.status(400).json({
      error: 'Cannot create a project inside _inbox',
      message: 'پروژه‌ها باید در ریشه یا داخل پروژهٔ دیگر ساخته شوند.',
    });
  }

  try {
    const baseName = slugifyFolderName(cleanTitle);
    let folderRel = parent ? `${parent}/${baseName}` : baseName;
    let folderAbs = resolveDataPath(folderRel);

    // Avoid clobbering an existing folder.
    if (existsSync(folderAbs)) {
      folderRel = parent ? `${parent}/${baseName}-${Date.now()}` : `${baseName}-${Date.now()}`;
      folderAbs = resolveDataPath(folderRel);
    }

    ensureDir(folderAbs);

    const now = new Date().toISOString();
    const projectFile = path.join(folderAbs, '_project.md');
    const content = matter.stringify('', {
      title: cleanTitle,
      type: 'project',
      created_at: now,
      updated_at: now,
    });
    await fs.writeFile(projectFile, content, 'utf8');

    autoCommit(`${toRelPath(projectFile)} created`);
    res.status(201).json({
      path: toRelPath(folderAbs),
      title: cleanTitle,
    });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[project:post]', err);
    res.status(500).json({ error: 'Failed to create project', message: err.message });
  }
});

// ── DELETE /api/project?path=... ────────────────────────────────────────
// Soft-delete: move the entire project folder to DATA_DIR/.trash/.
projectRouter.delete('/project', async (req, res) => {
  const { path: relPath } = req.query;
  if (!relPath) return res.status(400).json({ error: 'Missing "path" query param' });

  const cleaned = String(relPath).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!cleaned || cleaned === '_inbox' || cleaned.startsWith('_inbox/')) {
    return res.status(400).json({
      error: 'Cannot delete inbox',
      message: 'صندوق ورودی قابل حذف نیست.',
    });
  }

  try {
    const abs = resolveDataPath(cleaned);
    if (!existsSync(abs)) return res.status(404).json({ error: 'Not found', path: relPath });

    const stat = await fs.stat(abs);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a project folder' });
    }

    const moved = await moveToTrash(abs);
    autoCommit(`${cleaned} soft-deleted`);
    res.json({ ok: true, moved });
  } catch (err) {
    if (err.code === 'E_ESCAPE') return res.status(400).json({ error: err.message });
    console.error('[project:delete]', err);
    res.status(500).json({ error: 'Failed to delete project', message: err.message });
  }
});
