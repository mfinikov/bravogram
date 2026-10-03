# Delete plan

Validated by `node .design-system/scripts/validate-delete.mjs` (exit 0 means every count is 0). Dynamic class patterns in the app: one, `install${copied ? ' copied' : ''}` in components/install-button.tsx, which can produce only `install` and `install copied`.

| Item | Kind | Search that proves it unused | Count |
|---|---|---|---|
| `.term`, `.term pre`, `.term .c`, `.term .p` (app/globals.css) | CSS class | `\bterm\b` in app/**/*.tsx and components/**/*.tsx | 0 |
| `--term` | token | `var(--term)` outside the `.term` rules | 0 |
| `--term-text` | token | `var(--term-text)` outside the `.term` rules | 0 |
| `--term-dim` | token | `var(--term-dim)` outside the `.term` rules | 0 |
