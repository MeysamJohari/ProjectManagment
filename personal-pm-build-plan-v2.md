# Personal PM — Local Project Management App
## Master Build Plan v2 (Cursor / Agent Ready)

> **این نسخه چه فرقی با نسخه‌ی اول دارد؟**
> این یک بازنویسی کامل پلن اولیه است که شش اصلاح کلیدی در آن اعمال شده:
> 1. فیلد `is_current` جدا از `status` اضافه شد (تمرکز لحظه‌ای در مقابل وضعیت کلی کار)
> 2. قانون "یادداشت اجباری قبل از توقف" به تغییر `is_current` منتقل شد، نه `status`
> 3. مکانیزم Backup با Git auto-commit اضافه شد
> 4. مفهوم "Inbox" برای تسک‌های بدون پروژه تعریف شد
> 5. ترتیب فازها به‌گونه‌ای تغییر کرد که قوانین اصلی از همان روزهای اول قابل تست باشند
> 6. ادیتور بدنه‌ی متن از textarea ساده به یک ادیتور مارک‌داون با پیش‌نمایش ارتقا یافت
>
> معماری دو-سرویسی (Express + React) دست‌نخورده باقی مانده، چون دسترسی از موبایل/راه دور در آینده محتمل است و این معماری برای آن مسیر طراحی شده است.

---

## 1. Project Overview

یک ابزار **local-first** مدیریت پروژه که فایل‌های Markdown را مستقیماً از `~/Workspace` می‌خواند و می‌نویسد.
بدون دیتابیس. بدون cloud (در حال حاضر). بدون Electron. فقط filesystem + REST API + React UI.

### Goals
- مدیریت کامل پروژه/تسک از طریق یک UI وب که به‌صورت local اجرا می‌شود
- داده به‌صورت فایل‌های `.md` با YAML frontmatter — قابل‌خوانش برای انسان، سازگار با git
- API طوری طراحی شده که مهاجرت به cloud بدون ریفکتور باشد: اضافه‌کردن token auth، اشاره به یک VPS، تمام
- یک دستور برای اجرای همه‌چیز: `npm run dev`
- تمرکز اول روی **تجربه‌ی واقعی استفاده** — چون هدف فعلی این است که در چند هفته‌ی آینده مشخص شود آیا این ابزار واقعاً در گردش کاری روزمره جای می‌گیرد یا نه

### Non-Goals (فعلاً)
- چند-کاربره بودن
- Real-time sync / WebSockets
- اپ موبایل native (دسترسی موبایل، اگر لازم شد، از طریق همان وب UI و Tailscale خواهد بود — نه یک اپ جدا)
- یکپارچه‌سازی با ابزارهای بیرونی (Notion، Jira و غیره)

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Backend | Node.js + Express | سبک، native برای کار با filesystem |
| Frontmatter parsing | `gray-matter` | استاندارد رایج برای MD+YAML |
| Frontend | React + Vite + Tailwind CSS | DX سریع |
| Markdown editor | `@uiw/react-md-editor` (یا معادل سبک‌تر) | پیش‌نمایش زنده، بدون نیاز به textarea خام |
| Backup | Git (simple-git یا فراخوانی مستقیم CLI) | هر تغییر به‌صورت خودکار commit می‌شود؛ بدون push |
| Dev runner | `concurrently` | یک `npm run dev` برای هر دو سرور و کلاینت |
| Future auth | `Authorization: Bearer <token>` از طریق `.env` | آماده برای مهاجرت به cloud بدون ریفکتور |

---

## 3. Monorepo Structure

