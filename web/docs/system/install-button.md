# InstallButton

## Description
Copies the install command to the clipboard with one press and confirms it.

`import { InstallButton } from "@/components/install-button"`, source `components/install-button.tsx`, status `ready`.
Foundation: `hand-rolled`. Traps checked: `trap/button-div`, `trap/role-button`, `trap/button-clone`, `trap/button-icon-name`, `trap/button-type`, `trap/weight-shift`, `trap/focus-ring-shape`, `trap/hover-beats-focus`, `trap/loading-layout-shift`, `trap/loading-label-swap`, `trap/reduced-motion-ignored`, `trap/motion-transition-all`, `trap/motion-layout-property`, `trap/press-delayed`, `trap/control-height` (n/a: it never sits beside another control), `trap/submit-repeat` (n/a: a second press copies the same text again and harms nothing), `trap/disabled-still-hovers` (n/a: it has no disabled state).

### Foundation
Not applicable: hand-rolled

## Examples
The install box on its own: `docs/system/examples/install-button/default.tsx`.

Real uses, 1 call sites (`rg -n "<InstallButton\b" app components`):
- Hero: the page's main action, under the lede. `app/page.tsx:91`

### Example files
| File | Covers | Caption |
|---|---|---|
| `docs/system/examples/install-button/default.tsx` | default | The install box on its own. One press copies the command. |
| `docs/system/examples/install-button/in-hero.tsx` | composition:Hero | The install box under the lede, on top of the scene. |
| Not applicable: the copied state is internal, starts on a press and ends 1.6 seconds later, so no prop reaches it | state:copied | The check mark in place of the copy icon. |

## Variants
Not applicable: the component takes no props. The command is the constant `COMMAND` in the source file.

## States
| State | Trigger | What the user can do | Shown by, besides color | Checked by |
|---|---|---|---|---|
| idle | page load, or 1.6 seconds after a copy | press it | the copy icon at the right edge | screenshot |
| hover | pointer over the box | press it | the box lifts 2px up and left over a hard 4px shadow | by hand |
| pressed | pointer down | release to copy | the lift and shadow drop back at once | by hand |
| focus | keyboard focus | press Enter or Space | a 2px outline, 3px off the box | by hand |
| copied | a press, by pointer, Enter or Space | press again to copy again | the check mark replaces the copy icon, and the status region says "Copied: npm i -g bravogram" | screenshot |

### State precedence
- Hover and focus: both show. The outline moves with the lifted box.
- Copied and hover: both show. The check mark shows on the lifted box.
- Copied and focus: both show. Focus stays on the button after the press.
- Pressed and hover: pressed wins. The box sits flat while the pointer is down.

### Motion
| Trigger | Kind | Preset | Properties | Reduced motion |
|---|---|---|---|---|
| pointer enters or leaves | announce | `--motion-micro` | transform, box-shadow | no transition: the lift and shadow appear at once |
| pointer down | announce | `--motion-micro` | transform, box-shadow | no transition: the box drops at once |
| idle to copied and back | announce | `--motion-swap` | opacity | the same opacity fade, since nothing moves |

`box-shadow` is not transform or opacity (`trap/motion-layout-property`). It is a paint-only change on one element and stays as the page was approved.

## Props
The component takes no props.

## Usage

### When to use
- A section asks the reader to install Bravogram.

### When not to use
- The action navigates, such as a link to GitHub or npm. Use a text link instead, per coverage-gaps row "Links and navigation".
- The action is anything other than copying the install command. Follow coverage-gaps row "Other buttons" instead.

### Rules
- `rule/install-button-keep-label`: When the command has been copied, keep the command text in `.cmd` and swap only the 16px icon, because a label that changes moves the box under the pointer and renames the button mid-press. Evidence: measured 269x54 idle and copied at 390 wide and 337x59 at 1440, .design-system/evidence/home/walk-redesign.json. Check: probe `node .design-system/scripts/walk.mjs`.
  - Don't: `<span className="cmd">{copied ? "Copied" : COMMAND}</span>`
  - Do: `<span className="cmd">{COMMAND}</span>`
