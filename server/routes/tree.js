import { Router } from 'express';
import { buildTree } from '../lib/tree.js';

export const treeRouter = Router();

treeRouter.get('/tree', async (_req, res) => {
  try {
    const { tree } = await buildTree();
    res.json({ tree });
  } catch (err) {
    console.error('[tree]', err);
    res.status(500).json({ error: 'Failed to build tree', message: err.message });
  }
});