```
~/personal-pm/
├── package.json            ← root: فقط اسکریپت‌ها (dev, build)
├── .env                    ← DATA_DIR, PORT, API_TOKEN
├── .gitignore
│
├── server/
│   ├── package.json
│   ├── index.js            ← نقطه ورود Express
│   ├── middleware/
│   │   └── auth.js         ← بررسی Bearer token (حالت pass-through به‌صورت پیش‌فرض)
│   ├── lib/
│   │   └── backup.js       ← git auto-commit بعد از هر تغییر در DATA_DIR
│   └── routes/
│       ├── tree.js         ← GET /api/tree
│       ├── item.js         ← GET|POST|DELETE /api/item
│       ├── today.js        ← GET /api/today
│       ├── current.js      ← GET|PUT /api/current   (مدیریت is_current)
│       └── search.js       ← GET /api/search  (Phase 4)
│
└── client/
    ├── package.json
    ├── vite.config.js      ← proxy /api → localhost:4001
    ├── index.html
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── client.js   ← همه‌ی فراخوانی‌های fetch، هدر Bearer اینجا تزریق می‌شود
        ├── components/
        │   ├── Sidebar/
        │   │   ├── ProjectTree.jsx
        │   │   └── TreeNode.jsx
        │   ├── Detail/
        │   │   ├── DetailPanel.jsx
        │   │   ├── FrontmatterEditor.jsx
        │   │   ├── NoteEditor.jsx          ← ادیتور مارک‌داون با پیش‌نمایش
        │   │   ├── CurrentFocusToggle.jsx  ← دکمه‌ی "این رو الان دارم کار می‌کنم"
        │   │   ├── PauseNoteModal.jsx      ← یادداشت اجباری هنگام تغییر is_current
        │   │   └── LogTimeline.jsx
        │   └── Today/
        │       └── TodayView.jsx
        ├── hooks/
        │   ├── useTree.js
        │   ├── useItem.js
        │   ├── useToday.js
        │   └── useCurrent.js
        └── store/
            └── useAppStore.js   ← Zustand (یا React context)
```

---

## 4. Data Model

### Directory Convention

```
~/Workspace/
  _inbox/                  ← تسک‌های مستقل و بدون پروژه (پیش‌فرض اولین اجرا)
    task-renew-car-insurance.md
  ProjectAlpha/
    _project.md            ← متادیتای سطح پروژه
    task-login-page.md
    task-api-refactor.md
    SubFeature/
      _project.md
      task-something.md
```

> **چرا `_inbox`؟** نه هر کاری به یک پروژه تعلق دارد. اگر یک تسک تنها و کوچک داری ("بیمه ماشین را تمدید کن")، مجبور نیستی برایش یک پروژه‌ی جعلی بسازی. سرور در اولین اجرا این پوشه را خودکار می‌سازد.

### Frontmatter Schema (تمام فایل‌ها)

```yaml
---
title: "Task title"
type: task | project
status: active | paused | done | backlog
priority: today | high | normal | low
is_current: false              # فقط یک فایل در کل سیستم می‌تواند true باشد
created_at: "2026-06-01T10:00:00Z"
updated_at: "2026-06-20T14:30:00Z"
last_note: "زمینه‌ی کوتاه برای جلسه‌ی بعدی کار"
recurrence: weekly | monthly   # اختیاری، Phase 3
due_date: "2026-07-01"         # اختیاری، فقط برای تسک‌های recurring یا با ددلاین
---

## Body
محتوای آزاد مارک‌داون، زمینه، لینک‌ها و غیره.

## Log
- 2026-06-20T14:30:00Z | status: backlog → active
- 2026-06-21T09:00:00Z | focus: started | "شروع کار روی صفحه‌ی لاگین"
- 2026-06-21T12:15:00Z | focus: stopped | "تا اینجا: فرم رو زدم، باقی مونده validation"
```

> **قانون:** بخش `## Log` **append-only** است و توسط سرور مدیریت می‌شود. هیچ‌وقت بازنویسی نمی‌شود.
> توجه کنید که حالا دو نوع رویداد در لاگ ثبت می‌شود: تغییرات `status` و تغییرات `is_current` (که آن را "focus" می‌نامیم) — این دو از هم مجزا و قابل تشخیص‌اند.

### تمایز کلیدی: `status` در مقابل `is_current`

این مهم‌ترین تغییر نسبت به نسخه‌ی اول پلن است:

| فیلد | معنی | محدودیت |
|---|---|---|
| `status` | آیا این تسک باز است، متوقف شده، انجام شده یا در صف است | **چندتایی** — می‌توانی همزمان چند تسک `active` داشته باشی (پروژه‌های موازی) |
| `is_current` | آیا همین الان روی این تسک کار می‌کنی | **یکتا و سراسری** — فقط یک فایل در کل سیستم می‌تواند `true` باشد |

