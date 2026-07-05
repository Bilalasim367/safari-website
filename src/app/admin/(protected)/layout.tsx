import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminShell from './AdminShell'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  return <AdminShell>{children}</AdminShell>
}
