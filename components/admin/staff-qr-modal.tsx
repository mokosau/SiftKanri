'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { QRCode } from 'qrcode.react'
import type { Staff } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  staff: Staff | null
}

export function StaffQrCodeModal({ isOpen, onClose, staff }: QrCodeModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  if (!staff) return null

  // IMPORTANT: This URL must match the QR login page route
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/qr-login/${staff.qr_token}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div ref={printRef} className="printable-area p-4">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">{staff.full_name} 様</DialogTitle>
            <DialogDescription>
              以下のQRコードをスキャンしてログインしてください
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <QRCode value={loginUrl} size={200} />
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold">【使い方】</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>スマートフォンのカメラアプリを起動します。</li>
              <li>カメラをこのQRコードに向けます。</li>
              <li>画面に表示された通知（URL）をタップします。</li>
              <li>自動的にログインが完了します。</li>
            </ol>
            <p className="pt-2 text-xs">
              ※ このQRコードは他の人に見せないでください。
            </p>
          </div>
        </div>
        <Separator />
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button type="button" onClick={handlePrint}>
            印刷する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