مثال واقعی: تو می‌توانی ۳ پروژه‌ی `active` داشته باشی (همه زنده و در حال پیشرفت)، اما فقط یکی‌شان `is_current: true` است — همانی که الان روی آن تایپ می‌کنی. وقتی سراغ پروژه‌ی دیگری می‌روی، فقط `is_current` سوییچ می‌شود، نه `status`.

---

## 5. API Specification

### Base URL
`http://localhost:4001/api`

### Auth Header (همه‌ی درخواست‌ها)
```
Authorization: Bearer <API_TOKEN>
```
در Phase 0–3: میدل‌ور توکن را از `.env` می‌خواند، در صورت نبودنش هشدار می‌دهد، اما **همیشه عبور می‌دهد**. در حالت production: `ENFORCE_AUTH=true` را در `.env` تنظیم کن.

---

### Endpoints

#### `GET /api/tree`
کل درخت پروژه/تسک را به‌صورت بازگشتی از `DATA_DIR` برمی‌گرداند (شامل `_inbox`).

**Response:**
```json
{
  "tree": [
    {
      "name": "_inbox",
      "path": "_inbox",
      "type": "inbox",
      "children": [
        {
          "name": "task-renew-car-insurance",
          "path": "_inbox/task-renew-car-insurance.md",
          "type": "task",
          "meta": { "title": "...", "status": "backlog", "priority": "normal", "is_current": false }
        }
      ]
    },
    {
      "name": "ProjectAlpha",
      "path": "ProjectAlpha",
      "type": "project",
      "meta": { "title": "...", "status": "active" },
      "children": [
        {
          "name": "task-login-page",
          "path": "ProjectAlpha/task-login-page.md",
          "type": "task",
          "meta": { "title": "...", "status": "active", "priority": "today", "is_current": true }
        }
      ]
    }
  ]
}
```

---

#### `GET /api/item?path=ProjectAlpha/task-login-page.md`
کل محتوا + frontmatter یک فایل را برمی‌گرداند.

**Response:**
```json
{
  "path": "ProjectAlpha/task-login-page.md",
  "frontmatter": { "title": "...", "status": "active", "is_current": true, ... },
  "body": "## Body\n...\n## Log\n..."
}
```

---

#### `POST /api/item`
ساخت یا به‌روزرسانی یک فایل. اگر `path` وجود نداشته باشد → ساخته می‌شود. اگر وجود داشته باشد → frontmatter ادغام و body جایگزین می‌شود.

**Request body:**
```json
{
  "path": "ProjectAlpha/task-login-page.md",
  "frontmatter": { "status": "paused", "last_note": "در انتظار بازبینی طراحی" },
  "body": "## Body\nمحتوای به‌روزشده"
}
```

**رفتار سمت سرور هنگام تغییر `status`:**
1. خواندن `status` قدیمی از فایل موجود
2. اگر `status` تغییر کرده باشد: یک خط به بخش `## Log` اضافه می‌شود:
   ```
   - 2026-06-20T14:30:00Z | status: active → paused
   ```
3. **این endpoint دیگر هیچ قانون "یک تسک active" را اعمال نمی‌کند** — چون `status` حالا آزاد و چندتایی است (نگاه کنید به endpoint جدید `/api/current` برای منطق یکتایی).
4. این endpoint نباید مستقیماً `is_current` را تغییر دهد؛ تغییر `is_current` فقط از طریق `/api/current` انجام می‌شود تا قانون یادداشت اجباری همیشه رعایت شود.

**Response:** `200 OK` با آیتم به‌روزشده، یا خطای مناسب.

---

#### `PUT /api/current`
تنها راه برای تغییر `is_current`. این endpoint جدید جایگزین منطق "single-active" نسخه‌ی قبلی است.

**Request body:**
```json
{
  "path": "ProjectAlpha/task-login-page.md",
  "stop_note": "تا اینجا فرم لاگین رو زدم، باقی مونده validation"
}
```

