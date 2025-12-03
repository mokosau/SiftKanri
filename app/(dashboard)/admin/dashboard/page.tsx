'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Users, CalendarClock, ClipboardList } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// SummaryCard component
function SummaryCard({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 text-card-foreground">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="mt-4 h-8 w-1/4" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ staffCount: 0, pendingRequests: 0, shiftsToday: 0, staffToday: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return
      const supabase = createClient()

      const today = new Date().toISOString().split('T')[0]

      const [staffRes, requestsRes, shiftsRes] = await Promise.all([
        supabase.from('staff').select('id', { count: 'exact' }).eq('organization_id', user.organization_id).eq('is_active', true),
        supabase.from('shift_requests').select('id', { count: 'exact' }).eq('organization_id', user.organization_id).eq('status', 'pending').gte('request_date', today),
        supabase.from('shifts').select('required_staff, shift_assignments(count)').eq('organization_id', user.organization_id).eq('shift_date', today)
      ])

      const staffTodayCount = shiftsRes.data?.reduce((acc, shift) => acc + (shift.shift_assignments[0]?.count || 0), 0) || 0

      setSummary({
        staffCount: staffRes.count || 0,
        pendingRequests: requestsRes.count || 0,
        shiftsToday: shiftsRes.data?.length || 0,
        staffToday: staffTodayCount,
      })
      setLoading(false)
    }

    fetchSummary()
  }, [user])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">組織の状況をここで確認できます。</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="有効なスタッフ数"
          value={`${summary.staffCount}人`}
          icon={Users}
          description="現在アクティブなスタッフの総数"
        />
        <SummaryCard
          title="未対応のシフト希望"
          value={`${summary.pendingRequests}件`}
          icon={ClipboardList}
          description="これから対応が必要なシフト希望の数"
        />
        <SummaryCard
          title="本日のシフト"
          value={`${summary.shiftsToday}件 / ${summary.staffToday}人`}
          icon={CalendarClock}
          description="本日予定されているシフトと勤務人数"
        />
      </div>
    </div>
  )
}
