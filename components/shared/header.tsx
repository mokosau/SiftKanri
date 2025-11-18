'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const isAdmin = user.role === 'admin'
  const navItems = isAdmin
    ? [
        { href: '/admin/dashboard', label: 'ダッシュボード' },
        { href: '/admin/staff', label: 'スタッフ管理' },
        { href: '/admin/shifts', label: 'シフト管理' },
        { href: '/admin/requests', label: 'シフト希望' },
      ]
    : [
        { href: '/staff/dashboard', label: 'ダッシュボード' },
        { href: '/staff/requests', label: 'シフト希望提出' },
        { href: '/staff/shifts', label: '確定シフト' },
      ]

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={isAdmin ? '/admin/dashboard' : '/staff/dashboard'} className="text-xl font-bold text-primary">
            シンプルシフト管理
          </Link>
          <nav className="hidden md:flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.full_name}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="ml-2">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