**رفتار سمت سرور:**
1. اگر یک تسک دیگر هم‌اکنون `is_current: true` دارد:
   - الزامی است `stop_note` حداقل ۱۰ کاراکتر داشته باشد (در غیر این صورت `400 Bad Request`)
   - یک خط به `## Log` همان تسک قدیمی اضافه می‌شود: `focus: stopped | "{stop_note}"`
   - `is_current` آن تسک به `false` تغییر می‌کند
2. تسک جدید: `is_current` به `true` تغییر می‌کند، یک خط به `## Log` آن اضافه می‌شود: `focus: started`
3. اگر هیچ تسک دیگری `is_current: true` نداشت، مرحله‌ی ۱ رد می‌شود (نیازی به `stop_note` نیست).

**Response:** `200 OK` با مسیر تسک قبلی و جدید، یا `400` در صورت نبود `stop_note` لازم.

```json
{
  "previous": "ProjectAlpha/task-login-page.md",
  "current": "ProjectBeta/task-deploy.md"
}
```

---

#### `GET /api/current`
تسک‌ای که هم‌اکنون `is_current: true` دارد را برمی‌گرداند (یا `null` اگر هیچ‌کدام).

**Response:**
```json
{
  "current": {
    "path": "ProjectAlpha/task-login-page.md",
    "frontmatter": { "title": "...", "status": "active", "is_current": true }
  }
}
```

---

#### `DELETE /api/item?path=ProjectAlpha/task-login-page.md`
فایل را به `.trash/` منتقل می‌کند (soft-delete)، نه حذف واقعی.

**رفتار سمت سرور:**
- فایل به `DATA_DIR/.trash/{timestamp}-{filename}` منتقل می‌شود
- فایل‌های `.trash` بعد از ۳۰ روز توسط یک اسکریپت دستی (نه خودکار) قابل پاک‌سازی‌اند — تا وقتی این قابلیت ساخته نشده، فقط دستی پاک می‌شوند

**Response:** `200 OK` یا `404 Not Found`.

---

#### `GET /api/today`
لیست تخت تسک‌هایی که `status: active` یا `priority: today` دارند، به‌علاوه‌ی تسکی که `is_current: true` دارد (در صدر لیست).

**Response:**
```json
{
  "current": { "path": "...", "frontmatter": {...} },
  "tasks": [
    {
      "path": "ProjectAlpha/task-login-page.md",
      "frontmatter": { "title": "...", "status": "active", "priority": "today" }
    }
  ]
}
```

---

#### `GET /api/search?q=login` *(Phase 4)*
جستجوی متنی کامل در تمام فایل‌های `.md` داخل `DATA_DIR` (به‌استثنای `.trash`).

**Response:**
```json
{
  "results": [
    { "path": "...", "title": "...", "matches": ["...خط حاوی نتیجه..."] }
  ]
}
```

---

## 6. Backup Strategy (جدید)

داده‌ی تو مجموعه‌ای از فایل‌های متنی روی دیسک است — یعنی یک باگ در کد سرور یا یک کلیک اشتباه در UI می‌تواند داده از بین ببرد. راه‌حل ساده و کم‌هزینه:

1. در اولین اجرای سرور، اگر `DATA_DIR` یک گیت‌ریپو نیست، یکی با `git init` ساخته می‌شود (فقط محلی، بدون remote)
2. بعد از هر عملیات موفق `POST /api/item` یا `DELETE /api/item`، سرور به‌صورت async یک `git add -A && git commit -m "auto: {path} updated"` اجرا می‌کند
3. این commit ها هیچ‌وقت push نمی‌شوند — فقط یک تاریخچه‌ی کامل و قابل‌بازگشت محلی هستند
4. اگر یک فایل اشتباه حذف یا خراب شد، با `git log` و `git checkout` به‌سادگی قابل بازیابی است

> این یک backup واقعی در برابر خرابی دیسک نیست (آن را باید با Time Machine / File History یا یک ابزار sync جدا حل کنی)، اما در برابر خطای انسانی یا باگ نرم‌افزاری محافظت کامل می‌دهد و هزینه‌ی پیاده‌سازی‌اش تقریباً صفر است.

---

## 7. Phase-by-Phase Build Instructions

> **قانون مهم برای Agent:** هر فاز را در یک session/prompt جدا بده. هرگز همه‌ی فازها را یک‌جا ندهی. هر فاز باید به یک حالت کاری و قابل‌تست ختم شود.

