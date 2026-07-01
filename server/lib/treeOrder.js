import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getDataDir } from './paths.js';

const ORDER_FILE = '.tree-order.json';

export async function readTreeOrder() {
  const file = path.join(getDataDir(), ORDER_FILE);
  if (!existsSync(file)) return {};
  try {
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

export async function writeTreeOrder(order) {
  const file = path.join(getDataDir(), ORDER_FILE);
  await fs.writeFile(file, JSON.stringify(order, null, 2), 'utf8');
}

/**
 * Persist folder order for a parent directory.
 * @param {string} parentPath - relative path of parent ('' for data root)
 * @param {string[]} orderedPaths - full relative paths of project folders in desired order
 */
export async function setFolderOrder(parentPath, orderedPaths) {
  const key = String(parentPath || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const names = orderedPaths.map((p) => path.basename(String(p).replace(/\\/g, '/')));

  const order = await readTreeOrder();
  order[key] = names;
  await writeTreeOrder(order);
  return order[key];
}
