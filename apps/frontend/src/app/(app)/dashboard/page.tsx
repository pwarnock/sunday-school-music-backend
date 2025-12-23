import { createClient } from '@sunday-school/lib'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <Dashboard user={user} />
}