> **تغییر کلیدی نسبت به نسخه‌ی اول:** فازها این‌بار طوری چیده شده‌اند که قوانین اصلی (focus tracking، pause note) از همان روز دوم/سوم در دسترس باشند — نه بعد از یک هفته. چون هدف تو الان «تست کردن این است که آیا این ابزار واقعاً به کارت می‌آید»، باید هرچه سریع‌تر به نسخه‌ای برسی که حس واقعی استفاده‌ی روزمره را بدهد.

---

### Phase 0 — Skeleton (نیم روز)

**Prompt for Agent:**
```
Create a monorepo at ~/personal-pm/ with this structure:
- Root package.json with scripts: "dev" using concurrently to run server and client
- server/: Express app on port 4001, CORS enabled for localhost:5173, reads DATA_DIR from .env
- client/: Vite + React + Tailwind, with /api proxied to localhost:4001
- .env with: DATA_DIR=~/Workspace, PORT=4001, API_TOKEN=dev-token-change-me, ENFORCE_AUTH=false
- server/middleware/auth.js: reads Bearer token, warns if missing/wrong but always passes through when ENFORCE_AUTH=false
- server has GET /api/ping returning { ok: true }
- client shows "Connected ✓" if /api/ping succeeds, "Offline ✗" if not
- On server startup, if DATA_DIR doesn't exist, create it along with a DATA_DIR/_inbox subfolder
- On server startup, if DATA_DIR is not a git repo, run `git init` inside it (no remote, just local history)
```

**Acceptance criteria:**
- `npm run dev` از روت هر دو سرور و کلاینت را اجرا می‌کند
- مرورگر در `localhost:5173` پیام "Connected ✓" را نشان می‌دهد
- `curl localhost:4001/api/ping` خروجی `{ ok: true }` برمی‌گرداند
- پوشه‌ی `~/Workspace/_inbox` ساخته شده و `~/Workspace` یک گیت‌ریپو است

---

### Phase 1 — Core API + Focus Tracking (1.5 روز)

> این فاز نسبت به نسخه‌ی اول گسترده‌تر شده تا `is_current` و backup خودکار را هم از همین ابتدا شامل شود.

**Prompt for Agent:**
```
Implement the core API for the personal-pm project. Use gray-matter for frontmatter parsing.
DATA_DIR comes from .env.

Endpoints:
1. GET /api/tree — recursive directory scan including _inbox, return tree with frontmatter for each .md file
2. GET /api/item?path=... — return frontmatter + body of one file (path relative to DATA_DIR)
3. POST /api/item — create or update file. On status change: append a line to ## Log section
   formatted as `- {ISO timestamp} | status: {old} → {new}`. Do NOT allow this endpoint to change
   is_current directly — reject the request with 400 if frontmatter.is_current is present in the body.
4. DELETE /api/item?path=... — soft-delete: move file to DATA_DIR/.trash/{timestamp}-{filename}
   instead of actually deleting it. Create .trash/ if it doesn't exist.
5. GET /api/today — flat list where status=active or priority=today, plus the current is_current
   task included separately as "current" in the response
6. PUT /api/current — body: { path, stop_note? }. If another file has is_current=true, require
   stop_note (min 10 chars, else 400), append `- {timestamp} | focus: stopped | "{stop_note}"` to its
   Log, set its is_current to false. Then set target file's is_current to true and append
   `- {timestamp} | focus: started` to its Log. Return { previous, current }.
7. GET /api/current — return the file with is_current=true, or { current: null }

After every successful POST /api/item, PUT /api/current, or DELETE /api/item, run an async
git add -A && git commit -m "auto: {path} updated" inside DATA_DIR (don't block the response on this,
just fire and forget, log errors to console if git isn't available).

All routes must use the auth middleware from Phase 0.
If ## Log section doesn't exist in a file, create it.
```

**Acceptance criteria:**
- تمام endpointها از طریق curl تست شده و داده‌ی درست برمی‌گردانند
- `POST /api/item` با `is_current` در بدنه، خطای ۴۰۰ می‌دهد
- `PUT /api/current` بدون `stop_note` وقتی یک تسک دیگر current است، ۴۰۰ می‌دهد
- بعد از هر تغییر، `git log` داخل `DATA_DIR` یک commit جدید نشان می‌دهد
- حذف یک فایل آن را به `.trash/` منتقل می‌کند، نه پاک واقعی

