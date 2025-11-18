'use client'

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ShiftRequest } from '@/types'

interface ShiftRequestCalendarProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  requests: ShiftRequest[]
  onDateClick: (date: Date) => void
}

export function ShiftRequestCalendar({
  currentMonth,
  onMonthChange,
  requests,
  onDateClick,
}: ShiftRequestCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getRequestForDate = (date: Date) => {
    return requests.find((req) => isSameDay(new Date(req.request_date), date))
  }

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'unavailable':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'preferred_time':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'available':
        return '○'
      case 'unavailable':
        return '×'
      case 'preferred_time':
        return '時間指定'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy年M月', { locale: ja })}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const request = getRequestForDate(day)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`relative min-h-[60px] rounded-lg border p-2 text-left transition-colors hover:bg-accent ${
                isToday ? 'border-primary' : 'border-border'
              } ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}`}
            >
              <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(day, 'd')}
              </span>
              {request && (
                <div
                  className={`mt-1 rounded px-1 py-0.5 text-xs ${getRequestTypeColor(request.request_type)}`}
                >
                  {getRequestTypeLabel(request.request_type)}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-green-100 border border-green-300" />
          <span>出勤可能</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-red-100 border border-red-300" />
          <span>出勤不可</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-blue-100 border border-blue-300" />
          <span>時間指定</span>
        </div>
      </div>
    </div>
  )
}
