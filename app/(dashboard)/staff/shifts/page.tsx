'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import ShiftCalendar from '@/components/shared/StaffShiftCalendar' // Read-only calendar component
import type { Shift, ShiftAssignment, Staff } from '@/types'
import type { EventInput } from '@fullcalendar/core'

export default function StaffShiftsPage() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAssignedShifts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()

    // 1. Get the staff record for the current user
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (staffError || !staffData) {
      toast.error('スタッフ情報の取得に失敗しました。')
      setLoading(false)
      return
    }

    // 2. Get assigned shifts for this staff member
    const { data, error } = await supabase
      .from('shifts')
      .select('*, shift_assignments!inner(*)')
      .eq('status', 'published')
      .eq('shift_assignments.staff_id', staffData.id)

    if (error) {
      toast.error('シフトの読み込みに失敗しました。', { description: error.message })
    } else {
      setShifts(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchAssignedShifts()
  }, [fetchAssignedShifts])

  const calendarEvents = useMemo((): EventInput[] => {
    return shifts.map((shift) => ({
      id: shift.id,
      title: `${shift.start_time?.slice(0, 5) || ''} - ${shift.end_time?.slice(0, 5) || ''}`,
      start: `${shift.shift_date}T${shift.start_time || '00:00:00'}`,
      end: `${shift.shift_date}T${shift.end_time || '23:59:59'}`,
      allDay: !shift.start_time,
      backgroundColor: '#3B82F6', // Blue for assigned shifts
      borderColor: '#3B82F6',
      extendedProps: shift,
    }))
  }, [shifts])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">あなたのシフトを読み込んでいます...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">あなたのシフト</h1>
        <p className="text-muted-foreground">確定・公開済みのシフトがここに表示されます</p>
      </div>

      {shifts.length > 0 ? (
         <ShiftCalendar events={calendarEvents} />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">まだシフトが割り当てられていません</p>
        </div>
      )}
    </div>
  )
}
