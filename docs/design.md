# Product & UI/UX Design

## 1. Design objective

Design a focused work-management tool that feels like a professional internal product: fast to scan, predictable to operate, and visually distinct through typography, spacing and hierarchy rather than decorative effects.

The primary interaction loop is:

`Choose project → scan work → open issue → act → return to board/list`

The interface must optimize that loop.

## 2. Information architecture

```text
Public
├── Login
├── Register
├── Forgot password
└── Reset password

Authenticated
├── Dashboard
│   ├── Recent projects
│   └── Assigned/open work summary
├── Projects
│   ├── Project list
│   └── Project
│       ├── Board
│       ├── Issues / List
│       ├── Members
│       └── Settings
├── Issue detail
└── Account
    ├── Profile
    └── Security
```

## 3. Application shell

### Desktop

- Left sidebar: product identity, project switcher, project navigation, account area.
- Main workspace: page title, contextual actions, content.
- Optional right-side issue detail drawer for board/list interactions.

### Tablet

- Collapsible sidebar.
- Keep project navigation accessible without consuming permanent width.

### Mobile

- Sidebar becomes a sheet/drawer.
- Board uses horizontally scrollable columns.
- Issue detail is a full-screen sheet/page rather than a narrow desktop modal.
- Dense tables can switch to stacked issue rows/cards while preserving key fields.

## 4. Core screens

### 4.1 Dashboard

Purpose: answer “What do I need to work on?” within a few seconds.

Content:

- recent projects;
- assigned open issues;
- overdue issues;
- recently updated issues;
- lightweight counts, not decorative KPI cards.

Avoid a wall of statistics when the user primarily needs work items.

### 4.2 Project board

The board is the main work surface.

Header:

- project name;
- board/list toggle;
- search;
- filter control;
- sort control;
- create issue button;
- member/avatar affordance.

Columns:

`To do | In progress | In review | Done`

Issue card:

- issue identifier;
- title;
- priority indicator;
- due-date state if relevant;
- assignee avatar/name;
- labels;
- subtle interaction affordance.

Do not put every field on every card. The board is for scanning; the issue detail view is for complete context.

### 4.3 Issue detail

Use a side drawer on desktop where it helps users preserve board context. Use a full page or full-screen sheet on mobile.

Structure:

```text
Issue ID + status + overflow actions
Title
Description
Metadata rail / grid
    Assignee
    Priority
    Due date
    Labels
Activity
    Comments
    Attachments
```

Destructive actions are separated from routine edits and require confirmation.

### 4.4 List view

Use a dense, readable table for comparison.

Columns:

`ID | Title | Status | Priority | Assignee | Due | Updated`

The table must support keyboard navigation and preserve filter/sort state in the URL.

### 4.5 Members

Show:

- avatar/initials;
- name;
- email where appropriate;
- project role;
- membership date;
- owner/member management actions when authorized.

Invitation UI should make the pending/accepted state explicit.

## 5. Interaction rules

### Buttons

Use semantic hierarchy:

- primary: one main action per surface;
- secondary: common non-destructive alternatives;
- ghost: low-emphasis contextual actions;
- destructive: red semantic action, normally separated from routine actions.

Avoid making every action a filled button.

### Dialog vs drawer vs page

Use a modal dialog for:

- destructive confirmation;
- short contextual forms;
- decisions that block the underlying task.

Use a drawer/sheet for:

- issue detail;
- contextual forms that benefit from preserving the underlying board/list.

Use a page for:

- settings;
- member management;
- workflows users may want to link/bookmark;
- large multi-step content.

21st.dev's current guidance similarly separates dialogs, drawers and pages by interruption and information depth. citeturn207394search10

## 6. Kanban interaction contract

A drag operation is not complete merely because the card visually moved.

Required behavior:

1. pointer users can drag and drop;
2. keyboard users can focus an issue, press Space/Enter to pick it up, move with arrows, and drop/cancel;
3. movement is announced accessibly;
4. optimistic movement can render immediately;
5. server rejection rolls the card back and explains the failure;
6. stale updates do not silently overwrite newer server state.