---

### Phase 2 — Frontend Core + Focus UI (3 روز)

> این فاز، Phase 2 و Phase 3 نسخه‌ی اول را ادغام می‌کند، چون قانون focus/pause باید از همان ابتدا قابل‌حس باشد.

**Prompt for Agent:**
```
Build the React frontend for personal-pm with 3 main views. Use Tailwind CSS.

Layout: 2-column (sidebar + detail panel). Top nav with "Today" and "Projects" links, plus a
persistent "Currently working on: {title}" banner showing the is_current task (or "Nothing set as
current" if none).

1. SIDEBAR — ProjectTree:
   - Fetch GET /api/tree on load (includes _inbox as a special top-level node)
   - Render collapsible tree nodes (projects = folders, tasks = files)
   - Each node shows title + status badge (color-coded: active=green, paused=yellow, done=gray,
     backlog=blue) + a small dot/star icon if is_current=true
   - "+" button on project nodes (and on _inbox) to create sub-project or task (inline form)
   - Clicking a task opens it in the detail panel

2. DETAIL PANEL — for a selected task/project:
   - Fetch GET /api/item?path=... when selection changes
   - Editable fields: title, status (dropdown), priority (dropdown), last_note (textarea)
   - Body editor: use a markdown editor with live preview toggle (e.g. @uiw/react-md-editor),
     not a plain textarea
   - "Make this my current focus" button:
     - If no other task is current: immediately calls PUT /api/current with just { path }
     - If another task IS current: opens a modal requiring a stop_note (min 10 chars) for the
       OLD current task before switching. "Switch focus" button disabled until stop_note filled.
       On confirm: calls PUT /api/current with { path, stop_note }
   - Log Timeline: parse ## Log lines and render as a vertical timeline, visually distinguishing
     status-change lines from focus-change lines (different icon/color)
   - Save button → POST /api/item (this does NOT touch is_current)
   - Delete button → DELETE /api/item (with confirmation; explain it moves to trash, not permanent)

3. TODAY VIEW:
   - Fetch GET /api/today
   - Top section: large card for the "current" task if present
   - Card grid below: each card shows title, project path, status, priority, last_note
   - Clicking a card opens it in detail panel (switch to Projects view)

All API calls in src/api/client.js. Include Authorization header from import.meta.env.VITE_API_TOKEN.
```

**Acceptance criteria:**
- می‌توان کل درخت پروژه را مرور کرد، شامل `_inbox`
- می‌توان یک تسک را باز، ویرایش و ذخیره کرد، با پیش‌نمایش مارک‌داون
- نمی‌توان فوکوس را بدون نوشتن `stop_note` (وقتی تسک دیگری current است) سوییچ کرد
- بنر "Currently working on" همیشه در بالای صفحه به‌روز است
- نمای Today درست کار می‌کند و تسک current را جدا نشان می‌دهد
- Log timeline بین رویدادهای status و focus تمایز بصری دارد

---

### Phase 3 — Recurring Tasks (1 روز)

> بخش PWA Shell نسخه‌ی اول از این پلن **حذف شد** — چون فعلاً تصمیم گرفته شده که فاز "آنلاین/موبایل" بعداً و فقط اگر لازم شد بررسی می‌شود؛ ساختن یک service worker غیرفعال الان فقط پیچیدگی بی‌فایده اضافه می‌کند.

**Prompt for Agent:**
```
Add recurring task support to personal-pm:

- Frontmatter field: recurrence: "weekly" | "monthly" | null
- In POST /api/item handler: when status changes to "done" AND file has recurrence set:
  a. Keep the current file as-is (marked done)
  b. Create a NEW file with same name + timestamp suffix (e.g. task-standup-2026-06-21.md)
  c. New file: copy frontmatter, reset status to "backlog", is_current to false, set created_at to now
  d. Calculate next due date: add 7 days (weekly) or 1 month (monthly) to today
  e. Add field due_date to the new file's frontmatter
- Add "recurrence" dropdown to the Detail Panel UI (None / Weekly / Monthly)
```