- `rule/install-button-announce`: When a copy succeeds, write `Copied: {command}` into the `role="status"` element beside the button, because the icon swap is silent to a screen reader. Evidence: measured 2 of 2 keys (Enter, Space) set the status text "Copied: npm i -g bravogram" at both widths, .design-system/evidence/home/walk.json; principle wcag: 4.1.3 Status Messages, a result the user did not move focus to is announced. Check: probe `node .design-system/scripts/walk.mjs`.
  - Don't: `<button className="install" onClick={copy}>{COMMAND}</button>`
  - Do: `<span className="sr-only" role="status" aria-live="polite">{copied ? "Copied: " + COMMAND : ""}</span>`

### Content
- `rule/install-button-name`: When the button renders, set `aria-label` to `Copy install command: {command}`, because the visible text is only the command and does not say what a press does. Evidence: single use components/install-button.tsx:29, the same label serves both call sites; principle wcag: 2.5.3 Label in Name, the name contains the visible command. Check: probe the control name in the capture's `.probe.json`.
  - Don't: `<button className="install" aria-label="Copy">`
  - Do: `<button className="install" aria-label={"Copy install command: " + COMMAND}>`

### Anti-slop
- `rule/install-button-one-source`: When a section shows the install command as a control, render `InstallButton` instead of a second `button` holding the command, because two copies of the command drift apart on the next release. Evidence: app 2/2 call sites render the component, `rg -n "<InstallButton\b" app components`. Check: review a search for `npm i -g` outside `components/install-button.tsx` and the `STEPS` list.
  - Don't: `<button className="install" onClick={copy}>npm i -g bravogram</button>`
  - Do: `<InstallButton />`

### Limits
- `rule/install-button-command-length`: When the command is longer than 26 characters, shorten it or let `.cmd` wrap instead of keeping it on one line, because at 390 wide the 27th character squeezes the icon and the box overflows the hero. Evidence: measured first break at 27 characters, today's command is 18, .design-system/evidence/install-button/limit-390.json. Check: probe `node .design-system/scripts/install-limit.mjs`.
  - Don't: `const COMMAND = 'npm install --global bravogram@latest'`
  - Do: `const COMMAND = 'npm i -g bravogram'`

## Accessibility
Rests on a native `button` with `type="button"`.

Measured on the rendered page (.design-system/evidence/install-button/limit-390.json): command text 18.36:1 on the white box, focus ring 5.17:1 on white, copy icon 3.47:1. The `$` sign is 2.98:1. It is decoration and is left out of the accessible name. The box is 269x54 at 390 wide and 337x59 at 1440.

The by-hand rows below were walked by script on 2026-10-03: `node .design-system/scripts/walk.mjs`, results in `.design-system/evidence/home/walk.json`. The repo has no test runner, so no test file repeats them.

### Keyboard
| Key | Where focus is | Effect | Focus after | Checked by |
|---|---|---|---|---|
| Tab | the element before | focus moves to the button and the outline shows | the button | by hand |
| Enter | the button | copies the command and shows the copied state | the button | by hand |
| Space | the button | copies the command and shows the copied state | the button | by hand |

### ARIA
| Part | Role | Accessible name from | States and properties | Announced | Checked by |
|---|---|---|---|---|---|
| the box | button | `aria-label`, "Copy install command: npm i -g bravogram" | none | the name, on focus | snapshot |
| the icons | none, `aria-hidden` | none | none | nothing | snapshot |
| status region | status, `aria-live="polite"` | none | none | "Copied: npm i -g bravogram" after a press, then cleared after 1.6 seconds | by hand |

## Tokens
| Part | State | Token |
|---|---|---|
| box border, text, hover shadow | all | `--ink` |
| box background | all | `--panel` |
| focus outline | focus | `--accent` |
| command text | all | `--mono`, `--font-size-command` |
| box padding | all | `--space-18`, `--space-24` |
| gap between parts | all | `--space-16` |
| space above the box | all | `--space-32` |
| lift and shadow | hover, pressed | `--motion-micro` |
| icon swap | copied | `--motion-swap` |

## Related
- Logo: the mark, when the job is to name the product, not to act.
- TerminalDemo: shows what the commands print. It copies nothing.
