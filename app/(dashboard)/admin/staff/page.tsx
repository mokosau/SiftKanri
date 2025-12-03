'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import type { Staff } from '@/types'
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
import { StaffList } from '@/components/admin/staff-list'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

function StaffListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border">
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function StaffManagementPage() {
  const { user } = useAuth()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    staffCode: '',
    fullName: '',
    email: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchStaff = async () => {
    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setStaff(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStaff()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      const supabase = createClient()
      const qrToken = crypto.randomUUID()

      const { error } = await supabase.from('staff').insert([
        {
          organization_id: user.organization_id,
          staff_code: formData.staffCode,
          full_name: formData.fullName,
          email: formData.email || null,
          phone: formData.phone || null,
          qr_token: qrToken,
          is_active: true,
        },
      ])

      if (error) throw error

      toast.success('スタッフを追加しました')
      setFormData({ staffCode: '', fullName: '', email: '', phone: '' })
      setDialogOpen(false)
      fetchStaff()
    } catch (error) {
      toast.error('スタッフの追加に失敗しました', { description: error instanceof Error ? error.message : String(error) })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <StaffListSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">スタッフ管理</h1>
          <p className="text-muted-foreground">スタッフの追加・管理を行います</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              スタッフ追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいスタッフを追加</DialogTitle>
              <DialogDescription>
                スタッフ情報を入力してください。追加後、QRコードを発行できます。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="staffCode">スタッフコード *</Label>
                  <Input id="staffCode" name="staffCode" value={formData.staffCode} onChange={handleChange} required placeholder="例: S001" disabled={submitting}/>
                  <p className="text-xs text-muted-foreground">組織内で一意のコードを設定してください</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">名前 *</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="山田 太郎" disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス（任意）</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@example.com" disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号（任意）</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="090-1234-5678" disabled={submitting} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>キャンセル</Button>
                <Button type="submit" disabled={submitting}>{submitting ? '追加中...' : '追加する'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <StaffList staff={staff} onUpdate={fetchStaff} />
    </div>
  )
}