21st.dev's Kanban guidance highlights keyboard, touch, announcement and server-rejection concerns as part of a finished board rather than optional polish. citeturn207394search5

## 7. Search/filter design

Search is not the same as command palette:

- search filters issue data;
- command palette triggers actions/navigation.

The issue list search input should:

- update the URL;
- debounce request dispatch, not merely keystroke state;
- show result counts when available;
- preserve focus;
- expose loading/empty/error states.

Add a command palette only when the action set has enough depth to justify it. 21st.dev's current guidance makes the same distinction between action palettes and ordinary filtering. citeturn207394search2

## 8. Visual language

### Direction: “Editorial workbench”

- background: soft warm neutral / off-white in light mode;
- surfaces: near-white with subtle borders;
- text: deep graphite;
- accent: controlled cobalt/indigo for primary interaction;
- danger: semantic red only;
- success: semantic green only;
- warning: amber only where meaning requires it.

No rainbow palette. No gradient text. No oversized decorative blobs.

### Typography

- UI/body: Geist or a comparable neutral grotesk sans-serif;
- compact metadata/IDs: a restrained monospace face where useful;
- title sizes are moderate and hierarchy-driven, not landing-page scale.

### Shape

- default radius: 8–10 px;
- larger panels: 12–14 px;
- pills only for tags, statuses and compact metadata;
- no excessive “rounded everything” treatment.

### Shadows

Use subtle elevation only for transient layers such as popovers, sheets and drag previews. Most persistent surfaces use borders and contrast instead of shadows.

## 9. Motion

Motion communicates state:

- list/board insertion and removal: short ease-out;
- drawer: fast slide + fade;
- drag preview: slight lift, not exaggerated scaling;
- success feedback: brief confirmation;
- page transitions: restrained.

Avoid:

- perpetual background animations;
- bouncing cards;
- cursor-following decorations;
- animated gradients;
- animation on every hover.

Respect `prefers-reduced-motion` and provide equivalent non-animated state changes.

React 19.3 now exposes stable View Transition support, so it can be considered later for carefully selected navigation/state transitions rather than becoming a blanket animation layer. citeturn175600search1

## 10. Accessibility states

Every interactive component must account for:

```text
Default
Hover
Focus-visible
Active/pressed
Disabled
Loading
Success
Error
Empty
Permission denied
```

Every async mutation should have:

- disabled/processing affordance;
- non-blocking feedback where possible;
- recoverable error state;
- no loss of entered data where practical.

## 11. Empty/error/loading states

### Empty

Explain:

1. what is empty;
2. why it may be empty;
3. the primary next action.

Example: “No issues match these filters” + “Clear filters”.

### Loading

Use skeletons for page-level data when layout is known; use inline spinners for individual actions. Avoid fake data that shifts layout.

### Error

Tell the user what failed and what they can do next. Never expose stack traces or internal database details.

## 12. Responsive breakpoints

Use content-driven breakpoints rather than blindly optimizing around device brands.

The board must remain operable when columns become horizontally scrollable. The sidebar and filters must collapse before the main work surface becomes cramped.

## 13. UX anti-patterns explicitly banned

- generic SaaS landing page as the main app shell;
- giant hero headline inside the dashboard;
- glassmorphism everywhere;
- neon/glowing borders;
- excessive gradient backgrounds;
- 10+ KPI cards above actual work;
- emoji as the main iconography;
- inconsistent icon families;
- hover-only actions that are inaccessible on keyboard/touch;
- nested modals for routine editing;
- arbitrary animations on every element;
- dark mode implemented as an afterthought;
- “AI assistant” features added purely to make the portfolio look AI-oriented.

## 14. Design approval gate

Before frontend implementation starts, verify:

- every page has a clear primary job;
- navigation works without decorative elements;
- board/list/detail relationships are coherent;
- all required states are mapped;
- mobile behavior is defined;
- tokens are centralized;
- 21st.dev components selected for reuse do not introduce a second visual language.
