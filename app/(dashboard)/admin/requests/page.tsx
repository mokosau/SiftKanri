'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { ShiftRequest, Staff } from '@/types'
import type { EventInput } from '@fullcalendar/core'

const staffColors = [
  '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899',
  '#F59E0B', '#6366F1', '#14B8A6', '#D946EF', '#0EA5E9'
]

export default function AdminRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<(ShiftRequest & { staff: { full_name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [staffColorMap, setStaffColorMap] = useState<Record<string, string>>({})

  const fetchRequests = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shift_requests')
      .select('*, staff(full_name)')
      .eq('organization_id', user.organization_id)
      // Display requests for the upcoming month for now
      .gte('request_date', new Date().toISOString().split('T')[0])

    if (error) {
      toast.error('シフト希望の読み込みに失敗しました')
    } else {
      const validData = data?.filter(d => d.staff) as (ShiftRequest & { staff: { full_name: string } })[] || []
      setRequests(validData)

      // Create a consistent color mapping for staff members
      const staffIds = [...new Set(validData.map(r => r.staff_id))]
      const colorMap: Record<string, string> = {}
      staffIds.forEach((id, index) => {
        colorMap[id] = staffColors[index % staffColors.length]
      })
      setStaffColorMap(colorMap)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const calendarEvents = useMemo((): EventInput[] => {
    return requests.map(req => {
      let title = `${req.staff.full_name}: `
      switch (req.request_type) {
        case 'available': title += '出勤可能'; break;
        case 'unavailable': title += '出勤不可'; break;
        case 'preferred_time': title += `${req.preferred_start_time?.slice(0,5)}-${req.preferred_end_time?.slice(0,5)}`; break;
      }
      return {
        id: req.id,
        title,
        start: req.request_date,
        allDay: true,
        backgroundColor: staffColorMap[req.staff_id] || '#6B7280',
        borderColor: staffColorMap[req.staff_id] || '#6B7280',
        extendedProps: req,
      }
    })
  }, [requests, staffColorMap])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">希望シフトを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">シフト希望一覧</h1>
        <p className="text-muted-foreground">スタッフから提出されたシフト希望を確認できます。</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">まだどのスタッフからも希望が提出されていません。</p>
        </div>
      ) : (
        <div className="calendar-container rounded-lg border bg-card p-4 text-card-foreground">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }}
          events={calendarEvents}
          locale="ja"
          buttonText={{ today: '今日', month: '月' }}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.8}
        />
      </div>
      )}
    </div>
  )
}
