# 21st.dev + UI/UX Pro Max Workflow

## Purpose

Use external component inspiration without allowing generated UI to drift into generic AI-generated SaaS aesthetics.

## Ground rules

1. Read `design-system/MASTER.md` before selecting a component.
2. Use UI/UX Pro Max reasoning to evaluate hierarchy, density, accessibility, interaction and responsive behavior.
3. Search 21st.dev for a focused component instead of asking for an entire application.
4. Prefer shadcn-compatible/source-owned components so the code becomes part of the repo.
5. Adapt the component to our tokens instead of importing its entire aesthetic.
6. Do not introduce a second button, dialog, badge, icon or spacing system merely because a copied component brings one along.
7. Build the product surface first; decorative motion is last.

## 21st.dev component targets

### Kanban

Use the Kanban collection to inspect board/card interaction patterns. Pick one component as a starting point and adapt it; do not assemble a board from unrelated examples. 21st.dev currently has dedicated Kanban components for React/Next.js. citeturn207394search1

### Data tables

Inspect the React data-table collection for filtering/table patterns. Keep the final table consistent with our token system. citeturn207394search4

### Command palette

Only use a command palette if the app has enough global actions/navigation to justify it. 21st.dev's recent guidance distinguishes action palettes from ordinary search/filter inputs. citeturn207394search2

### Sidebar / shell

Use sidebar/shadcn patterns as structural references, not as a visual identity. citeturn207394search8

### Dialog / drawer

Choose based on interruption depth. Destructive confirmations are dialogs; persistent contextual content should normally be a drawer or page. citeturn207394search10

## Prompt: generate a dashboard component

```text
You are designing one production UI component for a professional task-management application.

Read first:
- design-system/MASTER.md
- docs/design.md
- the existing component conventions in the repository

Product context:
- lightweight Jira/Trello-style task management
- primary task: scanning and updating project work
- users are developers/team members, so information density matters

Visual direction:
- editorial workbench
- calm neutral surfaces
- controlled cobalt/indigo accent
- strong typography hierarchy
- restrained borders
- subtle elevation only for transient UI

Explicitly avoid:
- glassmorphism
- glowing/neon borders
- animated gradients
- giant hero sections
- excessive rounded cards
- arbitrary 3D decoration
- emoji as primary icons
- excessive motion
- generic “AI SaaS” visuals

Interaction requirements:
- keyboard accessible
- visible focus states
- loading, empty, error, disabled and permission-denied states
- reduced-motion behavior
- mobile/tablet behavior is defined

Use 21st.dev only as a source of implementation patterns. Adapt the selected component to the local design system instead of copying its theme.

Return:
1. the component structure;
2. interaction/state specification;
3. implementation code only after the structure is clear.
```

## Prompt: review an existing component

```text
Review this component against:

- docs/design.md
- design-system/MASTER.md
- accessibility requirements
- responsive behavior
- interaction consistency
- maintainability

Look specifically for:
- AI-slop visual patterns
- unnecessary decoration
- inconsistent spacing/radius/iconography
- missing keyboard/focus behavior
- missing loading/error/empty states
- misleading disabled states
- excessive component abstraction
- state that should come from the server instead of local duplication

Do not rewrite unrelated code. Identify the smallest set of changes that materially improves the component.
```

## Component selection checklist

```text
[ ] Does the component solve a real interaction problem?
[ ] Is it compatible with our React/shadcn/Tailwind stack?
[ ] Can we understand and maintain its code?
[ ] Can we map its tokens to MASTER.md?
[ ] Does it have keyboard/focus behavior?
[ ] Does mobile behavior make sense?
[ ] Can reduced-motion behavior be implemented?
[ ] Is it worth the added dependency or code size?
```

## What “modern” means for this project

Modern means:

- clear hierarchy;
- responsive composition;
- strong interaction feedback;
- polished empty/loading/error states;
- accessible motion;
- good typography;
- coherent tokens;
- fast task completion.

It does **not** mean adding every visual trend available in a component registry.
