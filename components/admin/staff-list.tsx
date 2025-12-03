'use client'

import { useState } from 'react'
import { MoreHorizontal, QrCode, Edit, Trash2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Staff } from '@/types'
import { StaffEditModal } from './staff-edit-modal'
import { StaffQrCodeModal } from './staff-qr-modal'

interface StaffListProps {
  staff: Staff[]
  onUpdate: () => void
}

export function StaffList({ staff, onUpdate }: StaffListProps) {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  const handleToggleActive = async (staffMember: Staff) => {
    const action = staffMember.is_active ? '無効化' : '有効化'
    if (!confirm(`${staffMember.full_name} を${action}しますか？`)) return

    const supabase = createClient()
    const { error } = await supabase
      .from('staff')
      .update({ is_active: !staffMember.is_active })
      .eq('id', staffMember.id)

    if (error) {
      toast.error(`スタッフの${action}に失敗しました`, { description: error.message })
    } else {
      toast.success(`スタッフを${action}しました`)
      onUpdate()
    }
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead className="hidden md:table-cell">スタッフコード</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="hidden lg:table-cell">連絡先</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length > 0 ? (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.staff_code}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        s.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {s.is_active ? '有効' : '無効'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div>{s.email}</div>
                    <div>{s.phone}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">メニューを開く</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>アクション</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStaff(s)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>編集</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStaff(s)
                            setIsQrModalOpen(true)
                          }}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          <span>QRコード表示</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              {s.is_active ? (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                  <span className="text-destructive">無効化</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  <span>有効化</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{s.full_name} を{s.is_active ? '無効化' : '有効化'}しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                {s.is_active
                                  ? 'スタッフを無効化すると、そのスタッフはログインできなくなります。過去のシフト記録は残ります。'
                                  : 'スタッフを有効化すると、再度ログインしてシフト希望などを提出できるようになります。'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggleActive(s)}>
                                続行
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  まだスタッフが登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StaffEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        staff={selectedStaff}
        onUpdate={onUpdate}
      />
      <StaffQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        staff={selectedStaff}
      />
    </>
  )
}
