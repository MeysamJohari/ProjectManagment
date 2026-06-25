# PM UI Kit — سیستم طراحی مدیریت پروژه
## نسخه ۱.۰ (فارسی / RTL)

> **فلسفه:** وضوح Metabase + نرمی بصری Quotient  
> **زبان:** فارسی، راست‌به‌چپ (RTL)  
> **رنگ برند:** `#7C6BF0` (بنفش)  
> **تم:** فقط Light — بدون Dark Mode در v1  
> **Stack هدف:** React + Vite + Tailwind CSS

---

## ۱. اصول طراحی

| اصل | توضیح |
|-----|--------|
| **داده‌محور** | هر صفحه یک سوال مشخص را جواب می‌دهد (امروز چه کارهایی دارم؟ وضعیت پروژه‌ها چطور است؟) |
| **کم‌نویز** | سطح سفید روی پس‌زمینه خاکستری روشن؛ بدون تزئین اضافه |
| **سلسله‌مراتب واضح** | عنوان > وضعیت > یادداشت؛ اعداد بزرگ برای متریک |
| **قابل اسکن** | Badge رنگی، آیکون یکدست، فاصله‌گذاری منظم |
| **فارسی‌محور** | RTL پیش‌فرض، فونت بهینه فارسی، اعداد و تاریخ قابل تنظیم |

### قوانین طلایی
1. سطح سفید روی `#F4F6F9` — نه glass سنگین
2. سایه ملایم فقط برای elevation
3. شعاع ۱۴px برای کارت؛ `full` برای search و badge
4. رنگ بنفش فقط برای برند/active/focus — بقیه semantic
5. انیمیشن ≤ ۲۰۰ms

---

## ۲. RTL و فارسی‌سازی

### ۲.۱ تنظیمات پایه HTML

```html
<html lang="fa" dir="rtl">
```

### ۲.۲ قوانین Layout در RTL

| عنصر | جهت |
|------|-----|
| Sidebar | **سمت راست** صفحه |
| Border سایدبار | `border-l` (نه `border-r`) |
| آیکون جستجو | سمت **راست** input |
| Chevron درخت | باز شدن به سمت چپ |
| Selected tree row | `border-r-2 border-pm-brand` |
| Toast | گوشه **بالا-چپ** |
| Modal actions | دکمه اصلی سمت **راست** |
| Timeline | خط عمودی سمت **راست** (`border-r-2`) |

### ۲.۳ تایپوگرافی فارسی

```css
:root {
  --pm-font-sans: "Vazirmatn", "Tahoma", system-ui, sans-serif;
  --pm-font-mono: "Vazirmatn FD", "JetBrains Mono", monospace;
}
```

