'use client'

import { useState } from 'react'

const COMMAND = 'npm i -g bravogram'

// The install box: one click copies the command, the icon flips to a check for a moment,
// and a live region says it for screen readers.
export function InstallButton() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(COMMAND)
    } catch {
      // Clipboard API blocked (plain http or an old browser): fall back to a hidden textarea.
      const t = Object.assign(document.createElement('textarea'), { value: COMMAND })
      document.body.append(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      <button className={`install${copied ? ' copied' : ''}`} type="button" onClick={copy} aria-label={`Copy install command: ${COMMAND}`}>
        <span className="dollar">$</span>
        <span className="cmd">{COMMAND}</span>
        <span className="state" aria-hidden="true">
          <svg className="copy" viewBox="0 0 16 16" fill="none">
            <rect x="5.5" y="1.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3.5 5.5h-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <svg className="ok" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{copied ? `Copied: ${COMMAND}` : ''}</span>
    </>
  )
}
