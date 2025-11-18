'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ShiftRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ShiftRequestCalendar } from '@/components/staff/shift-request-calendar'

export default function StaffRequestsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [requests, setRequests] = useState<ShiftRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [existingRequest, setExistingRequest] = useState<ShiftRequest | null>(null)
  const [formData, setFormData] = useState({
    requestType: 'available' as 'available' | 'unavailable' | 'preferred_time',
    startTime: '',
    endTime: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async () => {
    const staffId = sessionStorage.getItem('qr_staff_id')
    if (!staffId) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('shift_requests')
      .select('*')
      .eq('staff_id', staffId)
      .order('request_date', { ascending: true })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const existing = requests.find(
      (req) => new Date(req.request_date).toDateString() === date.toDateString()
    )
    if (existing) {
      setExistingRequest(existing)
      setFormData({
        requestType: existing.request_type as any,
        startTime: existing.preferred_start_time || '',
        endTime: existing.preferred_end_time || '',
        notes: existing.notes || '',
      })
    } else {
      setExistingRequest(null)
      setFormData({
        requestType: 'available',
        startTime: '',
        endTime: '',
        notes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return

    const staffId = sessionStorage.getItem('qr_staff_id')
    const staffName = sessionStorage.getItem('qr_staff_name')
    if (!staffId) return

    setSubmitting(true)

    try {
      const supabase = createClient()

      // スタッフ情報から組織IDを取得
      const { data: staffData } = await supabase
        .from('staff')
        .select('organization_id')
        .eq('id', staffId)
        .single()

      if (!staffData) throw new Error('スタッフ情報が見つかりません')

      const requestData = {
        organization_id: staffData.organization_id,
        staff_id: staffId,
        request_date: selectedDate.toISOString().split('T')[0],
        request_type: formData.requestType,
        preferred_start_time: formData.startTime || null,
        preferred_end_time: formData.endTime || null,
        notes: formData.notes || null,
        status: 'pending',
      }

      if (existingRequest) {
        // 更新
        const { error } = await supabase
          .from('shift_requests')
          .update(requestData)
          .eq('id', existingRequest.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase.from('shift_requests').insert([requestData])

        if (error) throw error
      }

      setDialogOpen(false)
      fetchRequests()
    } catch (error) {
      alert('シフト希望の提出に失敗しました: ' + (error instanceof Error ? error.message : ''))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingRequest) return
    if (!confirm('このシフト希望を削除しますか？')) return

    const supabase = createClient()
    const { error } = await supabase.from('shift_requests').delete().eq('id', existingRequest.id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      setDialogOpen(false)
      fetchRequests()
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">シフト希望提出</h1>
        <p className="text-muted-foreground">カレンダーから日付を選択してシフト希望を提出できます</p>
      </div>

      <ShiftRequestCalendar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        requests={requests}
        onDateClick={handleDateClick}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のシフト希望
            </DialogTitle>
            <DialogDescription>
              {existingRequest ? '希望を変更できます' : '希望を提出できます'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>希望タイプ *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.requestType === 'available' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, requestType: 'available' })}
                  >
                    出勤可能
                  </Button>
                  <Button
                    type="button"
                    variant={formData.requestType === 'unavailable' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, requestType: 'unavailable' })}
                  >
                    出勤不可
                  </Button>
                </div>
                <Button
                  type="button"
                  variant={formData.requestType === 'preferred_time' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setFormData({ ...formData, requestType: 'preferred_time' })}
                >
                  時間指定あり
                </Button>
              </div>

              {formData.requestType === 'preferred_time' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="startTime">開始時間</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">終了時間</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">備考（任意）</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="その他の要望など"
                />
              </div>
            </div>
            <DialogFooter>
              {existingRequest && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  削除
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '提出中...' : '提出する'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
