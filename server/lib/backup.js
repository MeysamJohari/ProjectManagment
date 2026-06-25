import simpleGit from 'simple-git';
import { getDataDir, ensureDir } from './paths.js';
import { existsSync } from 'node:fs';
import path from 'node:path';

let git = null;
let ready = false;

/** On startup: ensure DATA_DIR is a git repo (local-only, no remote). */
export async function ensureRepo() {
  const dataDir = getDataDir();
  ensureDir(dataDir);
  const gitDir = path.join(dataDir, '.git');
  if (!existsSync(gitDir)) {
    const g = simpleGit(dataDir);
    try {
      await g.init();
      // Local identity so commits don't fail on a fresh machine.
      try {
        await g.addConfig('user.email', 'personal-pm@local', false, 'local');
        await g.addConfig('user.name', 'Personal PM (auto)', false, 'local');
      } catch { /* ignore */ }
      console.log('[backup] git repo initialized in', dataDir);
    } catch (err) {
      console.warn('[backup] git init failed — backup disabled:', err.message);
      return false;
    }
  }
  git = simpleGit(dataDir);
  ready = true;
  return true;
}

/**
 * Fire-and-forget auto-commit after a mutation.
 * Never blocks the response; logs failures to console.
 */
export function autoCommit(message) {
  if (!ready || !git) return;
  (async () => {
    try {
      await git.add('-A');
      const status = await git.status();
      if (status.isClean()) return; // nothing to commit
      await git.commit(`auto: ${message}`);
    } catch (err) {
      console.warn('[backup] git commit failed:', err.message);
    }
  })();
}
