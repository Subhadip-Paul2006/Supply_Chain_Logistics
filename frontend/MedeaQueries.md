# 📱 R3FLEX — Master Prompt: Mobile Responsiveness via Media Queries

> **Purpose:** This document is a master prompt for an AI coding agent (Claude, Copilot, Cursor, etc.) to make the entire R3FLEX Next.js frontend fully mobile-responsive. The agent must edit **existing files only** — no new files, no new components. Every page must look correct and polished on mobile screens (320px–768px).

---

## 🧠 Project Context (Read Before You Write a Single Line)

**Project Name:** R3FLEX  
**Product:** Agentic supply-chain intelligence platform — detects disruption, simulates rerouting scenarios, and executes decisions autonomously.  
**Frontend Stack:** Next.js 14+ App Router · TypeScript · Tailwind CSS · Custom CSS variables in `globals.css`  
**Design Aesthetic:** Dark, command-center / war-room UI. Think Bloomberg terminal meets SpaceX mission control. Deep blacks, amber/red alert accents, monospace data readouts.

### Pages & Routes
| Route | File | Description |
|---|---|---|
| `/` | `frontend/app/page.tsx` | Landing page — ScrollGlobe + sections |
| `/login` | `frontend/app/login/page.tsx` | Auth login form |
| `/signup` | `frontend/app/signup/page.tsx` | Auth signup form |
| `/dashboard` | `frontend/app/dashboard/page.tsx` | Main ops dashboard |
| `/pricing` | `frontend/app/pricing/page.tsx` | Pricing tiers |

### Key Component Files (Edit, Don't Create)
```
frontend/
├── app/
│   ├── globals.css              ← Global CSS vars + base styles (PRIMARY TARGET)
│   ├── layout.tsx               ← Root layout
│   ├── page.tsx                 ← Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── dashboard/page.tsx
│   └── pricing/page.tsx
└── components/
    └── landing/
        ├── scroll-globe.tsx     ← 3D globe + scroll-driven sections (COMPLEX)
        ├── site-header.tsx      ← Top nav with logo + CTA buttons
        ├── site-footer.tsx      ← Footer links
        ├── activity-ticker.tsx  ← Live scrolling event feed
        └── dual-marquee.tsx     ← Two-row scrolling marquee band
    └── dashboard/               ← Dashboard widgets, modals, maps
```

---

## 🎯 Core Directive

**You are adding mobile responsiveness to every existing file in `frontend/`. You must:**

1. **Edit existing files only.** Do not create new files or new components.
2. **Use Tailwind CSS responsive prefixes** (`sm:`, `md:`, `lg:`) as the primary mechanism — inline in JSX className props, exactly where existing classes already live.
3. **Supplement with CSS media queries in `globals.css`** only for elements that cannot be addressed via Tailwind (e.g., complex animations, 3D transforms, canvas sizing, absolute-positioned overlays).
4. **Mobile-first approach**: Start from the smallest screen and scale up. If a class works on mobile, it's the default. Desktop overrides use `lg:` or `md:` prefixes.
5. **Do NOT remove or rename any existing Tailwind classes** that are desktop-only. Prepend the correct responsive prefix instead of replacing.
6. **Preserve all animations and interactive behavior.** Only adjust size, layout, spacing, and font scale — not logic, not transitions, not color.
7. **Test every page against these widths:** 320px (iPhone SE), 375px (iPhone 14), 390px (iPhone 15 Pro), 430px (iPhone 15 Plus), 768px (iPad portrait).

---

## 📐 Breakpoint Reference

Use these Tailwind breakpoints throughout. Never invent custom ones.

| Prefix | Min-width | Target Devices |
|---|---|---|
| *(none)* | 0px | All phones (320–767px) — **DEFAULT** |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets (iPad portrait) |
| `lg:` | 1024px | Tablets landscape, small laptops |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

---

## 🔧 File-by-File Instructions

---

### 1. `frontend/app/globals.css` — Global Base Styles

**What to add/edit:**

Add a `/* ===== MOBILE RESPONSIVE ===== */` section at the bottom of the file (do not restructure the existing CSS).

