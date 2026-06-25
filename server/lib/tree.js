import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { getDataDir, toRelPath } from './paths.js';

const HIDDEN = new Set(['.trash', 'node_modules', '.git']);
const PROJECT_FILE = '_project.md';

/** Recursively scan DATA_DIR and build the project tree (including _inbox). */
export async function buildTree() {
  const dataDir = getDataDir();
  const children = await scanDir(dataDir);
  return { tree: children };
}

async function scanDir(dirAbs) {
  let entries;
  try {
    entries = await fs.readdir(dirAbs, { withFileTypes: true });
  } catch {
    return [];
  }

  // Stable, readable sort: folders first then files, alphabetical.
  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name, 'en', { numeric: true });
  });

  const nodes = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      // allow _inbox etc., but skip dotfiles/dotdirs (.trash, .git)
      if (HIDDEN.has(entry.name)) continue;
    }

    const abs = path.join(dirAbs, entry.name);

    if (entry.isDirectory()) {
      // The _inbox folder is a special top-level "inbox" node.
      const isInbox = abs === path.join(getDataDir(), '_inbox');
      const type = isInbox ? 'inbox' : 'project';
      const meta = isInbox ? {} : await readProjectMeta(abs);
      nodes.push({
        name: entry.name,
        path: toRelPath(abs),
        type,
        meta,
        children: await scanDir(abs),
      });
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== PROJECT_FILE) {
      const meta = await quickMeta(abs);
      nodes.push({
        name: entry.name.replace(/\.md$/, ''),
        path: toRelPath(abs),
        type: 'task',
        meta,
        children: undefined,
      });
    }
  }
  return nodes;
}

/** Read a project folder's `_project.md` frontmatter (or empty meta). */
async function readProjectMeta(dirAbs) {
  const file = path.join(dirAbs, PROJECT_FILE);
  try {
    const parsed = matter(await fs.readFile(file, 'utf8'));
    return parsed.data || {};
  } catch {
    return {};
  }
}

/** Read just the frontmatter of a .md file, defensively. */
async function quickMeta(fileAbs) {
  try {
    const parsed = matter(await fs.readFile(fileAbs, 'utf8'));
    return pickDisplayMeta(parsed.data || {});
  } catch {
    return {};
  }
}

function pickDisplayMeta(fm) {
  const out = {};
  for (const k of ['title', 'type', 'status', 'priority', 'is_current', 'due_date', 'last_note', 'recurrence']) {
    if (k in fm) out[k] = fm[k];
  }
  return out;
}

/**
 * Walk the whole tree collecting task nodes whose frontmatter matches a predicate.
 * Used by /api/today and /api/current.
 */
export function walkTasks(treeNodes, predicate) {
  const out = [];
  const visit = (nodes) => {
    for (const n of nodes || []) {
      if (n.type === 'task' && predicate(n.meta || {}, n)) out.push(n);
      if (n.children && n.children.length) visit(n.children);
    }
  };
  visit(treeNodes);
  return out;
}
