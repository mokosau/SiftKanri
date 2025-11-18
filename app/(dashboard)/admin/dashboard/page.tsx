'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, ClipboardList, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    thisMonthShifts: 0,
    pendingRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      const supabase = createClient()

      // スタッフ数を取得
      const { count: totalStaff } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)

      const { count: activeStaff } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('is_active', true)

      // 今月のシフト数を取得
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const { count: thisMonthShifts } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .gte('shift_date', firstDay.toISOString().split('T')[0])
        .lte('shift_date', lastDay.toISOString().split('T')[0])

      // 未確認のシフト希望数を取得
      const { count: pendingRequests } = await supabase
        .from('shift_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('status', 'pending')

      setStats({
        totalStaff: totalStaff || 0,
        activeStaff: activeStaff || 0,
        thisMonthShifts: thisMonthShifts || 0,
        pendingRequests: pendingRequests || 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">シフト管理の概要を確認できます</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">登録スタッフ数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}名</div>
            <p className="text-xs text-muted-foreground">うち稼働中: {stats.activeStaff}名</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今月のシフト</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthShifts}件</div>
            <p className="text-xs text-muted-foreground">作成済みシフト数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">未確認シフト希望</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}件</div>
            <p className="text-xs text-muted-foreground">確認が必要です</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">クイックアクション</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Link href="/admin/staff">
                <Button variant="outline" size="sm" className="w-full">
                  スタッフ追加
                </Button>
              </Link>
              <Link href="/admin/shifts">
                <Button variant="outline" size="sm" className="w-full">
                  シフト作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>システムの最新の動き</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">アクティビティログは準備中です</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使い方ガイド</CardTitle>
            <CardDescription>シフト管理を始めましょう</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </div>
              <div>
                <p className="text-sm font-medium">スタッフを追加</p>
                <p className="text-xs text-muted-foreground">
                  スタッフ管理からスタッフを追加し、QRコードを発行します
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </div>
              <div>
                <p className="text-sm font-medium">シフト希望を確認</p>
                <p className="text-xs text-muted-foreground">
                  スタッフから提出されたシフト希望を確認します
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </div>
              <div>
                <p className="text-sm font-medium">シフトを作成・公開</p>
                <p className="text-xs text-muted-foreground">
                  シフトを作成し、公開するとスタッフに通知されます
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