```css
/* ===== MOBILE RESPONSIVE ===== */

/* Prevent horizontal scroll on all screens */
html, body {
  overflow-x: hidden;
  -webkit-text-size-adjust: 100%;
}

/* Globe canvas: shrink on mobile */
@media (max-width: 767px) {
  canvas {
    max-width: 100vw !important;
    max-height: 60vw !important;
  }
}

/* Ticker: reduce font size and padding on mobile */
@media (max-width: 767px) {
  .ticker-item {
    font-size: 0.75rem;
    padding: 0 0.75rem;
  }
}

/* Marquee: slow down slightly on very small screens */
@media (max-width: 480px) {
  .marquee-track {
    animation-duration: 35s;
  }
}

/* Dashboard map: set a minimum readable height */
@media (max-width: 767px) {
  .map-container {
    min-height: 240px !important;
    height: 240px !important;
  }
}

/* Audit trail table: make scrollable horizontally on mobile */
@media (max-width: 767px) {
  .audit-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .audit-table-wrapper table {
    min-width: 600px;
  }
}

/* Approval modal: full screen on mobile */
@media (max-width: 767px) {
  .approval-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    border-radius: 0 !important;
    position: fixed !important;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow-y: auto;
  }
}
```

**Rules:**
- All class names used here (`.ticker-item`, `.map-container`, etc.) must match the actual class names already in the component files. Audit the components first — adjust these names to match reality.
- Do not touch CSS custom properties (`:root` variables).

---

### 2. `frontend/components/landing/site-header.tsx` — Navigation Header

**Problem to solve:** The header likely has a logo + nav links + CTA buttons in a horizontal row. On mobile, this overflows or gets too crowded.

**What to do:**

