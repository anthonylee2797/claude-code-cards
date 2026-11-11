import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <h1>No collection found</h1>
      <p>Check the public_id (like hoop-7k2f) or GitHub login. <Link href="/">See all cards</Link></p>
    </>
  )
}
