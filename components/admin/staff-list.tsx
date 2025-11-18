'use client'

import { useState } from 'react'
import { QrCode, Trash2 } from 'lucide-react'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/client'
import type { Staff } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StaffListProps {
  staff: Staff[]
  onUpdate: () => void
}

export function StaffList({ staff, onUpdate }: StaffListProps) {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleShowQRCode = async (staffMember: Staff) => {
    setSelectedStaff(staffMember)

    // QRコードの内容: ログインURL + トークン
    const loginUrl = `${window.location.origin}/qr-login?token=${staffMember.qr_token}`
    const qrUrl = await QRCode.toDataURL(loginUrl, {
      width: 300,
      margin: 2,
    })
    setQrCodeUrl(qrUrl)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当にこのスタッフを削除しますか？')) return

    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('staff').delete().eq('id', id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      onUpdate()
    }
    setDeleting(null)
  }

  const handlePrintQR = () => {
    if (!qrCodeUrl) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QRコード - ${selectedStaff?.full_name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: sans-serif;
              }
              h2 { margin-bottom: 20px; }
              img { border: 2px solid #ccc; padding: 20px; }
              p { margin-top: 20px; color: #666; }
            </style>
          </head>
          <body>
            <h2>${selectedStaff?.full_name} さん専用ログインQRコード</h2>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p>スタッフコード: ${selectedStaff?.staff_code}</p>
            <script>window.print();</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  if (staff.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">スタッフがまだ登録されていません</p>
          <p className="text-xs text-muted-foreground">右上の「スタッフ追加」ボタンから登録してください</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>スタッフコード</TableHead>
            <TableHead>名前</TableHead>
            <TableHead>メール</TableHead>
            <TableHead>電話番号</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((staffMember) => (
            <TableRow key={staffMember.id}>
              <TableCell className="font-medium">{staffMember.staff_code}</TableCell>
              <TableCell>{staffMember.full_name}</TableCell>
              <TableCell>{staffMember.email || '-'}</TableCell>
              <TableCell>{staffMember.phone || '-'}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    staffMember.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {staffMember.is_active ? '稼働中' : '休止中'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowQRCode(staffMember)}
                  >
                    <QrCode className="h-4 w-4" />
                    <span className="ml-1">QR</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(staffMember.id)}
                    disabled={deleting === staffMember.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStaff?.full_name} さん専用QRコード</DialogTitle>
            <DialogDescription>
              スタッフにこのQRコードを読み取ってもらうことでログインできます
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="rounded-lg border" />
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">スタッフコード</p>
              <p className="font-mono text-lg font-bold">{selectedStaff?.staff_code}</p>
            </div>
            <Button onClick={handlePrintQR} className="w-full">
              印刷する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