**Acceptance criteria:**
- تکمیل یک تسک recurring یک فایل جدید با `due_date` درست می‌سازد
- فایل جدید با `is_current: false` و `status: backlog` شروع می‌شود

---

### Phase 4 — Search (نیم روز، اختیاری)

```
Add full-text search to personal-pm:

Server: GET /api/search?q=<term>
- Use Node.js fs/promises to recursively read all .md files in DATA_DIR, excluding .trash/
- For each file, check if content includes the search term (case-insensitive)
- Return: [{ path, title (from frontmatter), matches: [line1, line2, ...] }]
- Limit: max 5 matching lines per file, max 50 results total

Client: Search bar in the top nav
- Debounced input (300ms)
- Dropdown results below the search bar
- Each result shows: title, path, first matching line
- Clicking a result opens it in the detail panel
```

---

## 8. Environment Configuration

### `.env` (root)
```env
# Server
DATA_DIR=~/Workspace
PORT=4001

# Auth — change this before going online
API_TOKEN=dev-token-change-me-before-deploy
ENFORCE_AUTH=false

# Client (Vite reads VITE_ prefix)
VITE_API_URL=http://localhost:4001
VITE_API_TOKEN=dev-token-change-me-before-deploy
```

### `.gitignore` (روت پروژه — جدا از گیت داخلیِ `DATA_DIR`)
```
.env
node_modules/
dist/
*.log
```

> **نکته:** `~/personal-pm` (کد) و `~/Workspace` (داده) دو گیت‌ریپو کاملاً مجزا هستند. گیت داخل `Workspace` فقط برای history/backup محلی است، نه برای نگه‌داری کد.

> **نکته‌ی امنیتی:** `API_TOKEN` در `.env` برای استفاده‌ی local مشکلی ندارد. قبل از آنلاین کردن: یک توکن قوی بساز (`openssl rand -hex 32`)، `ENFORCE_AUTH=true` کن، و هرگز `.env` را commit نکن.

---

## 9. Root `package.json`

```json
{
  "name": "personal-pm",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "build": "npm run build --prefix client",
    "start": "npm run start --prefix server"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

---

## 10. Future: Going Online / Mobile Access (در صورت نیاز)

تو الان تصمیم گرفتی که فعلاً فقط محلی کار کنی تا ببینی آیا این ابزار را واقعاً ادامه می‌دهی. اگر بعد از چند هفته به این نتیجه رسیدی که بله، دو مسیر متفاوت پیش روی توست — این پلن هیچ‌کدام را الان پیاده‌سازی نمی‌کند، فقط مسیر را باز نگه می‌دارد:

**مسیر الف — کامپیوتر شخصی همچنان مرکز داده باشد:**
1. روی کامپیوترت Tailscale (یا معادل آن) نصب کن
2. روی موبایل هم Tailscale نصب و به همان شبکه‌ی خصوصی وصل شو
3. سرور Express را به‌جای `localhost`، روی `0.0.0.0` گوش بده
4. از موبایل با IP داخلی Tailscale به سرور وصل شو
5. محدودیت: وقتی کامپیوتر خاموش/خواب است، اپ از موبایل کار نمی‌کند

**مسیر ب — یک VPS کوچک، با sync دوطرفه:**
1. کپی `server/` روی یک VPS (مثل Hetzner یا DigitalOcean)
2. تنظیم یک مکانیزم sync بین `~/Workspace` لوکال و دیتای VPS (مثلاً با git push/pull دوره‌ای، یا Syncthing)
3. `ENFORCE_AUTH=true`، توکن قوی با `openssl rand -hex 32`
4. `npm run build` در `client/`، سرو کردن `dist/` با nginx
5. محدودیت: دیتا دیگر "فقط روی کامپیوتر شخصی‌ت" نیست — این یک تصمیم آگاهانه می‌خواهد

> تصمیم بین این دو مسیر را به زمانی که واقعاً لازم شد موکول کن. معماری فعلی (API جدا از UI، auth از روز اول) برای هر دو مسیر بدون ریفکتور بزرگ کار می‌کند.

---

## 11. Testing Checklist (Per Phase)

### Phase 0
- [ ] `npm run dev` هر دو پروسه را اجرا می‌کند
- [ ] `localhost:5173` پیام "Connected ✓" نشان می‌دهد
- [ ] `~/Workspace/_inbox` ساخته شده و `~/Workspace` یک گیت‌ریپو است

### Phase 1
- [ ] `GET /api/tree` کل درخت فایل را برمی‌گرداند، شامل `_inbox`
- [ ] `POST /api/item` با تغییر status، خط درستی به `## Log` اضافه می‌کند
- [ ] `POST /api/item` با `is_current` در بدنه → ۴۰۰
- [ ] `PUT /api/current` بدون `stop_note` لازم → ۴۰۰
- [ ] `PUT /api/current` با `stop_note` معتبر → فوکوس درست سوییچ می‌شود و هر دو خط لاگ ثبت می‌شوند
- [ ] `DELETE /api/item` فایل را به `.trash/` منتقل می‌کند، نه حذف واقعی
- [ ] بعد از هر تغییر، `git log -1` داخل `DATA_DIR` یک commit جدید نشان می‌دهد
- [ ] `GET /api/today` تسک current را جدا و تسک‌های active/today را لیست می‌کند

