import { Header } from '@/components/shared/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/10 px-4 py-8">
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  )
}
