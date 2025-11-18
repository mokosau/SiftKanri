'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Plus } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Shift, Staff, ShiftAssignment } from '@/types'

export default function ShiftsManagementPage() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    shiftDate: '',
    startTime: '09:00',
    endTime: '18:00',
    requiredStaff: 1,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    if (!user) return

    const supabase = createClient()

    // シフトを取得
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .eq('organization_id', user.organization_id)
      .order('shift_date', { ascending: false })
      .limit(50)

    // スタッフを取得
    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('is_active', true)

    if (!shiftsError && shiftsData) {
      setShifts(shiftsData)
    }
    if (staffData) {
      setStaff(staffData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from('shifts').insert([
        {
          organization_id: user.organization_id,
          shift_date: formData.shiftDate,
          start_time: formData.startTime,
          end_time: formData.endTime,
          required_staff: formData.requiredStaff,
          notes: formData.notes || null,
          status: 'draft',
        },
      ])

      if (error) throw error

      setFormData({
        shiftDate: '',
        startTime: '09:00',
        endTime: '18:00',
        requiredStaff: 1,
        notes: '',
      })
      setDialogOpen(false)
      fetchData()
    } catch (error) {
      alert('シフトの作成に失敗しました: ' + (error instanceof Error ? error.message : ''))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublish = async (shiftId: string) => {
    if (!confirm('このシフトを公開しますか？スタッフに通知されます。')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('shifts')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', shiftId)

    if (error) {
      alert('公開に失敗しました: ' + error.message)
    } else {
      fetchData()
      // TODO: メール通知を実装
      alert('シフトを公開しました！')
    }
  }

  const handleDelete = async (shiftId: string) => {
    if (!confirm('このシフトを削除しますか？')) return

    const supabase = createClient()
    const { error } = await supabase.from('shifts').delete().eq('id', shiftId)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      fetchData()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">シフト管理</h1>
          <p className="text-muted-foreground">シフトの作成・編集・公開を行います</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              シフト作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいシフトを作成</DialogTitle>
              <DialogDescription>シフト情報を入力してください</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftDate">日付 *</Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    value={formData.shiftDate}
                    onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">開始時間</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">終了時間</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredStaff">必要人数</Label>
                  <Input
                    id="requiredStaff"
                    type="number"
                    min="1"
                    value={formData.requiredStaff}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredStaff: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">備考（任意）</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="その他の情報など"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '作成中...' : '作成する'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {shifts.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">シフトがまだ作成されていません</p>
            <p className="text-xs text-muted-foreground">右上の「シフト作成」ボタンから作成してください</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead>時間</TableHead>
              <TableHead>必要人数</TableHead>
              <TableHead>備考</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">
                  {new Date(shift.shift_date).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  {shift.start_time && shift.end_time
                    ? `${shift.start_time} - ${shift.end_time}`
                    : '-'}
                </TableCell>
                <TableCell>{shift.required_staff || '-'}名</TableCell>
                <TableCell>{shift.notes || '-'}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      shift.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {shift.status === 'published' ? '公開済み' : '下書き'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {shift.status === 'draft' && (
                      <Button variant="default" size="sm" onClick={() => handlePublish(shift.id)}>
                        公開
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(shift.id)}
                    >
                      削除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