### Phase 2
- [ ] درخت کامل در سایدبار رندر می‌شود، شامل `_inbox`
- [ ] می‌توان یک تسک جدید از دکمه‌ی "+" ساخت
- [ ] سوییچ فوکوس بدون یادداشت (وقتی تسک دیگری current است) مسدود می‌شود
- [ ] بنر "Currently working on" در همه‌ی صفحات به‌روز است
- [ ] Log timeline بین رویدادهای status و focus تمایز دارد
- [ ] نمای Today بارگذاری می‌شود و قابل‌کلیک است
- [ ] پیش‌نمایش مارک‌داون در ادیتور body کار می‌کند

### Phase 3
- [ ] تکمیل یک تسک recurring → فایل جدید با `due_date` درست ساخته می‌شود
- [ ] فایل جدید با `status: backlog` و `is_current: false` شروع می‌شود

### Phase 4
- [ ] جستجو برای ۱۰۰ فایل در حدود ۲۰۰ میلی‌ثانیه نتیجه می‌دهد
- [ ] حالت "بدون نتیجه" به‌درستی مدیریت می‌شود

---

## 12. Known Constraints & Decisions

| Decision | Rationale |
|---|---|
| بدون دیتابیس | داده فایل `.md` است → قابل ردیابی با git، قابل ویرایش دستی، قابل انتقال |
| `status` چندتایی، `is_current` یکتا و سراسری | منطبق بر الگوی واقعی کار: چند پروژه‌ی موازی باز، اما یک تمرکز لحظه‌ای |
| یادداشت اجباری روی تغییر `is_current`، نه `status` | اصطکاک فقط جایی اعمال می‌شود که واقعاً ارزش دارد: سوییچ تمرکز ذهنی |
| بخش Log همیشه append-only | تاریخچه‌ی کامل و غیرمخرب، قابل‌خوانش حتی بدون اپ |
| Soft-delete به‌جای حذف واقعی | جلوگیری از از-دست‌رفتن داده‌ی غیرعمدی |
| Git auto-commit روی `DATA_DIR` | backup صفر-هزینه در برابر خطای انسانی/باگ، بدون نیاز به سرویس بیرونی |
| پوشه‌ی `_inbox` برای تسک‌های بدون پروژه | نه هر کاری به یک پروژه تعلق دارد |
| میدل‌ور auth همیشه حاضر، اما فعلاً غیرفعال | آماده برای دسترسی موبایل/VPS در آینده، بدون ریفکتور |
| PWA shell **حذف شد** نسبت به نسخه‌ی اول | تصمیم آنلاین‌شدن هنوز قطعی نیست؛ ساختن زیرساخت برای آن الان زودرس و بی‌فایده است |
| ترتیب فازها: focus-tracking در Phase 2، نه Phase 3 | هدف فعلی تست واقعی قابلیت ابزار است؛ هرچه زودتر تجربه‌ی واقعی به‌دست بیاید بهتر |
