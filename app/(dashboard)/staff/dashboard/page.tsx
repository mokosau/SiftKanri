'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, ClipboardList, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StaffDashboardPage() {
  const [staffName, setStaffName] = useState('')
  const [stats, setStats] = useState({
    thisMonthShifts: 0,
    pendingRequests: 0,
    upcomingShifts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // セッションストレージからスタッフ情報を取得（QRログイン用）
      const staffId = sessionStorage.getItem('qr_staff_id')
      const staffNameStored = sessionStorage.getItem('qr_staff_name')

      if (staffId && staffNameStored) {
        setStaffName(staffNameStored)

        const supabase = createClient()

        // 今月のシフト数を取得
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const { count: thisMonthShifts } = await supabase
          .from('shift_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('staff_id', staffId)

        // 未確認のシフト希望数を取得
        const { count: pendingRequests } = await supabase
          .from('shift_requests')
          .select('*', { count: 'exact', head: true })
          .eq('staff_id', staffId)
          .eq('status', 'pending')

        // 今後のシフト数を取得
        const { count: upcomingShifts } = await supabase
          .from('shift_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('staff_id', staffId)

        setStats({
          thisMonthShifts: thisMonthShifts || 0,
          pendingRequests: pendingRequests || 0,
          upcomingShifts: upcomingShifts || 0,
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [])

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
        <p className="text-muted-foreground">
          {staffName}さん、ようこそ！
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今月のシフト</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthShifts}日</div>
            <p className="text-xs text-muted-foreground">確定しているシフト数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">シフト希望</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}件</div>
            <p className="text-xs text-muted-foreground">確認待ちの希望</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今後のシフト</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingShifts}日</div>
            <p className="text-xs text-muted-foreground">予定されているシフト</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使う機能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/staff/requests">
              <Button variant="outline" className="w-full">
                シフト希望を提出する
              </Button>
            </Link>
            <Link href="/staff/shifts">
              <Button variant="outline" className="w-full">
                確定シフトを確認する
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使い方ガイド</CardTitle>
            <CardDescription>シフト管理の流れ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </div>
              <div>
                <p className="text-sm font-medium">シフト希望を提出</p>
                <p className="text-xs text-muted-foreground">
                  働ける日・働けない日を選択して提出します
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </div>
              <div>
                <p className="text-sm font-medium">管理者が確認</p>
                <p className="text-xs text-muted-foreground">
                  管理者があなたの希望を確認します
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </div>
              <div>
                <p className="text-sm font-medium">シフトが確定</p>
                <p className="text-xs text-muted-foreground">
                  確定したシフトを「確定シフト」から確認できます
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
