'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, ChevronDown, Bell } from '@/lib/lucide-icons'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const notifications = [
  { id: '1', text: 'New order #SAF-MTVH received', time: '2 min ago' },
  { id: '2', text: 'Order #SAF-MTV3 marked as delivered', time: '1 hr ago' },
  { id: '3', text: 'Low stock alert: Oud Royal (3 left)', time: '3 hrs ago' },
  { id: '4', text: 'New customer registered', time: 'Yesterday' },
  { id: '5', text: 'Payment received for #SAF-MTHA', time: '2 days ago' },
]

function getPageTitle(pathname: string) {
  const segment = pathname.split('/').pop() || 'dashboard'
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 sm:px-6 bg-white border-b border-[#eee] sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden h-11 w-11">
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="font-heading text-lg font-semibold text-[#111110] truncate">{getPageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#f5f2ec] transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-[#444]" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B6965D] text-[10px] font-bold text-black">
              3
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-heading text-base font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">3 unread</p>
            </div>
            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="flex flex-col gap-1 px-4 py-3 hover:bg-[#faf8f5] transition-colors cursor-pointer">
                  <p className="text-sm text-foreground leading-snug">{n.text}</p>
                  <p className="text-[11px] text-muted-foreground">{n.time}</p>
                </div>
              ))}
            </div>
            <Link
              href="/admin/notifications"
              className="block px-4 py-3 text-center text-sm font-medium text-[#B6965D] hover:bg-[#faf8f5] transition-colors border-t border-border"
            >
              View all →
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-[#f5f2ec] transition-colors cursor-pointer min-h-[44px]">
            <div className="w-9 h-9 rounded-full bg-[#B6965D]/20 text-[#9c7f4d] font-semibold text-sm flex items-center justify-center">
              {getInitials(user?.name || 'Admin')}
            </div>
            <span className="hidden md:inline text-sm font-medium text-[#111110]">
              {user?.name || 'Admin'}
            </span>
            <ChevronDown className="w-4 h-4 text-[#9a958d]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/')}>
              View Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}