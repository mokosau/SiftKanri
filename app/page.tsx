import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">シンプルシフト管理</h1>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tight">
            5分で始められる
            <br />
            <span className="text-primary">誰でも使える</span>シフト管理
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            複雑な機能は不要。シンプルで使いやすいUIで、スタッフのシフト管理がこれまでになく簡単に。
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90"
            >
              今すぐ始める（無料）
            </Link>
            <Link
              href="#features"
              className="rounded-md border border-input bg-background px-8 py-3 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
            >
              機能を見る
            </Link>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">主な機能</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h4 className="mb-2 text-xl font-semibold">簡単シフト作成</h4>
              <p className="text-muted-foreground">
                直感的なカレンダーUIで、ドラッグ&ドロップでシフトを作成。Excelより圧倒的に速い。
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="mb-2 text-xl font-semibold">スマホ最適化</h4>
              <p className="text-muted-foreground">
                スタッフはスマホから簡単にシフト希望を提出。アプリのインストール不要。
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="mb-2 text-xl font-semibold">QRログイン</h4>
              <p className="text-muted-foreground">
                QRコードを読み取るだけでログイン。パスワードを覚える必要なし。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 料金セクション */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">シンプルな料金</h3>
          <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-card-foreground">
            <div className="mb-4 text-center">
              <p className="text-4xl font-bold">
                ¥100<span className="text-lg font-normal text-muted-foreground">/ユーザー/月</span>
              </p>
            </div>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                無制限のシフト作成
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                スタッフ数無制限
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                メール通知
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                データバックアップ
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-md bg-primary py-3 text-center font-medium text-primary-foreground hover:bg-primary/90"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 シンプルシフト管理. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
