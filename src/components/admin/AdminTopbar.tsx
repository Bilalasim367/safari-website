'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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
    <header className="h-16 w-full flex items-center justify-between px-6 bg-background border-b border-border sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{getPageTitle(pathname)}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-semibold text-sm flex items-center justify-center">
            {getInitials(user?.name || 'Admin')}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-foreground">
            {user?.name || 'Admin'}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
    </header>
  )
}
