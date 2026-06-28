import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';

import { getDataDir, ensureDir } from './lib/paths.js';
import { ensureRepo } from './lib/backup.js';
import { purgeOldTrash, TRASH_RETENTION_DAYS } from './lib/trash.js';
import { authMiddleware } from './middleware/auth.js';
import { pingRouter } from './routes/ping.js';
import { treeRouter } from './routes/tree.js';
import { itemRouter } from './routes/item.js';
import { todayRouter } from './routes/today.js';
import { currentRouter } from './routes/current.js';
import { projectRouter } from './routes/project.js';

const PORT = Number(process.env.PORT) || 4001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ── Startup: ensure DATA_DIR, _inbox, seed sample data, git init ─────────
async function bootstrap() {
  const dataDir = getDataDir();
  ensureDir(dataDir);
  ensureDir(path.join(dataDir, '_inbox'));

  // Seed a couple of example files on the very first run (inbox is empty).
  const inboxDir = path.join(dataDir, '_inbox');
  const inboxHasFiles =
    fs.existsSync(inboxDir) &&
    fs.readdirSync(inboxDir, { withFileTypes: true }).some((e) => e.isFile());
  if (!inboxHasFiles) {
    seedSample(dataDir);
    console.log('[startup] seeded sample tasks into _inbox/');
  }

  await ensureRepo();

  const { purged } = await purgeOldTrash();
  if (purged > 0) {
    console.log(`[trash] purged ${purged} item(s) older than ${TRASH_RETENTION_DAYS} days`);
  }

  // Re-check trash daily.
  setInterval(async () => {
    try {
      const result = await purgeOldTrash();
      if (result.purged > 0) {
        console.log(`[trash] purged ${result.purged} item(s) older than ${TRASH_RETENTION_DAYS} days`);
      }
    } catch (err) {
      console.error('[trash] purge failed:', err);
    }
  }, 24 * 60 * 60 * 1000);
}

function seedSample(dataDir) {
  const inbox = path.join(dataDir, '_inbox');
  const now = new Date().toISOString();

  const sample1 = `---
title: "خوش‌آمدید به Personal PM"
type: task
status: active
priority: today
is_current: false
created_at: "${now}"
updated_at: "${now}"
last_note: "این یک تسک نمونه است. آن را باز کنید و ویرایش کنید."
---

# شروع کار

این ابزار مدیریت پروژه‌ی شخصی، داده را به‌صورت فایل‌های Markdown با YAML frontmatter نگه می‌دارد.

- یک تسک را از درخت سمت راست باز کنید
- روی «این رو الان دارم کار می‌کنم» بزنید تا تمرکز لحظه‌ای‌تان ثبت شود
- هر تغییری خودکار در گیت محلی داخل پوشه‌ی \`data/\` ذخیره می‌شود

## Log
`;

  const sample2 = `---
title: "تمدید بیمه ماشین"
type: task
status: backlog
priority: normal
is_current: false
created_at: "${now}"
updated_at: "${now}"
last_note: "تسک‌های بدون پروژه در _inbox قرار می‌گیرند."
---

## Log
`;

  const f1 = path.join(inbox, 'welcome-personal-pm.md');
  const f2 = path.join(inbox, 'task-renew-car-insurance.md');
  if (!fs.existsSync(f1)) fs.writeFileSync(f1, sample1, 'utf8');
  if (!fs.existsSync(f2)) fs.writeFileSync(f2, sample2, 'utf8');
}

// ── Express app ─────────────────────────────────────────────────────────
bootstrap().catch((err) => {
  console.error('[startup] bootstrap failed:', err);
  process.exit(1);
});

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: CLIENT_ORIGIN }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Auth on all API routes.
app.use('/api', authMiddleware);

// Routers.
app.use('/api', pingRouter);
app.use('/api', treeRouter);
app.use('/api', itemRouter);
app.use('/api', todayRouter);
app.use('/api', currentRouter);
app.use('/api', projectRouter);

// Health + 404.
app.get('/', (_req, res) => res.json({ name: 'personal-pm-server', ok: true }));
app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));

const server = app.listen(PORT, () => {
  console.log(`[server] Personal PM API on http://localhost:${PORT}`);
  console.log(`[server] DATA_DIR = ${getDataDir()}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[server] Port ${PORT} is already in use. Stop the other process or change PORT in .env.`
    );
    console.error(`[server] Windows: netstat -ano | findstr :${PORT}  then  taskkill /PID <pid> /F`);
    process.exit(1);
  }
  throw err;
});
