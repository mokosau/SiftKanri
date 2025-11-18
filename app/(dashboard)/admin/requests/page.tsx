'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import type { ShiftRequest, Staff } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RequestWithStaff extends ShiftRequest {
  staff?: Staff
}

export default function AdminRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestWithStaff[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    if (!user) return

    const supabase = createClient()

    // シフト希望を取得（スタッフ情報も一緒に）
    const { data, error } = await supabase
      .from('shift_requests')
      .select(`
        *,
        staff:staff_id (*)
      `)
      .eq('organization_id', user.organization_id)
      .order('request_date', { ascending: true })

    if (!error && data) {
      setRequests(data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'available':
        return '出勤可能'
      case 'unavailable':
        return '出勤不可'
      case 'preferred_time':
        return '時間指定'
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '未確認'
      case 'approved':
        return '承認済み'
      case 'rejected':
        return '却下'
      default:
        return status
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
        <h1 className="text-3xl font-bold">シフト希望確認</h1>
        <p className="text-muted-foreground">スタッフから提出されたシフト希望を確認できます</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">シフト希望がまだ提出されていません</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>スタッフ</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>希望タイプ</TableHead>
              <TableHead>時間</TableHead>
              <TableHead>備考</TableHead>
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.staff?.full_name || '-'}
                </TableCell>
                <TableCell>
                  {new Date(request.request_date).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      request.request_type === 'available'
                        ? 'bg-green-50 text-green-700'
                        : request.request_type === 'unavailable'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {getRequestTypeLabel(request.request_type)}
                  </span>
                </TableCell>
                <TableCell>
                  {request.preferred_start_time && request.preferred_end_time
                    ? `${request.preferred_start_time} - ${request.preferred_end_time}`
                    : '-'}
                </TableCell>
                <TableCell>{request.notes || '-'}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      request.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700'
                        : request.status === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
