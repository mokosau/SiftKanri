'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Shift, ShiftAssignment } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ShiftWithAssignment extends Shift {
  assignment?: ShiftAssignment
}

export default function StaffShiftsPage() {
  const [shifts, setShifts] = useState<ShiftWithAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShifts = async () => {
    const staffId = sessionStorage.getItem('qr_staff_id')
    if (!staffId) return

    const supabase = createClient()

    // 自分がアサインされているシフトを取得
    const { data: assignments } = await supabase
      .from('shift_assignments')
      .select('*, shifts(*)')
      .eq('staff_id', staffId)

    if (assignments) {
      const shiftsData = assignments
        .map((a: any) => ({
          ...a.shifts,
          assignment: a,
        }))
        .filter((s: any) => s.status === 'published')
        .sort((a: any, b: any) => new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime())

      setShifts(shiftsData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchShifts()
  }, [])

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
        <h1 className="text-3xl font-bold">確定シフト</h1>
        <p className="text-muted-foreground">あなたのシフトを確認できます</p>
      </div>

      {shifts.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">確定しているシフトがありません</p>
            <p className="text-xs text-muted-foreground">
              管理者がシフトを公開するとここに表示されます
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead>時間</TableHead>
              <TableHead>備考</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">
                  {new Date(shift.shift_date).toLocaleDateString('ja-JP', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  {shift.assignment?.start_time && shift.assignment?.end_time
                    ? `${shift.assignment.start_time} - ${shift.assignment.end_time}`
                    : shift.start_time && shift.end_time
                    ? `${shift.start_time} - ${shift.end_time}`
                    : '-'}
                </TableCell>
                <TableCell>{shift.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
