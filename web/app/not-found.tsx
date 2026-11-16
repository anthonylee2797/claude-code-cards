import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <h1>Nothing here</h1>
      <p>Looking for a collection? Check the public_id (like hoop-7k2f) or GitHub login. <Link href="/series">See all packs</Link></p>
    </>
  )
}
