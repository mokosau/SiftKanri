'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import type { RequestType, ShiftRequest } from '@/types'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  date: string | null
  existingRequest: ShiftRequest | null
  onSubmit: (data: any) => Promise<void>
}

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, date, existingRequest, onSubmit }) => {
  const [requestType, setRequestType] = useState<RequestType>('available')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (existingRequest) {
      setRequestType(existingRequest.request_type as RequestType)
      setStartTime(existingRequest.preferred_start_time || '09:00')
      setEndTime(existingRequest.preferred_end_time || '17:00')
      setNotes(existingRequest.notes || '')
    } else {
      // Reset to default for new request
      setRequestType('available')
      setStartTime('09:00')
      setEndTime('17:00')
      setNotes('')
    }
  }, [existingRequest, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const data = {
      request_date: date,
      request_type: requestType,
      preferred_start_time: requestType === 'preferred_time' ? startTime : null,
      preferred_end_time: requestType === 'preferred_time' ? endTime : null,
      notes: notes,
      status: 'pending',
      id: existingRequest?.id // Pass id for updates
    }
    await onSubmit(data)
    setSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {new Date(date || '').toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} の希望
          </DialogTitle>
          <DialogDescription>
            この日のシフト希望を提出・編集してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="available" />
                <Label htmlFor="available">出勤可能</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unavailable" id="unavailable" />
                <Label htmlFor="unavailable">出勤不可</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preferred_time" id="preferred_time" />
                <Label htmlFor="preferred_time">時間指定</Label>
              </div>
            </RadioGroup>

            {requestType === 'preferred_time' && (
              <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">開始時間</Label>
                  <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">終了時間</Label>
                  <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="遅れて出勤する場合など" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '送信中...' : '希望を送信'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
