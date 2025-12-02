'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Staff } from '@/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  staff: Staff | null
  onUpdate: () => void
}

export function StaffEditModal({ isOpen, onClose, staff, onUpdate }: EditModalProps) {
  const [formData, setFormData] = useState({ staffCode: '', fullName: '', email: '', phone: '' })
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (staff) {
      setFormData({
        staffCode: staff.staff_code,
        fullName: staff.full_name,
        email: staff.email || '',
        phone: staff.phone || '',
      })
      setIsActive(staff.is_active)
    }
  }, [staff])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staff) return

    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('staff')
      .update({
        staff_code: formData.staffCode,
        full_name: formData.fullName,
        email: formData.email || null,
        phone: formData.phone || null,
        is_active: isActive,
      })
      .eq('id', staff.id)

    if (error) {
      toast.error('スタッフ情報の更新に失敗しました', { description: error.message })
    } else {
      toast.success('スタッフ情報を更新しました')
      onUpdate()
      onClose()
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>スタッフ情報を編集</DialogTitle>
          <DialogDescription>{staff?.full_name} の情報を編集します。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staffCode">スタッフコード *</Label>
              <Input id="staffCode" name="staffCode" value={formData.staffCode} onChange={handleChange} required disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">名前 *</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={submitting} />
            </div>
             <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} disabled={submitting} />
                <Label htmlFor="is_active">有効なアカウント</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
            <Button type="submit" disabled={submitting}>{submitting ? '更新中...' : '更新する'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
