'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Gift,
  ExternalLink,
  LogOut,
} from '@/lib/lucide-icons'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/bundles', label: 'Bundles', icon: Gift },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-10 bg-sidebar-accent/20 rounded-lg" />
          <div className="h-8 bg-sidebar-accent/20 rounded-lg" />
          <div className="h-8 bg-sidebar-accent/20 rounded-lg" />
          <div className="h-8 bg-sidebar-accent/20 rounded-lg" />
          <div className="h-8 bg-sidebar-accent/20 rounded-lg" />
          <div className="h-8 bg-sidebar-accent/20 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-md">
            <span className="text-sidebar-primary-foreground font-bold text-xl font-heading">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-semibold text-sidebar-foreground tracking-wide leading-none">SAFARI</span>
            <span className="text-xs text-gold/80 tracking-widest mt-1">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-gold border-l-2 border-gold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-2 border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-gold px-4 py-3 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-destructive px-4 py-3 rounded-lg transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SidebarContent onNavClick={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
