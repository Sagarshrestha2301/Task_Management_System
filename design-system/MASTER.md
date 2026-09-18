# Task Management System — Master Design System

This file is the visual source of truth. Components imported from 21st.dev must be adapted to these rules.

## Product personality

**Editorial Workbench**

Precise, calm, dense where useful, human, and slightly distinctive through typography and spacing.

## Typography

Primary: `Geist`, fallback `Inter`, system sans-serif.

Metadata/IDs: `JetBrains Mono`, monospace.

Rules:

- do not use more than two typefaces;
- use weight and spacing for hierarchy before increasing font size;
- avoid oversized dashboard headings.

## Color roles

Use semantic tokens rather than raw colors in components.

```text
background      = warm neutral
surface         = near-white
surface-muted   = light neutral
text            = deep graphite
text-muted      = medium graphite
border          = subtle neutral
accent          = controlled cobalt/indigo
accent-soft     = low-opacity accent
success         = semantic green
danger          = semantic red
warning         = semantic amber
focus           = accent-derived ring
```

Dark mode uses the same semantic roles, not a separate visual language.

## Spacing

Base rhythm: 4px.

Preferred spacing steps: 4, 8, 12, 16, 20, 24, 32, 40, 48.

Dense data surfaces may use 8–12px internal gaps; do not compress interactive targets below accessible touch/keyboard sizes.

## Radius

```text
sm  = 6px
md  = 10px
lg  = 14px
full = pill-only
```

## Components

### Buttons

- one primary action per major surface;
- secondary and ghost actions for alternatives;
- destructive actions visually and spatially separated.

### Cards

Use cards where grouping adds meaning. Do not wrap every element in a floating card.

### Badges

Use for:

- status;
- priority;
- labels;
- compact state.

Color must not be the only distinction.

### Inputs

- visible label;
- helper/error text close to the field;
- clear focus ring;
- disabled/loading state;
- preserve user input on recoverable server errors.

### Dialogs

Use for decisions and short contextual forms.

### Sheets/drawers

Use for issue detail and contextual workflows that benefit from preserving board/list context.

### Tables

Prioritize scanability. Do not force every record property into a visible column.

### Kanban

Cards remain visually compact. Drag handles and keyboard affordances must be discoverable.

## Motion

- short, purposeful transitions;
- no persistent decorative animation;
- reduced-motion alternative required;
- drag preview is restrained.

## Icons

Use one icon family consistently. Default: Lucide.

Icons should communicate actions, not replace labels for unfamiliar operations.

## Accessibility

Target WCAG 2.2 AA behavior.

Minimum requirements:

- visible `:focus-visible`;
- semantic button/link elements;
- dialog focus trap and restoration;
- keyboard-accessible board movement;
- live-region announcements for meaningful async state changes;
- contrast reviewed by semantic token, not by eye alone.

## Prohibited visual patterns

```text
glassmorphism-everywhere
neon-glow-borders
animated-gradient-backgrounds
huge-hero-dashboard
excessive-rounded-cards
random-mixed-icon-families
emoji-as-interface-icons
3D-decoration-without-product-purpose
animation-on-every-hover
AI-chat-widget-added-for-decoration
```

## 21st.dev adaptation rule

A borrowed component is accepted only after:

1. its spacing maps to this system;
2. its colors use semantic tokens;
3. its typography matches this system;
4. its interaction states are accessible;
5. its responsive behavior is understood;
6. it does not introduce a competing icon family or visual language.
