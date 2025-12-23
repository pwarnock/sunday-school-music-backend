import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  // Redirect to home page - authentication will be handled client-side
  redirect('/home')
}
