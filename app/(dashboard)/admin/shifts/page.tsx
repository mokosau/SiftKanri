'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ShiftCalendar from '@/components/admin/ShiftCalendar'
import type { Shift, Staff } from '@/types'
import type { EventInput } from '@fullcalendar/core'
import { Skeleton } from '@/components/ui/skeleton'

const DEFAULT_FORM_STATE = {
  shiftDate: '',
  startTime: '09:00',
  endTime: '18:00',
  requiredStaff: 1,
  notes: '',
}

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[70vh] w-full" />
    </div>
  )
}

export default function ShiftsManagementPage() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [allStaff, setAllStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)

  const [formData, setFormData] = useState(DEFAULT_FORM_STATE)
  const [assignedStaffIds, setAssignedStaffIds] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()

    const [shiftsResult, staffResult] = await Promise.all([
      supabase
        .from('shifts')
        .select('*, shift_assignments(*, staff(full_name))')
        .eq('organization_id', user.organization_id),
      supabase
        .from('staff')
        .select('*')
        .eq('organization_id', user.organization_id)
        .eq('is_active', true)
    ])

    if (shiftsResult.error) {
      toast.error('シフト情報の読み込みに失敗しました', { description: shiftsResult.error.message })
    } else {
      setShifts(shiftsResult.data || [])
    }

    if (staffResult.error) {
      toast.error('スタッフ情報の読み込みに失敗しました', { description: staffResult.error.message })
    } else {
      setAllStaff(staffResult.data || [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const calendarEvents = useMemo((): EventInput[] => {
    return shifts.map((shift) => ({
      id: shift.id,
      title: `${shift.start_time?.slice(0, 5) || ''}-${shift.end_time?.slice(0, 5) || ''} (${shift.shift_assignments.length}/${shift.required_staff})`,
      start: `${shift.shift_date}T${shift.start_time || '00:00:00'}`,
      end: `${shift.shift_date}T${shift.end_time || '23:59:59'}`,
      allDay: !shift.start_time,
      backgroundColor: shift.status === 'published' ? '#10B981' : '#F59E0B',
      borderColor: shift.status === 'published' ? '#10B981' : '#F59E0B',
      extendedProps: shift,
    }))
  }, [shifts])

  const openModalForNew = (dateStr: string) => {
    setSelectedShift(null)
    setFormData({ ...DEFAULT_FORM_STATE, shiftDate: dateStr })
    setAssignedStaffIds(new Set())
    setDialogOpen(true)
  }

  const openModalForEdit = (shift: Shift) => {
    setSelectedShift(shift)
    setFormData({
      shiftDate: shift.shift_date,
      startTime: shift.start_time || '09:00',
      endTime: shift.end_time || '18:00',
      requiredStaff: shift.required_staff || 1,
      notes: shift.notes || '',
    })
    setAssignedStaffIds(new Set(shift.shift_assignments.map(a => a.staff_id)))
    setDialogOpen(true)
  }

  const handleStaffCheckChange = (staffId: string, checked: boolean) => {
    setAssignedStaffIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(staffId)
      } else {
        newSet.delete(staffId)
      }
      return newSet
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    const supabase = createClient()
    const shiftData = {
      id: selectedShift?.id, // undefined for new shifts
      organization_id: user.organization_id,
      shift_date: formData.shiftDate,
      start_time: formData.startTime,
      end_time: formData.endTime,
      required_staff: formData.requiredStaff,
      notes: formData.notes || null,
      status: selectedShift?.status || 'draft',
    }

    try {
      // 1. Upsert Shift
      const { data: upsertedShift, error: shiftError } = await supabase
        .from('shifts')
        .upsert(shiftData)
        .select()
        .single()

      if (shiftError) throw shiftError
      if (!upsertedShift) throw new Error('シフトの保存に失敗しました')

      // 2. Delete existing assignments for this shift
      const { error: deleteError } = await supabase
        .from('shift_assignments')
        .delete()
        .eq('shift_id', upsertedShift.id)

      if (deleteError) throw deleteError

      // 3. Insert new assignments
      const newAssignments = Array.from(assignedStaffIds).map(staffId => ({
        shift_id: upsertedShift.id,
        staff_id: staffId,
      }))

      if (newAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from('shift_assignments')
          .insert(newAssignments)
        if (insertError) throw insertError
      }

      toast.success('シフトを保存しました')
      setDialogOpen(false)
      fetchInitialData()
    } catch (error) {
      toast.error('シフトの保存に失敗しました', {
        description: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    const supabase = createClient()

    // First, delete assignments
    const { error: assignmentError } = await supabase
      .from('shift_assignments')
      .delete()
      .eq('shift_id', shiftId)

    if (assignmentError) {
      toast.error('シフトの割り当て削除に失敗しました', { description: assignmentError.message })
      return
    }

    // Then, delete the shift itself
    const { error: shiftError } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId)

    if (shiftError) {
      toast.error('シフトの削除に失敗しました', { description: shiftError.message })
    } else {
      toast.success('シフトを削除しました')
      setDialogOpen(false)
      fetchInitialData()
    }
  }

  const handlePublish = async (shift: Shift) => {
    if (!confirm('このシフトを公開しますか？割り当てられたスタッフに通知が送信されます。')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('shifts')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', shift.id)

    if (error) {
      toast.error('シフトの公開に失敗しました', { description: error.message })
      return
    }

    toast.success('シフトを公開しました！')

    // Send email notifications
    const assignedStaff = allStaff.filter(s =>
      shift.shift_assignments.some(a => a.staff_id === s.id)
    );

    for (const staff of assignedStaff) {
      if (staff.email) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: staff.email,
            subject: '【新規シフト公開】シンプルシフト管理',
            html: `
              <h1>新しいシフトが公開されました</h1>
              <p>${staff.full_name}様</p>
              <p>新しいシフトが公開されましたので、ご確認ください。</p>
              <p><strong>日付:</strong> ${new Date(shift.shift_date).toLocaleDateString()}</p>
              <p><strong>時間:</strong> ${shift.start_time?.slice(0,5)} - ${shift.end_time?.slice(0,5)}</p>
              <p>詳細はログインしてご確認ください。</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/staff/dashboard">ダッシュボードへ</a>
            `,
          }),
        });
      }
    }
    fetchInitialData()
  };

  if (loading) {
    return <CalendarSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">シフト管理</h1>
          <p className="text-muted-foreground">カレンダーでシフトを作成・編集します</p>
        </div>
        <Button onClick={() => openModalForNew(new Date().toISOString().split('T')[0])}>
          <Plus className="mr-2 h-4 w-4" />
          シフト作成
        </Button>
      </div>

      <ShiftCalendar
        events={calendarEvents}
        onDateClick={(arg) => openModalForNew(arg.dateStr)}
        onEventClick={(arg) => openModalForEdit(arg.event.extendedProps as Shift)}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedShift ? 'シフトを編集' : '新しいシフトを作成'}</DialogTitle>
            <DialogDescription>
              {selectedShift
                ? `[${new Date(selectedShift.shift_date).toLocaleDateString()}] のシフトを編集`
                : '新しいシフトを作成します'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">開始時間</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">終了時間</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredStaff">必要人数</Label>
                <Input id="requiredStaff" type="number" min="1" value={formData.requiredStaff} onChange={(e) => setFormData({ ...formData, requiredStaff: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="連絡事項など" />
              </div>

              <div className="space-y-2">
                <Label>スタッフ割り当て ({assignedStaffIds.size} / {formData.requiredStaff} 名)</Label>
                <div className="grid max-h-48 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto rounded-md border p-4">
                  {allStaff.length > 0 ? allStaff.map(staff => (
                    <div key={staff.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={assignedStaffIds.has(staff.id)}
                        onCheckedChange={(checked) => handleStaffCheckChange(staff.id, !!checked)}
                      />
                      <label htmlFor={`staff-${staff.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {staff.full_name}
                      </label>
                    </div>
                  )) : (
                    <p className="col-span-2 text-sm text-muted-foreground">スタッフが登録されていません</p>
                  )}
                </div>
              </div>

            </div>
            <DialogFooter className="grid grid-cols-2 gap-2 sm:flex-initial">
              {selectedShift && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="sm:mr-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>本当にこのシフトを削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は元に戻せません。シフトと、関連するすべてのスタッフ割り当てが完全に削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteShift(selectedShift.id)}>
                        削除を実行
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <div className="flex w-full justify-end gap-2">
                {selectedShift && selectedShift.status === 'draft' && (
                  <Button type="button" variant="secondary" onClick={() => handlePublish(selectedShift)}>
                    公開する
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '保存中...' : '保存する'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
