import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Claude Code Cards',
  description: 'Series 1: NBA cards pulled one per Claude Code session.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/" className="brand">Claude Code Cards</Link>
          <form action="/u" role="search">
            <input name="id" placeholder="public_id or GitHub login" aria-label="Find a collection" required />
            <button>Find</button>
          </form>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
