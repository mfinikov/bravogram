# Motion

## Description
What moves on the page and how. Four things: the install box lifts on hover, its icon cross-fades after a copy, the marks in the scene bob, and the terminal demo types once.

## Tokens
| Token | Value | Role | Used by |
|---|---|---|---|
| `--motion-micro` | `.12s ease` | hover lift of the install box and the call to action: `transform` and `box-shadow` | InstallButton, `.cta` |
| `--motion-swap` | `.15s` | copy icon to check mark: `opacity` | InstallButton |
| `--motion-bob` | `4s ease-in-out infinite alternate` | marks in the scene rise and sink: `transform` | HeroScene |

## Usage
Each transition names its properties. Nothing uses `transition: all`.

Anchor links scroll smoothly (`scroll-behavior: smooth` on `html`).

The scene's one loop is a CSS animation, written inside `@media (prefers-reduced-motion: no-preference)`. The terminal demo is a script timer that plays once, for 4.1 seconds, when the block scrolls into view.

## Accessibility
Under `prefers-reduced-motion: reduce` the install box changes with no transition, anchor links jump with no smooth scroll, the hero scene stands still and the terminal demo shows its finished text. The icon cross-fade stays, since nothing moves. By the code, 9 marks bob when motion is allowed (4 in the hero, 5 in the footer band) and none under reduced motion; the probe file predates the rework. The scene loops for as long as the page is open, with no pause control but the system setting: NEEDS REVIEW against WCAG 2.2.2.

## Not tokens
- The bob's travel (-5% to 7% of a mark's height) is in the `bob` keyframes of `app/globals.css`, and each mark's delay (1.7s apart) is in `components/hero-scene.tsx`. The terminal demo's 30ms tick is in `components/terminal-demo.tsx`.
- The 1.6 seconds the copied state lasts is a timer in `components/install-button.tsx`.
