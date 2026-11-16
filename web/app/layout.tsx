import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font' })

export const metadata: Metadata = {
  title: 'Claude Code Cards',
  description: 'A Claude Code plugin: pull a collectible NBA card when you start a session.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <header>
          <nav className="brand-row">
            <Link href="/" className="brand">Claude Code Cards</Link>
            <Link href="/series">Packs</Link>
          </nav>
          <form action="/u" role="search">
            <input name="id" placeholder="hoop-7k2f or GitHub login" aria-label="Find a collection" required />
            <button>Find</button>
          </form>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
