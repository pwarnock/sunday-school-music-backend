import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export const dynamic = 'force-dynamic'

export default function Home() {
  // Auth check is now handled client-side by the Dashboard component
  return <Dashboard />
}