**فونت اصلی:** [Vazirmatn](https://github.com/rastikerdar/vazirmatn) — خوانایی عالی در UI فارسی، وزن‌های متنوع، مناسب دسکتاپ.

```html
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
```

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `display` | 28px | 700 | عنوان صفحه («امروز»، «پروژه‌ها») |
| `title-lg` | 20px | 600 | عنوان پنل جزئیات |
| `title` | 16px | 600 | عنوان کارت تسک |
| `body` | 14px | 400 | متن اصلی |
| `body-sm` | 13px | 400 | توضیحات، last_note |
| `label` | 12px | 500 | برچسب فرم |
| `caption` | 11px | 500 | زمان، مسیر فایل |
| `metric` | 32px | 700 | اعداد داشبورد |
| `metric-sm` | 24px | 700 | آمار کوچک |

**نکات فارسی:**
- `letter-spacing: normal` — از فاصله حروف لاتین استفاده نکن
- `line-height` حداقل ۱.۵ برای پاراگراف فارسی
- عناوین انگلیسی در مسیر فایل: `font-mono` + `dir="ltr"` داخل span
- اعداد: پیش‌فرض فارسی (`۱۲۳`)؛ مسیر فایل و timestamp با `dir="ltr"`

```css
.pm-ltr {
  direction: ltr;
  unicode-bidi: isolate;
}
```

---

## ۳. Design Tokens

### ۳.۱ رنگ‌ها

```css
:root {
  /* ── Surfaces ── */
  --pm-bg-app:        #F4F6F9;
  --pm-bg-surface:    #FFFFFF;
  --pm-bg-subtle:     #EEF1F6;
  --pm-bg-muted:      #F8FAFC;

  /* ── Brand (بنفش) ── */
  --pm-brand:         #7C6BF0;
  --pm-brand-hover:   #6A58E8;
  --pm-brand-active:  #5B4AD9;
  --pm-brand-subtle:  #F0EDFE;
  --pm-brand-muted:   #C4B8F9;

  /* ── Text ── */
  --pm-text-primary:   #2E3A4A;
  --pm-text-secondary: #6B7C93;
  --pm-text-tertiary:  #9AA5B5;
  --pm-text-inverse:   #FFFFFF;

  /* ── Border ── */
  --pm-border:         #E2E8F0;
  --pm-border-strong:  #CBD5E1;
  --pm-border-focus:   var(--pm-brand);

  /* ── وضعیت تسک ── */
  --pm-status-active:    #22C55E;
  --pm-status-active-bg: #ECFDF5;
  --pm-status-paused:    #F59E0B;
  --pm-status-paused-bg: #FFFBEB;
  --pm-status-done:      #94A3B8;
  --pm-status-done-bg:   #F1F5F9;
  --pm-status-backlog:   #6366F1;
  --pm-status-backlog-bg:#EEF2FF;

  /* ── اولویت ── */
  --pm-priority-today:    #EF4444;
  --pm-priority-today-bg: #FEF2F2;
  --pm-priority-high:     #F97316;
  --pm-priority-high-bg:  #FFF7ED;
  --pm-priority-normal:   #6B7C93;
  --pm-priority-normal-bg:#F1F5F9;
  --pm-priority-low:      #94A3B8;
  --pm-priority-low-bg:   #F8FAFC;

  /* ── بازخورد ── */
  --pm-success: #22C55E;
  --pm-warning: #F59E0B;
  --pm-error:   #EF4444;
  --pm-info:    #7C6BF0;

  /* ── نمودار (پالت Quotient) ── */
  --pm-chart-1: #7C6BF0;  /* بنفش برند */
  --pm-chart-2: #22D3EE;  /* فیروزه‌ای */
  --pm-chart-3: #F472B6;  /* صورتی */
  --pm-chart-4: #FB923C;  /* نارنجی */
  --pm-chart-5: #509EE3;  /* آبی */

  /* ── گرادیان نمودار خطی ── */
  --pm-chart-gradient: linear-gradient(90deg, #509EE3, #7C6BF0, #F472B6);

  /* ── Elevation ── */
  --pm-shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.05);
  --pm-shadow-md: 0 4px 12px rgba(16, 24, 40, 0.08);
  --pm-shadow-lg: 0 12px 32px rgba(16, 24, 40, 0.12);

  /* ── Radius ── */
  --pm-radius-sm:   6px;
  --pm-radius-md:   10px;
  --pm-radius-lg:   14px;
  --pm-radius-xl:   18px;
  --pm-radius-full: 9999px;

  /* ── Spacing (پایه ۴px) ── */
  --pm-space-1:  4px;
  --pm-space-2:  8px;
  --pm-space-3:  12px;
  --pm-space-4:  16px;
  --pm-space-5:  20px;
  --pm-space-6:  24px;
  --pm-space-8:  32px;
  --pm-space-10: 40px;
  --pm-space-12: 48px;

  /* ── Layout ── */
  --pm-sidebar-width:     260px;
  --pm-sidebar-collapsed: 64px;
  --pm-header-height:     56px;
  --pm-content-max-width: 1280px;

  /* ── Motion ── */
  --pm-duration-fast:   120ms;
  --pm-duration-normal: 180ms;
  --pm-ease:            cubic-bezier(0.4, 0, 0.2, 1);
}
```

### ۳.۲ Tailwind Config

```js
export default {
  theme: {
    extend: {
      colors: {
        pm: {
          bg: { app: '#F4F6F9', surface: '#FFFFFF', subtle: '#EEF1F6' },
          brand: {
            DEFAULT: '#7C6BF0',
            hover: '#6A58E8',
            active: '#5B4AD9',
            subtle: '#F0EDFE',
            muted: '#C4B8F9',
          },
          text: { primary: '#2E3A4A', secondary: '#6B7C93', tertiary: '#9AA5B5' },
          border: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
          status: {
            active: '#22C55E', paused: '#F59E0B',
            done: '#94A3B8', backlog: '#6366F1',
          },
          chart: {
            1: '#7C6BF0', 2: '#22D3EE', 3: '#F472B6',
            4: '#FB923C', 5: '#509EE3',
          },
        },
      },
      borderRadius: {
        pm: { sm: '6px', md: '10px', lg: '14px', xl: '18px' },
      },
      boxShadow: {
        'pm-sm': '0 1px 2px rgba(16,24,40,0.05)',
        'pm-md': '0 4px 12px rgba(16,24,40,0.08)',
        'pm-lg': '0 12px 32px rgba(16,24,40,0.12)',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'system-ui', 'sans-serif'],
        mono: ['Vazirmatn FD', 'monospace'],
      },
    },
  },
};
```

---

## ۴. Layout

### ۴.۱ App Shell (RTL)

```
┌─────────────────────────────────────────────────────────────┐
│  [آواتار] سلام، میثم          [..............جستجو 🔍]  [لوگو] │  56px
├──────────────────────────────────────────────────┬──────────┤
│                                                  │          │
│  محتوای اصلی / پنل جزئیات                        │ Sidebar  │
│  (max-width 1280px, padding 24px)                │ 260px    │
│                                                  │          │
│  ┌─────────────┐  ┌─────────────────────────┐   │ ناوبری   │
│  │ کارت امروز  │  │ ویرایشگر / جزئیات       │   │ درخت     │
│  └─────────────┘  └─────────────────────────┘   │ پروژه    │
│                                                  │          │
└──────────────────────────────────────────────────┴──────────┘
```

### ۴.۲ Breakpoints

| Name | Width | رفتار |
|------|-------|-------|
| `md` | ≥768px | دو ستونه |
| `lg` | ≥1024px | layout کامل |
| `xl` | ≥1280px | محدودیت عرض محتوا |

### ۴.۳ Grid صفحات

| صفحه | Grid |
|------|------|
| امروز | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` |
| داشبورد | `grid-cols-1 lg:grid-cols-12 gap-4` |
| پروژه‌ها | سایدبار ثابت + پنل انعطاف‌پذیر |

---

## ۵. کامپوننت‌ها

### ۵.۱ Sidebar (ناوبری راست)

```
┌─────────────────────┐
│  ◆ مدیریت پروژه     │
├─────────────────────┤
│  فضای کار           │  ← section label
│    ○ امروز          │  ← active: bg-brand-subtle
│    ○ پروژه‌ها       │
│    ○ جستجو          │
├─────────────────────┤
│  درخت پروژه         │
│    ▼ آلفا           │
│      • صفحه ورود    │
│      • ریفکتور API  │
├─────────────────────┤
│  ⚙ تنظیمات          │
└─────────────────────┘
```

**وضعیت‌ها:**
- پیش‌فرض: `text-secondary`
- Hover: `bg-subtle`
- Active: `bg-brand-subtle text-brand font-medium`
- Badge: دایره نارنجی/قرمز با عدد

### ۵.۲ TopBar

```jsx
<input
  placeholder="جستجوی تسک‌ها..."
  className="h-10 w-full max-w-md rounded-full bg-pm-bg-subtle pr-10 pl-4
             text-body placeholder:text-pm-text-tertiary
             focus:bg-pm-bg-surface focus:ring-2 focus:ring-pm-brand/30"
/>
{/* آیکون Search absolute: right-3 */}
```

### ۵.۳ Button

| Variant | کاربرد | استایل |
|---------|--------|--------|
| **اصلی** | ذخیره، ایجاد | `bg-pm-brand text-white hover:bg-pm-brand-hover` |
| **ثانویه** | انصراف | `bg-subtle border border-pm-border` |
| **شبح** | آیکون | `hover:bg-subtle` |
| **خطر** | حذف | `text-error border border-red-200 hover:bg-red-50` |
| **خط‌چین** | + تسک جدید | `border-dashed border-strong` |

**اندازه:** `sm` h-8 | `md` h-9 | `lg` h-10  
**متن نمونه:** «ذخیره»، «انصراف»، «حذف تسک»، «+ تسک جدید»

### ۵.۴ Badge و Tag

**وضعیت تسک:**

| Status | فارسی | رنگ |
|--------|-------|-----|
| active | فعال | سبز |
| paused | متوقف | کهربایی |
| done | انجام‌شده | خاکستری |
| backlog | بک‌لاگ | نیلی |

**اولویت:**

| Priority | فارسی |
|----------|-------|
| today | امروز |
| high | بالا |
| normal | عادی |
| low | پایین |

```jsx
<span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5
                 text-label font-medium bg-pm-status-active-bg text-pm-status-active">
  <span className="h-1.5 w-1.5 rounded-full bg-current" />
  فعال
</span>
```

### ۵.۵ Card

#### کارت متریک
```
┌────────────────────────┐
│ [آیکون]  تسک‌های فعال  │
│          ۳             │
│  ↑ ۱ نسبت به دیروز    │
└────────────────────────┘
```

#### کارت تسک
```
┌──────────────────────────────┐
│ [فعال] [امروز]               │
│ رفع باگ صفحه ورود            │
│ آلفا/صفحه-ورود.md            │
│ «منتظر بررسی طراحی»          │
└──────────────────────────────┘
```

#### کارت پنل
- هدر: `border-b px-5 py-3`
- بدنه: `p-5`

### ۵.۶ Form Controls

```
input/select: h-9 px-3 rounded-pm-md border border-pm-border
textarea: min-h-[80px] px-3 py-2
focus: border-pm-brand ring-2 ring-pm-brand/20
label: text-label text-secondary mb-1.5
```

**متن‌های placeholder نمونه:**
- «عنوان تسک را وارد کنید»
- «یادداشت توقف (حداقل ۱۰ کاراکتر)»
- «جستجو...»

**Select وضعیت:** فعال | متوقف | انجام‌شده | بک‌لاگ  
**Select اولویت:** امروز | بالا | عادی | پایین

### ۵.۷ Tree (درخت پروژه)

- تورفتگی: ۱۶px در هر سطح
- ارتفاع ردیف: ۳۲px
- انتخاب: `bg-brand-subtle border-r-2 border-pm-brand`
- دکمه +: در سمت چپ ردیف (ابتدای LTR در RTL)

### ۵.۸ Timeline (لاگ)

```
                    ● ۱۴:۳۰ — ۱۴۰۴/۰۴/۰۱
                    │  فعال ← متوقف
                    │  «منتظر بررسی طراحی»
                    │
                    ● ۰۹:۰۰ — ۱۴۰۴/۰۴/۰۲
                       بک‌لاگ ← فعال
```

- خط: `border-r-2 border-pm-border` (سمت راست)
- نقطه: `bg-pm-brand`
- فلش وضعیت: `←` در RTL (قدیم ← جدید)

### ۵.۹ Modal

**مثال: مودال توقف تسک**
- عنوان: «قبل از توقف، یادداشت بنویسید»
- توضیح: `text-secondary`
- Textarea اجباری
- دکمه‌ها: «انصراف» (ثانویه) | «توقف تسک» (اصلی، غیرفعال تا پر شدن)

### ۵.۱۰ Toast

- موقعیت: بالا-چپ
- انواع: موفق | هشدار | خطا | اطلاعات
- نمونه: «تسک دیگری فعال است: [عنوان]»

### ۵.۱۱ Empty State

```
        [آیکون بزرگ]
        تسک فعالی ندارید
        از درخت پروژه یک تسک باز کنید یا تسک جدید بسازید.
        [+ تسک جدید]
```

### ۵.۱۲ Loading

- Skeleton: `animate-pulse bg-subtle rounded-pm-md`
- Spinner: حلقه بنفش ۲۰px
- Tree skeleton: ۵ خط با تورفتگی متفاوت

---

## ۶. نمودارها و آنالیتیکس (Charts)

> الهام: Quotient + سادگی Metabase — داده واضح، رنگ‌های پاستلی، بدون شلوغی

### ۶.۱ پالت نمودار

| Index | رنگ | کاربرد نمونه |
|-------|-----|--------------|
| 1 | `#7C6BF0` | سری اصلی / برند |
| 2 | `#22D3EE` | سری دوم |
| 3 | `#F472B6` | سری سوم |
| 4 | `#FB923C` | هشدار / روند |
| 5 | `#509EE3` | سری مکمل |

**قانون:** حداکثر ۵ سری در یک نمودار؛ بیشتر → جدول

### ۶.۲ کارت متریک (MetricCard)

```
┌─────────────────────────────┐
│  [🟣]   کل تسک‌ها            │
│         ۴۸                   │
│  ▲ ۵٪  نسبت به هفته قبل      │  ← رنگ نارنجی/سبز
└─────────────────────────────┘
```

| بخش | استایل |
|-----|--------|
| کانتینر | `bg-surface rounded-pm-lg shadow-pm-sm p-5` |
| آیکون | دایره ۴۰px، `bg-brand-subtle`، آیکون `text-brand` |
| برچسب | `text-label text-secondary` |
| عدد | `text-metric text-primary` |
| روند مثبت | `text-success` + ▲ |
| روند منفی | `text-error` + ▼ |

**متریک‌های پیشنهادی PM:**
- تسک‌های فعال
- انجام‌شده این هفته
- متوقف‌شده
- تسک‌های اولویت امروز

### ۶.۳ نمودار خطی (LineChart)

```
┌─────────────────────────────────────────┐
│  تسک‌های تکمیل‌شده         [۷ روز ▾]  │
│                                         │
│     ╭──╮                                │
│    ╱    ╲      ╭───                      │
│   ╱      ╲────╱                         │
│  ─────────────────────────────────      │
│  ش  ی  د  س  چ  پ  ج                    │
└─────────────────────────────────────────┘
```

| Token | مقدار |
|-------|-------|
| ارتفاع | 240px (sm) / 320px (lg) |
| خط | `stroke-width: 2.5`, `tension: 0.4` (منحنی نرم) |
| رنگ خط | گرادیان `#509EE3 → #7C6BF0 → #F472B6` |
| ناحیه زیر خط | `fill: brand/15%` |
| Grid | افقی فقط، `stroke: #E2E8F0`, بدون خط عمودی |
| محور | `text-caption text-tertiary` |
| Tooltip | `bg-[#2E3A4A] text-white rounded-pm-md px-3 py-2 text-body-sm` |

**کتابخانه پیشنهادی:** Chart.js یا Recharts

### ۶.۴ نمودار دونات (DonutChart)

```
┌─────────────────────────┐
│      ╭───────╮          │
│     │  وضعیت │         │
│     │  تسک‌ها  │         │
│      ╰───────╯          │
│  ● فعال  ● متوقف        │
│  ● انجام‌شده ● بک‌لاگ   │
└─────────────────────────┘
```

| Token | مقدار |
|-------|-------|
| اندازه | 180px |
| ضخامت | 28px |
| مرکز | عنوان `text-label` + عدد کل `text-metric-sm` |
| رنگ‌ها | status colors (سبز، کهربایی، خاکستری، نیلی) |
| Legend | افقی زیر نمودار، `text-caption` |

### ۶.۵ حلقه پیشرفت (ProgressRing)

```
    ╭────╮
   │ ۳۵٪ │   ← Feature Progress
    ╰────╯
```

| Token | مقدار |
|-------|-------|
| اندازه | 48px (لیست) / 64px (برجسته) |
| Track | `#EEF1F6`, stroke 4px |
| Progress | رنگ برند یا chart palette |
| متن مرکز | `text-caption font-medium` |
| انیمیشن | `stroke-dashoffset`, 600ms ease |

**کاربرد PM:** پیشرفت زیرپروژه، درصد تسک‌های انجام‌شده

### ۶.۶ نمودار میله‌ای (BarChart) — اختیاری

- میله‌های گرد (`borderRadius: 6`)
- فاصله بین میله‌ها: ۸px
- رنگ تک‌سری: `chart-1`؛ چندسری: palette کامل
- کاربرد: تسک‌های ایجادشده به تفکیک هفته

### ۶.۷ لیست + Progress (FeatureList)

```
┌──────────────────────────────────────────┐
│ [🟣]  طراحی UI          ╭───╮ ۴۰٪      │
│       صفحه ورود          ╰───╯          │
├──────────────────────────────────────────┤
│ [🔵]  API احراز هویت     ╭───╮ ۶۵٪      │
│       زیرپروژه بک‌اند      ╰───╯          │
└──────────────────────────────────────────┘
```

- ردیف: `flex items-center gap-4 py-3 border-b border-pm-border last:border-0`
- آیکون: مربع ۳۶px گرد، `bg-brand-subtle`
- عنوان: `text-title`
- زیرعنوان: `text-caption text-secondary`

### ۶.۸ تقویم (CalendarWidget)

```
┌─────────────────────────────────┐
│  تیر ۱۴۰۴              ‹  ›    │
│  ش  ی  د  س  چ  پ  ج           │
│        ۱  ۲  ۳  ۴  ۵  ۶        │
│  ۷  ۸ [۹] ۱۰ ۱۱ ۱۲ ۱۳          │
│     ┌──────┐                    │
│     │جلسه  │  ← tag صورتی       │
│     └──────┘                    │
└─────────────────────────────────┘
```

| عنصر | استایل |
|------|--------|
| کانتینر | `bg-surface rounded-pm-lg p-4` |
| روز جاری | `ring-2 ring-pm-brand rounded-pm-sm` |
| Tag رویداد | `rounded-full px-2 py-0.5 text-caption` + رنگ pastel |
| Tag نمونه | «روز آزاد» فیروزه‌ای، «ددلاین» صورتی، «جلسه» نارنجی |

**کاربرد PM:** due_date تسک‌های تکراری، یادآوری recurrence

### ۶.۹ چیدمان داشبورد (DashboardGrid)

```
┌────────┬────────┬────────┬────────┐
│ متریک  │ متریک  │ متریک  │ متریک  │  ← row 1: 4 col
├────────┴────────┼────────┴────────┤
│  نمودار خطی     │  دونات وضعیت    │  ← row 2: 8 + 4
├─────────────────┼─────────────────┤
│  تقویم          │  لیست پیشرفت   │  ← row 3: 5 + 7
└─────────────────┴─────────────────┘
```

```css
/* lg breakpoint */
.pm-dashboard-metrics { grid-column: span 3; }  /* 4 در ردیف */
.pm-dashboard-chart-main { grid-column: span 8; }
.pm-dashboard-chart-side { grid-column: span 4; }
.pm-dashboard-calendar { grid-column: span 5; }
.pm-dashboard-progress { grid-column: span 7; }
```

### ۶.۱۰ Chart Card (قاب مشترک همه نمودارها)

```jsx
<div className="rounded-pm-lg border border-pm-border bg-pm-bg-surface shadow-pm-sm">
  <div className="flex items-center justify-between border-b border-pm-border px-5 py-3">
    <h3 className="text-title text-pm-text-primary">تسک‌های تکمیل‌شده</h3>
    <select className="text-body-sm text-secondary"> {/* بازه زمانی */} </select>
  </div>
  <div className="p-5">
    {/* chart */}
  </div>
</div>
```

### ۶.۱۱ حالت‌های داده

| حالت | نمایش |
|------|--------|
| Loading | skeleton مستطیل با ارتفاع نمودار |
| Empty | آیکون + «داده‌ای برای نمایش نیست» |
| Error | banner قرمز ملایم + «تلاش مجدد» |
| Single point | نقطه بزرگ‌تر، بدون خط |

---

## ۷. آیکون‌ها

**کتابخانه:** Lucide React — stroke 1.5px

| کاربرد | آیکون | برچسب فارسی |
|--------|-------|-------------|
| امروز | `CalendarCheck` | امروز |
| پروژه‌ها | `FolderTree` | پروژه‌ها |
| تسک | `FileText` | تسک |
| پروژه | `Folder` | پروژه |
| جستجو | `Search` | جستجو |
| افزودن | `Plus` | افزودن |
| ذخیره | `Check` | ذخیره |
| حذف | `Trash2` | حذف |
| تنظیمات | `Settings` | تنظیمات |
| نمودار | `BarChart3` | آمار |
| تقویم | `Calendar` | تقویم |

**اندازه:** ۱۶ (inline) | ۱۸ (nav) | ۲۰ (button) | ۲۴ (empty)

---

## ۸. الگوهای صفحه

### ۸.۱ صفحه امروز
1. عنوان «امروز» + شمارش
2. Hero card برای تسک فعال (اگر وجود دارد)
3. Grid کارت‌های بقیه
4. Empty state

### ۸.۲ صفحه داشبورد / آمار
1. ردیف ۴ کارت متریک
2. نمودار خطی + دونات
3. تقویم + لیست پیشرفت

### ۸.۳ صفحه پروژه‌ها
1. درخت راست + پنل جزئیات چپ
2. ویرایشگر frontmatter + markdown + timeline
3. نوار پایین: حذف | ذخیره

### ۸.۴ جستجو
1. Dropdown زیر search
2. عنوان + مسیر + خط تطبیق
3. ناوبری کیبورد

---

## ۹. دسترسی‌پذیری

- کنتراست متن: ≥ 4.5:1
- Focus: `ring-2 ring-pm-brand ring-offset-2`
- `aria-label` فارسی برای دکمه‌های آیکون‌دار
- نمودارها: `aria-label` + جدول داده پنهان برای screen reader
- `prefers-reduced-motion`: بدون انیمیشن نمودار

---

## ۱۰. اسکرول‌بار

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 10px;
}
```

---

## ۱۱. فهرست کامپوننت‌های UI Kit

```
ui/
├── tokens/
│   ├── colors.css
│   └── typography.css
├── primitives/
│   ├── Button.jsx
│   ├── Badge.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   └── Skeleton.jsx
├── layout/
│   ├── AppShell.jsx
│   ├── Sidebar.jsx
│   └── TopBar.jsx
├── charts/
│   ├── ChartCard.jsx
│   ├── MetricCard.jsx
│   ├── LineChart.jsx
│   ├── DonutChart.jsx
│   ├── ProgressRing.jsx
│   ├── BarChart.jsx
│   ├── CalendarWidget.jsx
│   └── FeatureList.jsx
└── patterns/
    ├── TaskCard.jsx
    ├── StatusBadge.jsx
    ├── PriorityBadge.jsx
    ├── TreeNode.jsx
    └── LogTimeline.jsx
```

---

## ۱۲. تصمیم‌های نهایی (ثبت‌شده)

| مورد | انتخاب |
|------|--------|
| زبان | فارسی RTL |
| فونت | Vazirmatn |
| رنگ برند | `#7C6BF0` |
| Dark mode | خارج از scope v1 |
| نمودارها | بله — بخش ۶ |

---

*PM UI Kit v1.0 — فارسی / RTL / بنفش #7C6BF0*
