'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl text-sidebar-foreground">SAFARI</span>
            <span className="text-xs text-sidebar-foreground/50 tracking-widest">Admin Panel</span>
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
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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
          className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground px-4 py-3 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground px-4 py-3 rounded-lg transition-colors w-full"
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
