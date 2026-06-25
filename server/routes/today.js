import { Router } from 'express';
import { buildTree, walkTasks } from '../lib/tree.js';

export const todayRouter = Router();

todayRouter.get('/today', async (_req, res) => {
  try {
    const { tree } = await buildTree();

    // Current focus: the single task with is_current === true.
    const currentNode = walkTasks(tree, (meta) => meta.is_current === true)[0] || null;
    const current = currentNode
      ? { path: currentNode.path, frontmatter: currentNode.meta }
      : null;

    // Active or priority=today tasks (exclude the current one from the list).
    const matches = walkTasks(
      tree,
      (meta) => meta.status === 'active' || meta.priority === 'today'
    ).filter((n) => !currentNode || n.path !== currentNode.path);

    const tasks = matches.map((n) => ({ path: n.path, frontmatter: n.meta }));

    res.json({ current, tasks });
  } catch (err) {
    console.error('[today]', err);
    res.status(500).json({ error: 'Failed to build today', message: err.message });
  }
});
