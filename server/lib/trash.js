import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveDataPath, toRelPath, ensureDir } from './paths.js';

export const TRASH_RETENTION_DAYS = 10;

/** ISO timestamp safe for filenames (colons/dots → dashes). */
export function trashStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/** Move a file or directory into DATA_DIR/.trash/{stamp}-{basename}. */
export async function moveToTrash(absPath) {
  const dataDir = resolveDataPath('.');
  const trashDir = path.join(dataDir, '.trash');
  ensureDir(trashDir);

  const stamp = trashStamp();
  const dest = path.join(trashDir, `${stamp}-${path.basename(absPath)}`);
  await fs.rename(absPath, dest);
  return toRelPath(dest);
}

/**
 * Parse the deletion timestamp embedded in a trash entry name.
 * Format: {YYYY-MM-DDTHH-mm-ss-sssZ}-{originalName}
 */
export function parseTrashTimestamp(entryName) {
  const m = entryName.match(/^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)-/);
  if (!m) return null;
  const iso = m[1].replace(
    /^(\d{4}-\d{2}-\d{2}T)(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    '$1$2:$3:$4.$5Z'
  );
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Permanently remove trash entries older than `retentionDays`. */
export async function purgeOldTrash(retentionDays = TRASH_RETENTION_DAYS) {
  const trashDir = path.join(resolveDataPath('.'), '.trash');
  if (!existsSync(trashDir)) return { purged: 0 };

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let purged = 0;

  const entries = await fs.readdir(trashDir, { withFileTypes: true });
  for (const entry of entries) {
    const deletedAt = parseTrashTimestamp(entry.name);
    if (!deletedAt || deletedAt.getTime() > cutoff) continue;

    const abs = path.join(trashDir, entry.name);
    await fs.rm(abs, { recursive: true, force: true });
    purged++;
  }

  return { purged };
}
