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
  Megaphone,
  Upload,
  Sparkles,
} from '@/lib/lucide-icons'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/products/bulk-import', label: 'Bulk Import (CSV)', icon: Upload },
  { href: '/admin/products/bulk-price', label: 'Bulk Price Update', icon: Upload },
  { href: '/admin/bundles', label: 'Bundles', icon: Gift },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/returns', label: 'Return Requests', icon: Megaphone },
  { href: '/admin/showcase', label: 'Showcase', icon: Sparkles },
  { href: '/admin/popup-settings', label: 'Popup Settings', icon: Megaphone },
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
          <div className="h-10 bg-white/5 rounded-lg" />
          <div className="h-8 bg-white/5 rounded-lg" />
          <div className="h-8 bg-white/5 rounded-lg" />
          <div className="h-8 bg-white/5 rounded-lg" />
          <div className="h-8 bg-white/5 rounded-lg" />
          <div className="h-8 bg-white/5 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="p-6 border-b border-white/[0.06]">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#B6965D]/40 bg-[#B6965D]/10 shadow-[0_0_16px_rgba(182, 150, 93,0.15)]">
            <span className="font-heading text-xl font-bold text-[#B6965D]">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-semibold text-[#B6965D] tracking-wide leading-none">SAFARI</span>
            <span className="text-[11px] text-[#9a958d] tracking-[0.2em] mt-1.5">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex min-h-[44px] items-center gap-3 rounded-lg border-l-[3px] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[#B6965D] bg-[#B6965D]/[0.08] text-[#B6965D]'
                  : 'border-l-transparent text-[#9a958d] hover:bg-[#B6965D]/[0.07] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.06] space-y-1">
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[#9a958d] hover:bg-[#B6965D]/[0.07] hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex min-h-[44px] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[#9a958d] hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
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
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen bg-[#0a0a0a] border-r border-white/[0.06]">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 p-0 bg-[#0a0a0a]">
          <SidebarContent onNavClick={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}