# AGENT.md — Project Memory for Personal PM

> این فایل راهنمای دائمی پروژه است. **هر agent‌ که روی این پروژه کار می‌کند باید این فایل را بخواند** و **پس از هر تغییر معنادار آن را به‌روز کند.** هدف: گم‌نشدن در ساختار و حفظ زمینه بین sessionها.
>
> 📌 **دو فایل که باید همیشه همگام نگه داشته شوند:**
> - **این فایل (`AGENT.md`)** — ساختار، قراردادها، وضعیت فازها، تصمیمات طراحی.
> - **[`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md)** — ثبت ایرادات رفع‌شده، **علت ریشه‌ای هر ایراد**، راه‌حل، و درس‌آموخته‌ها.
>
> ⚠️ **الزام:** پس از **هر** تغییر در کد (چه باگ‌فیکس، چه فیچر، چه ریفکتور)، **هر دو** فایل باید به‌روز شوند:
> 1. در `AGENT.md`: ساختار/قرارداد/وضعیت را اگر تغییری داده‌ای به‌روز کن.
> 2. در `KNOWN_ISSUES.md`: اگر باگی رفع شد یا علت مشکلی را فهمیدی، آن را با قالب بخش ۰ همان فایل ثبت کن (علت ریشه‌ای + درس‌آموخته).
>
> هدف از `KNOWN_ISSUES.md`: ساختن حافظه‌ی جمعی از اشتباهات برای **کاهش درصد خطا** در توسعه‌های بعدی. بدون ثبت علت، همان اشتباه تکرار می‌شود.

---

## ۰. وضعیت فعلی

**آخرین به‌روزرسانی:** Phase 0 + 1 + 2 کامل (client-side ~۹۵٪).

| فاز | وضعیت | توضیح |
|-----|-------|-------|
| Phase 0 — Skeleton | ✅ کامل | روت package.json، .env، server روی :4001 با /api/ping، client Vite+React+Tailwind، ساخت data/_inbox و git init در startup |
| Phase 1 — Core API + Focus Tracking | ✅ کامل | همه endpointها نوشته شد + syntax-check پاس شد |
| Phase 2 — Frontend Core + Focus UI | ✅ کامل | layout، sidebar، detail، today، App.jsx — همه ساخته و کار می‌کنند |
| Phase 3 — Recurring Tasks | ⬜ خارج از scope فعلی | |
| Phase 4 — Search | ⬜ خارج از scope فعلی | |

> پس از هر فاز، جدول بالا و چک‌لیست بخش ۶ را به‌روز کن.

---

## ۱. این پروژه چیست؟

ابزار **local-first** مدیریت پروژه‌ی شخصی. داده فایل‌های `.md` با YAML frontmatter روی دیسک است — بدون دیتابیس، بدون cloud. معماری دو-سرویسی (Express + React) برای مهاجرت آینده به cloud/mobile آماده است.

- پلن کامل: [`personal-pm-build-plan-v2.md`](./personal-pm-build-plan-v2.md)
- سیستم طراحی (RTL/فارسی/بنفش): [`pm-ui-kit.md`](./pm-ui-kit.md)

**Scope این کار:** Phase 0 + 1 + 2 (نسخه‌ی کاربردی کامل روزمره). Phase 3 و 4 ساخته نشدند (طبق پلن، هر فاز جدا).

---

## ۲. ساختار پوشه‌ها

نشانه‌گذاری: ✅ کامل | 🟡 نیمه‌تمام | ⬜ ساخته‌نشده

```
ProjectManagment/
├── AGENT.md                    ✅ همین فایل (ساختار + قراردادها + وضعیت)
├── KNOWN_ISSUES.md             ✅ ثبت باگ‌ها + علت ریشه‌ای + درس‌آموخته‌ها (بعد از هر تغییر آپدیت شود)
├── personal-pm-build-plan-v2.md ✅ (موجود از قبل)
├── pm-ui-kit.md                ✅ (موجود از قبل)
├── package.json                ✅ روت: concurrently + اسکریپت dev/build/start
├── .env                        ✅ DATA_DIR=./data, PORT=4001, توکن‌ها
├── .env.example                ✅
├── .gitignore                  ✅ (data/ هم نادیده گرفته می‌شود)
│
├── data/                       ⬜ توسط سرور در اولین اجرا ساخته می‌شود
│   ├── _inbox/                 ✅ (سرور می‌سازد + ۲ فایل نمونه seed فقط یک‌بار)
│   ├── .seed-done              ✅ (مارکر seed — جلوگیری از بازگشت تسک‌های نمونه)
│   ├── .tree-order.json        ✅ (ترتیب فولدرهای پروژه در سایدبار)
│   ├── .trash/                 ✅ (legacy — فقط purge خودکار؛ حذف جدید permanent است)
│   └── .git/                   ⬜ (گیت‌ریپوی محلی backup، توسط ensureRepo)
│
├── server/                     ✅ کامل
│   ├── package.json            ✅ express, gray-matter, cors, dotenv, morgan, nanoid, simple-git
│   ├── index.js                ✅ bootstrap (dirs, seed, git) + express app + routers
│   ├── middleware/auth.js      ✅ Bearer token، pass-through تا ENFORCE_AUTH=true
│   ├── lib/
│   │   ├── paths.js            ✅ getDataDir / resolveDataPath (anti-traversal) / ensureDir / toRelPath
│   │   ├── files.js            ✅ readItem / writeItem / patchFrontmatter / appendToLog
│   │   ├── log.js              ✅ status/focus line builders + parseLogLine + parseLogFromBody
│   │   ├── tree.js             ✅ buildTree + scanDir + walkTasks + folder order
│   │   ├── treeOrder.js        ✅ read/write `.tree-order.json` برای ترتیب فولدرها
│   │   ├── trash.js            ✅ purge legacy `.trash/` (۱۰ روز)
│   │   └── backup.js           ✅ ensureRepo (git init) + autoCommit (fire-and-forget)
│   └── routes/
│       ├── ping.js             ✅ GET /api/ping
│       ├── tree.js             ✅ GET /api/tree
│       ├── item.js             ✅ GET|POST|DELETE /api/item + POST /api/item/log + POST /api/move + POST /api/reorder
│       ├── today.js            ✅ GET /api/today
│       ├── current.js          ✅ GET|PUT /api/current (stop_note rule)
│       └── project.js          ✅ POST|DELETE /api/project
│
└── client/                     ✅ کامل
    ├── package.json            ✅ react, react-dom, zustand, lucide-react, @uiw/react-md-editor, vite, tailwind
    ├── vite.config.js          ✅ proxy /api → :4001، loadEnv از روت
    ├── index.html              ✅ lang="fa" dir="rtl" + فونت Vazirmatn
    ├── tailwind.config.js      ✅ توکن‌های کامل PM UI Kit (colors/radius/shadow/fontSize)
    ├── postcss.config.js       ✅
    └── src/
        ├── main.jsx            ✅
        ├── App.jsx             ✅ ریشه UI: ToastHost + AppShell + Today/Projects views
        ├── index.css           ✅ tokens + scrollbar + RTL + react-md-editor (فارسی/RTL)
        ├── api/client.js       ✅ request + ApiError + api.{…,createItem,appendLogNote,deleteItem,…}
        ├── lib/
        │   ├── constants.js    ✅ STATUS/PRIORITY (label + کلاس‌های Tailwind) + OPTIONS + STOP_NOTE_MIN + VIEWS
        │   └── format.js       ✅ toFa / formatDateTime / parseLogLine / parseLogFromBody / stripLogFromBody / appendWorkNoteBlock / buildBodyWithLog / slugify
        ├── store/
        │   └── useAppStore.js  ✅ zustand: view, selectedPath, current, toasts
        ├── hooks/
        │   ├── useTree.js      ✅
        │   ├── useItem.js      ✅
        │   ├── useToday.js     ✅
        │   └── useCurrent.js   ✅
        ├── components/
        │   ├── ui/             ✅ Button, Card, Badge, Input(Field/Input/Textarea/AutoResizeTextarea/Select), Modal, Toast(ToastHost), Feedback(Skeleton/Spinner/EmptyState)
        │   ├── layout/         ✅ AppShell, Sidebar, TopBar, CurrentBanner
        │   ├── Sidebar/        ✅ ProjectTree.jsx + TreeNode.jsx (rename + DnD task→folder + folder reorder)
        │   ├── Detail/         ✅ DetailPanel + FrontmatterEditor + TaskNotes + CurrentFocusToggle + PauseNoteModal + LogTimeline + AddLogEntryModal + LogEventModal
        │   └── Today/          ✅ TodayView.jsx
```

---

## ۳. قراردادهای حیاتی (هرگز نقض نشود)

1. **`status` چندتایی است، `is_current` یکتا و سراسری.** فقط یک فایل در کل سیستم می‌تواند `is_current: true` داشته باشد.
2. **`is_current` فقط از طریق `PUT /api/current` تغییر می‌کند.** `POST /api/item` اگر `is_current` در بدنه بیاید → **400**.
3. **سوییچ focus وقتی تسک دیگری current است، نیازمند `stop_note` (≥ ۱۰ کاراکتر) است** → بدون آن **400**.
4. **بخش `## Log` همیشه append-only است.** هرگز بازنویسی/حذف نشود. سه نوع رویداد: `status:`، `focus:`، `note:` (ثبت کار دستی). «ثبت کار» از `POST /api/item/log` → `appendToLog` + `noteLine`؛ یادداشت تسک جداگانه با خط جداکننده به‌روز می‌شود.
5. **حذف = permanent delete** با `fs.unlink` (تسک) یا `fs.rm` (پروژه). دیگر به `.trash/` منتقل نمی‌شود. پوشه `.trash/` legacy است و فقط purge خودکار دارد.
6. **Seed فقط یک‌بار:** فایل `data/.seed-done` بعد از اولین seed ساخته می‌شود — حتی اگر inbox خالی شود، تسک‌های نمونه دوباره ساخته نمی‌شوند.
7. **DATA_DIR گیت‌ریپوی مستقل خودش را دارد.** کد و داده‌ی کاربر دو ریپو جدا هستند.
8. **UI فارسی/RTL** — Sidebar راست، Timeline خط راست، Toast بالا-چپ، رنگ برند `#7C6BF0`.
9. **parseLogLine در دو جا وجود دارد** (server/lib/log.js و client/src/lib/format.js) — این‌دو باید **منعکسِ هم** بمانند. اگر فرمت Log را عوض کردی، هر دو را به‌روز کن.
10. **ترتیب فولدرهای پروژه** در `data/.tree-order.json` ذخیره می‌شود. `_inbox` همیشه اول است و قابل جابجایی نیست.
11. **DnD در سایدبار:** تسک → فولدر (انتقال)؛ فولدر پروژه → فولدر هم‌سطح (تغییر ترتیب). inbox draggable/reorderable نیست.
12. **یادداشت زمینه (`last_note`)** از `AutoResizeTextarea` استفاده می‌کند — با رشد متن، ارتفاع خودکار زیاد می‌شود.
13. **بدنه تسک:** یادداشت ثابت (`TaskNotes`) جدا از تاریخچه (`LogTimeline`). بخش `## Log` هنگام save با `mergeBodyPreservingLog` در `files.js` حفظ می‌شود. پارس بخش Log در `format.js` با `findLogSectionRange` — **از `$` با فلگ `m` در lookahead استفاده نکن** (باگ strip؛ جزئیات در `KNOWN_ISSUES.md` #7).

---

## ۴. اجرا و توسعه

```bash
# نصب وابستگی‌ها (سه سطح)
npm install                    # root (concurrently)
npm install --prefix server
npm install --prefix client

# اجرای همزمان سرور + کلاینت از روت
npm run dev
#   → server  http://localhost:4001
#   → client  http://localhost:5173

# تست سریع API
curl http://localhost:4001/api/ping
curl http://localhost:4001/api/tree -H "Authorization: Bearer dev-token-change-me-before-deploy"
```

> کلاینت Vite پراکسی `/api` را به `:4001` می‌فرستد، پس در مرورگر فقط `localhost:5173`.
> در اولین اجرای سرور، `data/` + `data/_inbox/` ساخته می‌شود، ۲ فایل نمونه seed می‌شود، و `git init` داخل `data/` اجرا می‌شود.

### اجرای خودکار به‌روزرسانی حافظه پروژه

دو لایه برای اینکه agentها `AGENT.md` / `KNOWN_ISSUES.md` را فراموش نکنند:

1. **Cursor rule (همیشه فعال):** `.cursor/rules/project-memory-sync.mdc` با `alwaysApply: true` — در هر session به agent تزریق می‌شود.
2. **Git hook (اختیاری، یک‌بار فعال‌سازی):**
   ```bash
   git config core.hooksPath .githooks
   ```
   اگر `client/` یا `server/` در commit باشد ولی هیچ‌کدام از `AGENT.md` / `KNOWN_ISSUES.md` آپدیت نشده باشند، commit رد می‌شود.

### تست دستی کلیدی (curl)
```bash
TOKEN="dev-token-change-me-before-deploy"
H="Authorization: Bearer $TOKEN"

# تغییر وضعیت → باید خط Log اضافه کند
curl -s -X POST localhost:4001/api/item -H "$H" -H "Content-Type: application/json" \
  -d '{"path":"_inbox/welcome-personal-pm.md","frontmatter":{"status":"paused"}}'

# رد کردن is_current از طریق /api/item → باید 400 بدهد
curl -s -X POST localhost:4001/api/item -H "$H" -H "Content-Type: application/json" \
  -d '{"path":"_inbox/welcome-personal-pm.md","frontmatter":{"is_current":true}}'

# سوییچ focus وقتی چیزی current نیست → فقط path کافی است
curl -s -X PUT localhost:4001/api/current -H "$H" -H "Content-Type: application/json" \
  -d '{"path":"_inbox/welcome-personal-pm.md"}'

# حالا که چیزی current است، سوییچ بدون stop_note → باید 400 بدهد
curl -s -X PUT localhost:4001/api/current -H "$H" -H "Content-Type: application/json" \
  -d '{"path":"_inbox/task-renew-car-insurance.md"}'
```

---

## ۵. مدل داده (frontmatter)

```yaml
---
title: "..."
type: task | project
status: active | paused | done | backlog
priority: today | high | normal | low
is_current: false
created_at: "ISO"
updated_at: "ISO"
last_note: "..."
recurrence: weekly | monthly   # Phase 3 (خارج از scope فعلی)
due_date: "YYYY-MM-DD"         # Phase 3
---
```

---

## ۶. چک‌لیست تست (بر اساس پلن)

### Phase 0
- [ ] `npm run dev` هر دو پروسه را اجرا می‌کند
- [ ] `localhost:5173` پیام «Connected ✓» نشان می‌دهد
- [ ] `data/_inbox` ساخته شده و `data/` یک گیت‌ریپو است

### Phase 1
- [ ] `GET /api/tree` کل درخت را برمی‌گرداند (شامل `_inbox`)
- [ ] `POST /api/item` با تغییر status، خط درست به `## Log` اضافه می‌کند
- [ ] `POST /api/item/log` با متن ≥۳ کاراکتر، خط `note:` به `## Log` اضافه می‌کند و در LogTimeline نمایش داده می‌شود
- [ ] `POST /api/item` با `is_current` در بدنه → 400
- [ ] `PUT /api/current` بدون `stop_note` لازم → 400
- [ ] `PUT /api/current` با `stop_note` معتبر → فوکوس سوییچ + هر دو خط لاگ
- [ ] `DELETE /api/item` فایل را برای همیشه حذف می‌کند (نه soft-delete)
- [ ] بعد از هر تغییر، `git log -1` در `data/` یک commit جدید نشان می‌دهد
- [ ] `GET /api/today` تسک current را جدا و تسک‌های active/today را لیست می‌کند

### Phase 2
- [ ] درخت کامل در سایدبار رندر می‌شود (شامل `_inbox`)
- [ ] دکمه‌ی «+» یک تسک جدید می‌سازد
- [ ] سوییچ focus بدون یادداشت (وقتی تسک دیگری current است) مسدود می‌شود
- [ ] بنر «در حال کار روی» در همه‌ی صفحات به‌روز است
- [ ] Log timeline بین رویدادهای status و focus تمایز دارد
- [ ] نمای Today بارگذاری و کلیک‌پذیر است
- [ ] پیش‌نمایش مارک‌داون در ادیتور body کار می‌کند (RTL، فاصله‌گذاری فارسی)
- [ ] یادداشت زمینه با رشد متن، textarea را بزرگ‌تر می‌کند
- [ ] فولدرهای پروژه با drag-and-drop قابل مرتب‌سازی هستند
- [ ] حذف تسک/پروژه permanent است و تسک‌های نمونه پس از حذف برنمی‌گردند

---

## ۷. نکات برای agent بعدی

- اگر فاز جدیدی اضافه می‌کنی، اول جدول بخش ۰ و چک‌لیست بخش ۶ را به‌روز کن.
- هر endpoint/کامپوننت جدید را در بخش ۲ (ساختار) ثبت کن.
- اگر قرارداد بخش ۳ را تغییر دادی، حتماً علت و تاریخ را ذکر کن.
- `data/` را هرگز به گیت‌ریپوی کد اضافه نکن (هم در `.gitignore` هم منطقاً).
- 🔴 **الزام ثبت باگ‌ها:** اگر باگی پیدا و رفع کردی، یا علت یک رفتار اشتباه را کشف کردی، حتماً در [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) ثبت کن — با علت ریشه‌ای و درس‌آموخته (قالب در بخش ۰ همان فایل). **بدون استثنا.** هدف: جلوگیری از تکرار همان اشتباه در آینده. اگر درس‌آموخته‌ای الگوی تکراری شد، آن را در بخش ۳ (الگوهای تجمعی) `KNOWN_ISSUES.md` به‌عنوان یک «قانون» بیاور.
- 🔴 **هر دو فایل را آپدیت کن:** پس از پایان کار، `AGENT.md` (ساختار/وضعیت) و `KNOWN_ISSUES.md` (باگ‌های جدید) را مرور و به‌روز کن.

---

## ۸. 👉 کارهای باقی‌مانده (Phase 3+)

Phase 2 کامل است. موارد زیر برای فازهای بعدی:

- **Phase 3:** recurring tasks، due_date
- **Phase 4:** search
- **اختیاری:** UI مرور `.trash/` legacy (حذف جدید permanent است)

---

## ۹. تصمیمات طراحی ثبت‌شده در طول ساخت

- **DATA_DIR = `./data`** (داخل خود پروژه) — طبق درخواست کاربر، نه `~/Workspace`. علت: کل پروژه (کد+داده) قابل‌حمل باشد. گیت‌ریپوی data مستقل از کد باقی می‌ماند.
- **`data/` در `.gitignore`** کد است تا با گیت‌ریپوی کد قاطی نشود.
- **server `type: module`** و همه‌چیز ESM است.
- **parseLogLine دو نسخه دارد** (server + client) چون سمت کلاینت نمی‌تواند مستقیماً `server/lib/log.js` را import کند. این‌دو عمداً منعکسِ هم نوشته شده‌اند (قرارداد ۸).
- **seed دو فایل نمونه** در `_inbox` در اولین اجرا، برای تست فوری UI.
- **vite.config.js از `loadEnv(mode, '..', '')` استفاده می‌کند** تا `VITE_*` از `.env` روت (یک سطح بالاتر) خوانده شود.
- **`api/client.js` در dev از پراکسی same-origin (`/api`) و در غیر dev از `VITE_API_URL` مطلق استفاده می‌کند.**

---

### تصمیمات ثبت‌شده در session ۲ (۲۰۲۶-۰۶-۲۷): فیچر + رفع باگ سایدبار/امروز

- **دو دکمه‌ی مستقل «پروژه» و «تسک» در ریشه‌ی `ProjectTree`** (به‌جای یک دکمه‌ی تنها «پروژه جدید»). علت: کاربر بتواند تسک مستقل بسازد. علت ریشه‌ای و کاملِ چرایی در `KNOWN_ISSUES.md` مورد #1.
- **فولدرها به‌صورت پیش‌فرض بسته‌اند (`useState(isInbox)`)** به‌جای باز. فقط `_inbox` باز می‌ماند. علاوه بر این، فولدرِ خودِ آیتم انتخاب‌شده (و زنجیره‌ی والدش) خودکار باز می‌ماند (`effectivelyOpen = open || containsSelected`). علت کامل در `KNOWN_ISSUES.md` مورد #2.
- **ثابت `INBOX_PATH = '_inbox'`** در `ProjectTree.jsx` تعریف شد تا رشته‌ی جادویی تکرار نشود؛ `handleCreateTask` در نبود `parentPath` به inbox برمی‌گردد.
- **دکمه‌های تعاملی در flex باید `shrink-0 whitespace-nowrap` بگیرند** تا فشرده/دوخطی نشوند (قانون A در `KNOWN_ISSUES.md`؛ مورد #3 نمونه‌ی آن در `TodayView`).

### تصمیمات ثبت‌شده در session ۳ (۲۰۲۶-۰۶-۲۸): rename + DnD + رفع باگ seed

- **رفع باگ seed (#4):** شرط `hasAny` به جای ریشه‌ی `data/`، زیرپوشه‌ی `data/_inbox/` را اسکن می‌کند + محافظ `existsSync` قبل از نوشتن فایل نمونه. علت کامل در `KNOWN_ISSUES.md` مورد #4.
- **Rename = فقط تغییر `title` در frontmatter** (نه تغییر نام فایل/فولدر). این روش ایمن است چون path ثابت می‌ماند و `selectedPath`/`current` خراب نمی‌شود. برای پروژه‌ها، فایل `_project.md` در مسیر پروژه ویرایش می‌شود.
- **Drag-and-drop فقط برای task → folder** (نه folder → folder). از HTML5 DnD API بومی استفاده شده بدون کتابخانه. تسک‌ها `draggable`، فولدرها `drop target`. اگر فایل هم‌نام در مقصد وجود داشت، suffix `-timestamp` اضافه می‌شود.
- **Endpoint جدید `POST /api/move`:** دریافت `{ from, to }` (هر دو relative path)، انتقال با `fs.rename`، autoCommit بعد از انتقال.

### تصمیمات ثبت‌شده در session ۴ (۲۰۲۶-۰۶-۲۸): رفع باگ start.bat

- **start.bat ساده‌سازی شد:** پیام گیج‌کننده‌ی ثابت EADDRINUSE حذف شد. اکنون قبل از شروع، پروسه‌های قبلی روی پورت‌های ۴۰۰۱ و ۵۱۷۳ را با `netstat` + `taskkill` می‌کشد.
- **vite.config.js:** `open: true` اضافه شد تا مرورگر خودکار وقتی Vite آماده باشد باز شود (نه با timeout ساده). `strictPort: true` جلوی انتخاب پورت تصادفی را می‌گیرد.

### تصمیمات ثبت‌شده در session ۵ (۲۰۲۶-۰۶-۳۰): UX بهبود + حذف دائم + folder reorder

- **AutoResizeTextarea برای `last_note`:** فیلد «یادداشت زمینه» با `scrollHeight` رشد می‌کند؛ `resize-none overflow-hidden` تا متن کامل دیده شود.
- **Folder reorder در سایدبار:** فولدرهای `type: project` draggable هستند؛ drop روی فولدر هم‌سطح → `POST /api/reorder` → `data/.tree-order.json`. `_inbox` ثابت در بالا و غیرقابل جابجایی.
- **مارک‌داون body — UX فارسی:** `@uiw/react-md-editor` با CSS سفارشی `.pm-markdown-editor` — line-height 2، فاصله پارagraph/list، blockquote RTL، preview RTL. باگ save: `writeItem` اکنون `mergeBodyPreservingLog` می‌زند (قبلاً `existingBody` همیشه بر body جدید غلبه می‌کرد).
- **حذف permanent:** `DELETE /api/item` → `fs.unlink`؛ `DELETE /api/project` → `fs.rm`. UI دیگر «سطل بازیافت» نشان نمی‌دهد.
- **Seed یک‌بار:** `data/.seed-done` marker — حتی با inbox خالی، تسک‌های نمونه (welcome + بیمه) دوباره ساخته نمی‌شوند. علت کامل در `KNOWN_ISSUES.md` مورد #5.
