'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import type { ShiftRequest, Staff } from '@/types'
import type { EventInput, DateClickArg } from '@fullcalendar/core'
import RequestCalendar from '@/components/staff/RequestCalendar'
import { RequestModal } from '@/components/staff/RequestModal'

export default function StaffRequestsPage() {
  const { user } = useAuth()
  const [staffRecord, setStaffRecord] = useState<Staff | null>(null)
  const [requests, setRequests] = useState<ShiftRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [existingRequest, setExistingRequest] = useState<ShiftRequest | null>(null)

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()

    // Get staff record
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (staffError || !staffData) {
      toast.error('スタッフ情報の取得に失敗しました')
      setLoading(false)
      return
    }
    setStaffRecord(staffData)

    // Fetch existing requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('shift_requests')
      .select('*')
      .eq('staff_id', staffData.id)

    if (requestsError) {
      toast.error('希望シフトの読み込みに失敗しました')
    } else {
      setRequests(requestsData || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const calendarEvents = useMemo((): EventInput[] => {
    return requests.map(req => {
      let title = ''
      let className = ''
      switch (req.request_type) {
        case 'available': title = '出勤可能'; className = 'available'; break;
        case 'unavailable': title = '出勤不可'; className = 'unavailable'; break;
        case 'preferred_time': title = `希望: ${req.preferred_start_time?.slice(0,5)}-${req.preferred_end_time?.slice(0,5)}`; className = 'preferred_time'; break;
      }
      return {
        id: req.id,
        title,
        start: req.request_date,
        allDay: true,
        className,
        extendedProps: req,
      }
    })
  }, [requests])

  const handleDateClick = (arg: DateClickArg) => {
    const existing = requests.find(r => r.request_date === arg.dateStr)
    setSelectedDate(arg.dateStr)
    setExistingRequest(existing || null)
    setIsModalOpen(true)
  }

  const handleSubmitRequest = async (data: Partial<ShiftRequest>) => {
    if (!staffRecord) return
    const supabase = createClient()

    const requestData = {
      ...data,
      staff_id: staffRecord.id,
      organization_id: staffRecord.organization_id,
    }

    const { error } = await supabase.from('shift_requests').upsert(requestData)

    if (error) {
      toast.error('希望の送信に失敗しました', { description: error.message })
    } else {
      toast.success('希望を送信しました')
      setIsModalOpen(false)
      fetchInitialData() // Refresh data
    }
  }

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
        <h1 className="text-3xl font-bold">シフト希望</h1>
        <p className="text-muted-foreground">カレンダーの日付をクリックして、希望を提出・編集してください。</p>
      </div>

      <RequestCalendar events={calendarEvents} onDateClick={handleDateClick} />

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        existingRequest={existingRequest}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
