# Motion

## Description
What moves on the page and how. Four things: the install box lifts on hover, its icon cross-fades after a copy, the hero scene sways, and the terminal demo types once.

## Tokens
| Token | Value | Role | Used by |
|---|---|---|---|
| `--motion-micro` | `.12s ease` | hover lift of the install box: `transform` and `box-shadow` | InstallButton |
| `--motion-swap` | `.15s` | copy icon to check mark: `opacity` | InstallButton |
| `--motion-sway` | `5s ease-in-out infinite alternate` | sprouts in the hero scene lean left and right: `transform` | HeroScene |
| `--motion-flow` | `4s linear infinite` | dashes run along the links in the hero scene: `stroke-dashoffset` | HeroScene |

## Usage
Each transition names its properties. Nothing uses `transition: all`.

Anchor links scroll smoothly (`scroll-behavior: smooth` on `html`).

The hero scene's two loops are CSS animations, written inside `@media (prefers-reduced-motion: no-preference)`. The terminal demo is a script timer that plays once, for 4.1 seconds, when the block scrolls into view.

## Accessibility
Under `prefers-reduced-motion: reduce` the install box changes with no transition, anchor links jump with no smooth scroll, the hero scene stands still and the terminal demo shows its finished text. The icon cross-fade stays, since nothing moves. Measured: 0 running animations under reduced motion and 13 without it (`.design-system/evidence/home/walk-redesign.json`). The hero scene loops for as long as the page is open, with no pause control but the system setting: NEEDS REVIEW against WCAG 2.2.2.

## Not tokens
- The hero scene's sway angle (1.5 degrees) and the two delays (-2s, -3.5s) are in the `.scene` rules of `app/globals.css`. The terminal demo's 30ms tick is in `components/terminal-demo.tsx`.
- The 1.6 seconds the copied state lasts is a timer in `components/install-button.tsx`.
