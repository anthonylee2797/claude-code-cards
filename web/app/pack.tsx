import Link from 'next/link'

export function PackTile({ href, name, line }: { href: string; name: string; line: string }) {
  return (
    <Link href={href} className="pack">
      <span className="chip">Beta</span>
      <h2>{name}</h2>
      <span>{line}</span>
    </Link>
  )
}
