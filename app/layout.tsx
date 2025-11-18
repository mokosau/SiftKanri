import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'シンプルシフト管理',
  description: '5分で始められる、誰でも使えるシフト管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
