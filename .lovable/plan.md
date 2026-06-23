## Goal Management & Emotional Tracking Dashboard — Frontend Only

A clean, Linear/Asana-style enterprise SaaS UI. White background, neutral grays, a single restrained accent (indigo), generous spacing, modern card layouts. No backend, no auth, no Cloud — purely static mock JSON.

### Design system (src/styles.css)
- White background, near-black text, subtle borders, soft shadows.
- Accent: indigo (`--primary`); status tokens for success/warning/danger/info used by badges and chart series.
- Typography: Inter (loaded via `<link>` in `__root.tsx`), tight tracking on headings.
- Reusable shadcn primitives (Card, Table, Tabs, Badge, Button, Input, Select, Drawer/Sheet, Progress, Avatar, Separator, ScrollArea).

### Layout
- `src/routes/__root.tsx` wraps everything in `SidebarProvider` with a persistent left sidebar + top bar (search, notifications icon, avatar).
- `AppSidebar` with 9 nav items: Dashboard, Organization Goals, SMART Goals, Action Plans, Challenges, Solutions, Emotional Tracking, Reports, Settings.
- Collapsible to icon mode; active route highlighting via `useRouterState`.

### Routes (file-based)
```
src/routes/
  __root.tsx              shell + sidebar
  index.tsx               Executive Dashboard
  organization-goals.tsx  Goals table + filters + detail Sheet
  smart-goals.tsx         Kanban (4 columns)
  action-plans.tsx        Tabs: List view + Board view
  challenges.tsx          Issue list with severity/status
  solutions.tsx           Solution repository cards/table
  goals.$goalId.tsx       Goal Detail (hierarchy + timeline)
  emotional-tracking.tsx  5 trend charts
  reports.tsx             Placeholder report cards + charts
  settings.tsx            Static settings panels (profile, workspace, notifications)
```

### Page details

1. **Executive Dashboard** — 6 KPI cards (Total Org Goals, SMART Goals, Open Action Items, Challenges Raised, Solutions Implemented, Goal Completion %) with delta indicators. Charts (Recharts): Goal Progress Overview (stacked bar by status), Department Goal Progress (horizontal bar), Monthly Achievement Trend (area), Challenge vs Solution (line/dual-bar). Recent Activity feed on the right.

2. **Organization Goals** — Data table with search input, status/owner filters, sortable columns, progress bar cell, status badge. Row click opens a right-side Sheet drawer with goal details and a link to the full Goal Detail page.

3. **SMART Goals** — 4-column Kanban (Not Started, In Progress, At Risk, Completed). Cards show title, owner avatar, due date, progress %.

4. **Action Plans** — Tabs switching List view (table with Task, Assigned To, Priority, Due Date, Status, Progress) and Board view (Kanban by status).

5. **Challenges** — Table/list of issues; severity badges (Low/Medium/High/Critical), status tabs (Open / Investigating / Resolved), related goal link.

6. **Solutions** — Card grid of solutions with title, related challenge, impact score (1–10 stars/bar), status badge.

7. **Goal Detail** (`/goals/$goalId`) — Header with KPI summary, progress timeline (Recharts line), goal tree visualization (nested cards: Org Goal → SMART Goals → Action Items → Challenges → Solutions), activity history feed.

8. **Emotional Tracking** — 5 trend charts only (Emotional Score, Motivation, Energy, Focus, Confidence) using line/area charts plus a combined overview radar/multi-line. No journaling UI.

9. **Reports** + **Settings** — Reports: grid of saved-report cards with mini-charts. Settings: static tabs (Profile, Workspace, Notifications, Billing).

### Mock data
`src/lib/mock-data.ts` exports typed arrays: `organizationGoals`, `smartGoals`, `actionItems`, `challenges`, `solutions`, `activities`, `departmentProgress`, `monthlyTrend`, `emotionalTrends`. Shared types in `src/lib/types.ts`. All pages import from these — no fetches.

### Reusable components (src/components/)
- `app-sidebar.tsx`, `top-bar.tsx`
- `kpi-card.tsx`, `status-badge.tsx`, `priority-badge.tsx`, `progress-bar.tsx`
- `kanban-board.tsx` + `kanban-card.tsx` (used by SMART Goals and Action Plans board)
- `activity-feed.tsx`, `goal-tree.tsx`, `section-header.tsx`
- `charts/` wrappers for Recharts (AreaTrend, StackedBar, HorizontalBar, DualLine) using semantic color tokens.

### Technical notes
- All colors via semantic tokens in `src/styles.css` (`oklch`); no hardcoded hex in components.
- Each route defines its own `head()` with title + description.
- `recharts` added via `bun add recharts`.
- No `useEffect`+fetch; data imported directly. No server functions, no Cloud.
- `sitemap.xml` + `robots.txt` added per template convention.
