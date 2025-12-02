import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">ようこそ！ここからシフトの確認や希望の提出ができます。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* シフト確認カード */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-xl font-semibold">確定シフト</h2>
          <p className="mb-6 text-muted-foreground">
            あなたの確定したシフトをカレンダーで確認できます。
          </p>
          <Button asChild>
            <Link href="/staff/shifts">
              シフトを確認する
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* シフト希望提出カード */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-xl font-semibold">シフト希望</h2>
          <p className="mb-6 text-muted-foreground">
            次回のシフト希望を提出できます。締め切りにご注意ください。
          </p>
          <Button asChild>
            <Link href="/staff/requests">
              希望を提出する
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
