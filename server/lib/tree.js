import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { getDataDir, toRelPath } from './paths.js';
import { readTreeOrder } from './treeOrder.js';

const HIDDEN = new Set(['.trash', 'node_modules', '.git']);
const PROJECT_FILE = '_project.md';
const INBOX_NAME = '_inbox';

/** Recursively scan DATA_DIR and build the project tree (including _inbox). */
export async function buildTree() {
  const dataDir = getDataDir();
  const order = await readTreeOrder();
  const children = await scanDir(dataDir, order, '');
  return { tree: children };
}

function sortFolderNodes(nodes, parentKey, order) {
  const orderedNames = order[parentKey];
  if (!orderedNames?.length) {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    return nodes;
  }

  return nodes.sort((a, b) => {
    const ai = orderedNames.indexOf(a.name);
    const bi = orderedNames.indexOf(b.name);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name, 'en', { numeric: true });
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

async function scanDir(dirAbs, order, parentKey) {
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
  const folderNodes = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      // allow _inbox etc., but skip dotfiles/dotdirs (.trash, .git)
      if (HIDDEN.has(entry.name)) continue;
    }

    const abs = path.join(dirAbs, entry.name);

    if (entry.isDirectory()) {
      // The _inbox folder is a special top-level "inbox" node.
      const isInbox = abs === path.join(getDataDir(), INBOX_NAME);
      const type = isInbox ? 'inbox' : 'project';
      const meta = isInbox ? {} : await readProjectMeta(abs);
      const childKey = toRelPath(abs);
      const node = {
        name: entry.name,
        path: childKey,
        type,
        meta,
        children: await scanDir(abs, order, childKey),
      };
      if (isInbox) {
        nodes.push(node);
      } else {
        folderNodes.push(node);
      }
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

  const sortedFolders = sortFolderNodes(folderNodes, parentKey, order);
  const inboxNode = nodes.find((n) => n.type === 'inbox');
  const taskNodes = nodes.filter((n) => n.type === 'task');

  if (parentKey === '' && inboxNode) {
    return [inboxNode, ...sortedFolders];
  }
  return [...sortedFolders, ...taskNodes];
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
