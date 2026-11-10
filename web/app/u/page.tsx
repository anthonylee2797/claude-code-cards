import { redirect } from 'next/navigation'

// The search form submits GET /u?id=…; send it on to the collection page.
export default async function Search({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const id = (await searchParams).id?.trim().replace(/^@/, '')
  redirect(id ? `/u/${encodeURIComponent(id)}` : '/')
}