- **Logo:** Keep visible at all sizes. If text-based, reduce `text-xl` → `text-base` on mobile.
- **Nav links (desktop):** Hide them on mobile with `hidden md:flex` (or `hidden md:block`). They are not needed on mobile since pages are accessible from CTAs.
- **CTA buttons ("Start free trial", "View pricing"):** On mobile, collapse to a single icon-only or short-label button, OR stack them. Reduce padding: `px-6 py-3` → `px-3 py-2 text-sm`.
- **Add a mobile hamburger menu toggle** using only existing state logic (if no state exists, add a `useState` hook for `isMenuOpen` — this IS allowed as it's editing the existing file). When open, show nav links in a vertical dropdown below the header.
- **Header container:** Change `px-8` or `px-12` → `px-4` on mobile. Ensure `max-w-screen-xl mx-auto` is present.

**Tailwind pattern:**
```tsx
// Nav links — hidden on mobile, flex on md+
<nav className="hidden md:flex items-center gap-6">
  ...links...
</nav>

// Hamburger — visible on mobile only
<button className="flex md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
</button>

// Mobile dropdown menu
{isMenuOpen && (
  <div className="absolute top-full left-0 right-0 bg-background border-t border-border flex flex-col p-4 gap-4 md:hidden z-50">
    ...same nav links stacked vertically...
  </div>
)}
```

---

### 3. `frontend/components/landing/scroll-globe.tsx` — 3D Globe + Scroll Sections

This is the most complex component. It drives the entire landing page scroll experience.

**Problems to solve:**
- The globe is likely rendered at a fixed large size (e.g., `w-[600px] h-[600px]`). On mobile this overflows.
- Section text overlays may use absolute positioning that breaks on small screens.
- Two-column layouts (text left, globe right) need to stack vertically.

**What to do:**

**Globe sizing:**
```tsx
// Replace fixed size with responsive sizing
// Before: className="w-[600px] h-[600px]"
// After:
className="w-[80vw] h-[80vw] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px]"
```

**Section layout:** Each section likely has a grid or flex layout. Force stack on mobile:
```tsx
// Before: className="grid grid-cols-2 gap-12"
// After:
className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12"
```

**Section text:**
```tsx
// Headings
className="text-4xl lg:text-6xl xl:text-7xl font-bold"
// Body text
className="text-sm md:text-base lg:text-lg"
// Padding/margin
className="px-4 md:px-8 lg:px-16 py-12 md:py-24"
```

**Feature cards (3-column grid on desktop):**
```tsx
// Before: className="grid grid-cols-3 gap-6"
// After:
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
```

**Section with `align: "center"`:** Keep centered, but reduce font sizes on mobile.

**Action buttons row:**
```tsx
// Before: className="flex gap-4"
// After:
className="flex flex-col sm:flex-row gap-3 sm:gap-4"
```

---

### 4. `frontend/components/landing/site-footer.tsx` — Footer

**What to do:**

- Footer columns (likely 3–5 columns): Stack to single column on mobile.
```tsx
// Before: className="grid grid-cols-4 gap-8"
// After:
className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
```
- Bottom bar (logo + legal links + socials): Stack vertically on mobile.
```tsx
// Before: className="flex items-center justify-between"
// After:
className="flex flex-col sm:flex-row items-center justify-between gap-4"
```
- Reduce footer padding: `py-16 px-8` → `py-10 px-4 md:px-8 md:py-16`

---

### 5. `frontend/components/landing/activity-ticker.tsx` — Live Event Ticker

**What to do:**

- The ticker is likely a full-width scrolling bar. It works fine on mobile but may have font/padding issues.
- Reduce item font size on mobile: add `text-xs md:text-sm` to each ticker item.
- Reduce item padding: `px-6` → `px-3 md:px-6`.
- Ensure the outer wrapper has `overflow-hidden` and `w-full` — add if missing.
- Do NOT change animation speed or logic.

---

### 6. `frontend/components/landing/dual-marquee.tsx` — Dual Marquee Band

**What to do:**

- Marquee items are likely tech logos or text badges in two rows scrolling in opposite directions.
- Reduce item height/padding on mobile: wrap existing classes with mobile overrides.
- If items have `h-16` fixed height, change to `h-10 md:h-16`.
- Ensure the section has `overflow-hidden` to prevent horizontal bleed.
- Gap between items: `gap-8` → `gap-4 md:gap-8`.

---

### 7. `frontend/app/login/page.tsx` & `frontend/app/signup/page.tsx` — Auth Pages

**What to do:**

Auth pages are typically simpler (a centered card with a form).

- Card container: On mobile, remove rounded corners and max-width, go full-screen.
```tsx
// Before: className="max-w-md mx-auto rounded-xl p-8"
// After:
className="w-full max-w-md mx-auto rounded-none sm:rounded-xl p-6 sm:p-8"
```
- Input fields: Ensure `w-full` is set on all inputs.
- Button: Ensure `w-full` on mobile: add `w-full sm:w-auto` if it wasn't full-width.
- Logo/branding area above the form: Stack vertically, center text on mobile.
- Reduce heading: `text-3xl` → `text-2xl md:text-3xl`

---

### 8. `frontend/app/dashboard/page.tsx` — Operations Dashboard

This is the most feature-dense page. It has a world map, disruption cards, scenario panels, an approval modal, and an audit trail table.

**Layout grid:**
```tsx
// Main dashboard grid — sidebar + main content
// Before: className="grid grid-cols-[280px_1fr]"
// After:
className="grid grid-cols-1 lg:grid-cols-[280px_1fr]"
```

**Sidebar:** On mobile, the sidebar should collapse. If there's a sidebar:
- Default: `hidden` on mobile, shown via a slide-in when toggled.
- Add a hamburger/menu button in the dashboard header (mobile only): `className="flex lg:hidden"`.

**Stat/metric cards row (top of dashboard):**
```tsx
// Before: className="grid grid-cols-4 gap-4"
// After:
className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
```

**World Map panel:** Map must be responsive in height.
```tsx
// Before: className="h-96" or a fixed pixel height
// After:
className="h-48 sm:h-64 md:h-80 lg:h-96"
```
Add the `.map-container` CSS class to the map wrapper div so the `globals.css` media query can control it as backup.

**Disruption event list / cards:** Stack cards single column on mobile.
```tsx
className="flex flex-col gap-3 md:gap-4"
```

**Scenario option cards (3 options):**
```tsx
// Before: className="grid grid-cols-3 gap-4"
// After:
className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4"
```

**Approval Modal:** On mobile, the modal should be fullscreen.
- Add `approval-modal` class to the modal wrapper div.
- Inside the modal, stack the option comparison columns vertically:
```tsx
// Before: className="grid grid-cols-3 gap-4"
// After:
className="grid grid-cols-1 sm:grid-cols-3 gap-4"
```
- Approve/reject buttons: `w-full sm:w-auto`.

**Audit Trail Table:** Wrap the table in a div with `overflow-x-auto audit-table-wrapper`. The table itself must keep its column structure — horizontal scrolling is the correct mobile behavior for data tables, not wrapping.

**Dashboard header/topbar:** Similar to site-header.
```tsx
// Reduce padding on mobile
className="px-4 md:px-6 py-3 md:py-4"
```

---

### 9. `frontend/app/pricing/page.tsx` — Pricing Page

**What to do:**

- Pricing card grid:
```tsx
// Before: className="grid grid-cols-3 gap-6"
// After:
className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
```
- Pricing hero text: Scale down headings.
```tsx
className="text-3xl md:text-5xl font-bold"
```
- Feature comparison table (if present): Wrap in `overflow-x-auto`. Add `min-w-[640px]` to the table.
- CTA button in each card: `w-full`.
- Page padding: `px-4 md:px-8 lg:px-16`.

---

## ⚠️ Do-Not-Break Rules

These are non-negotiable constraints. Violating them breaks the product.

| Rule | Reason |
|---|---|
| Do NOT remove any existing CSS custom properties in `globals.css` | Breaks the entire theme |
| Do NOT change any color classes | Preserves brand identity |
| Do NOT alter animation `keyframes` or `transition` properties | Breaks the live-feeling UI |
| Do NOT change the WebSocket/data logic in dashboard components | Breaks real-time event streaming |
| Do NOT add `overflow: hidden` to `body` permanently | Breaks scroll behavior |
| Do NOT change the globe's `three.js` / canvas render logic | Breaks 3D rendering |
| Do NOT rename or restructure component exports | Breaks import chains |
| Do NOT add new component files | Scope creep — edit only |

---

## ✅ Quality Checklist (Verify Before Done)

After making all edits, verify each item:

- [ ] **No horizontal scroll** on any page at 375px width
- [ ] **SiteHeader** shows hamburger menu on mobile, nav links hidden
- [ ] **Landing hero** globe is not overflowing viewport on iPhone 14
- [ ] **Landing sections** text is readable (min 14px, line-height ≥ 1.5)
- [ ] **Login/Signup** forms are full-width on mobile, inputs are tap-friendly (min 44px height)
- [ ] **Dashboard stat cards** show in a 2-column grid on mobile (not 4)
- [ ] **Dashboard map** does not collapse to 0 height
- [ ] **Approval modal** is fullscreen on mobile with scrollable content
- [ ] **Audit table** scrolls horizontally — does not wrap text or break layout
- [ ] **Pricing cards** stack single-column on mobile
- [ ] **Footer** columns collapse to 2-column grid on mobile
- [ ] **All buttons** have minimum tap target of 44×44px
- [ ] **All interactive elements** are reachable without horizontal scrolling

---

## 🔁 Execution Order

Work in this sequence for minimum risk:

1. `globals.css` — Add the mobile CSS block at the bottom
2. `site-header.tsx` — Mobile nav (hamburger)
3. `site-footer.tsx` — Column stacking
4. `scroll-globe.tsx` — Globe sizing + section layouts
5. `activity-ticker.tsx` — Font/padding adjustments
6. `dual-marquee.tsx` — Item sizing
7. `login/page.tsx` + `signup/page.tsx` — Form layout
8. `pricing/page.tsx` — Card grid + table
9. `dashboard/page.tsx` — Full dashboard mobile layout (most complex, do last)

---

## 💡 Tailwind Shorthand Reference

Common patterns you will use repeatedly:

```tsx
// Stack on mobile, row on desktop
className="flex flex-col sm:flex-row"

// Single column on mobile, N columns on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Show only on desktop
className="hidden lg:block"

// Show only on mobile
className="block lg:hidden"

// Responsive text
className="text-2xl md:text-4xl lg:text-6xl"

// Responsive padding
className="p-4 md:p-6 lg:p-10"

// Full width on mobile, auto on desktop
className="w-full sm:w-auto"

// Responsive gap
className="gap-3 md:gap-6 lg:gap-8"
```

---

## 📎 Notes for the AI Agent

- The project uses **pnpm** (`pnpm dev`, `pnpm build`). Lint with `pnpm lint`.
- Supabase auth is wired to `/login` and `/signup`. Do not touch any `useSupabase` or `createClient` calls.
- The dashboard receives live disruption data over WebSocket. The WebSocket hook is in `frontend/hooks/`. Do not touch hooks files.
- If a component uses `framer-motion`, wrap animated elements in `<AnimatePresence>` appropriately when conditionally rendering the mobile menu.
- If you see `cn()` or `clsx()` utility usage in className props, use the same utility — do not mix approaches.
- The globe (`scroll-globe.tsx`) likely uses `@react-three/fiber` or a direct Three.js canvas. If the canvas has a hardcoded `width`/`height` prop, add a `useEffect` + `resize observer` to make it reactive — this is an allowed in-file edit.

---

*Last updated: April 2026 · R3FLEX Frontend Responsiveness Initiative*
