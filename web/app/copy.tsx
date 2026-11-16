'use client'
import { useState } from 'react'

/** A command line with a Copy button. */
export function Command({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard blocked: the text is still selectable */ }
  }
  return (
    <div className="cmd">
      <code>{text}</code>
      <button type="button" onClick={copy} aria-label={`Copy: ${text}`}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}
