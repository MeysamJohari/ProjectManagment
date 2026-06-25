import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';
import path from 'node:path';
import { resolveDataPath, toRelPath, ensureDir } from './paths.js';

const NOW = () => new Date().toISOString();

/** Read & parse a Markdown file. Returns { path, frontmatter, body } or null if missing. */
export async function readItem(relPath) {
  const abs = resolveDataPath(relPath);
  if (!existsSync(abs)) return null;

  const raw = await fs.readFile(abs, 'utf8');
  const parsed = matter(raw);
  return {
    path: toRelPath(abs),
    frontmatter: parsed.data || {},
    body: parsed.content || '',
  };
}

/**
 * Write (create or update) a Markdown file.
 * - Merges given frontmatter over the existing one (shallow).
 * - Replaces body wholesale.
 * - Touches updated_at.
 * NOTE: callers must enforce the `is_current` rule and Log appends themselves;
 * this function is a low-level writer.
 */
export async function writeItem(relPath, frontmatter = {}, body = '') {
  const abs = resolveDataPath(relPath);
  ensureDir(path.dirname(abs));

  let existingData = {};
  let existingBody = '';
  if (existsSync(abs)) {
    const parsed = matter(await fs.readFile(abs, 'utf8'));
    existingData = parsed.data || {};
    existingBody = parsed.content || '';
  }

  const merged = {
    ...existingData,
    ...frontmatter,
    updated_at: NOW(),
  };
  // For brand-new files give them a created_at.
  if (!existingData.created_at && !merged.created_at) {
    merged.created_at = NOW();
  }

  const fileString = matter.stringify(existingBody || body || '', merged);
  await fs.writeFile(abs, fileString, 'utf8');
  return { path: toRelPath(abs), frontmatter: merged, body: existingBody || body || '' };
}

/** Update ONLY the frontmatter, leaving body untouched. Returns the new item. */
export async function patchFrontmatter(relPath, patch) {
  const abs = resolveDataPath(relPath);
  if (!existsSync(abs)) return null;

  const parsed = matter(await fs.readFile(abs, 'utf8'));
  const merged = {
    ...parsed.data,
    ...patch,
    updated_at: NOW(),
  };
  await fs.writeFile(abs, matter.stringify(parsed.content || '', merged), 'utf8');
  return { path: toRelPath(abs), frontmatter: merged, body: parsed.content || '' };
}

/** Append raw lines to the body's `## Log` section, creating it if absent. */
export async function appendToLog(relPath, lines) {
  if (!lines || (Array.isArray(lines) ? lines.length : 1) === 0) return;
  const lineArr = Array.isArray(lines) ? lines : [lines];

  const abs = resolveDataPath(relPath);
  if (!existsSync(abs)) return null;

  const parsed = matter(await fs.readFile(abs, 'utf8'));
  let content = parsed.content || '';

  const stamp = NOW();
  const newLines = lineArr.map((l) => `- ${stamp} | ${l}`).join('\n');

  if (/^##\s+Log\b/m.test(content)) {
    // Insert right after the `## Log` heading line.
    content = content.replace(/(^##\s+Log\b[^\n]*\n)/m, `$1${newLines}\n`);
  } else {
    // No Log section yet — create one at the end (separated from body).
    const sep = content.trimEnd().length ? '\n\n' : '';
    content = `${content.trimEnd()}${sep}## Log\n${newLines}\n`;
  }

  await fs.writeFile(abs, matter.stringify(content, parsed.data), 'utf8');
  return toRelPath(abs);
}
