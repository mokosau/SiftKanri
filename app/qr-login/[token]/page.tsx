import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

// This Server Component handles the entire QR login flow.
export default async function QrLoginPage({ params }: { params: { token: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { token } = params
    if (!token) {
      throw new Error('QRトークンが見つかりません。')
    }

    // Use the service_role client to bypass RLS for the token lookup
    // This requires a separate admin client instance.
    const supabaseAdmin = createClient(cookieStore, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
            }
        }
    })


    // 1. Validate token against the staff table
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .select('user_id, is_active')
      .eq('qr_token', token)
      .single()

    if (staffError || !staff || !staff.is_active || !staff.user_id) {
      throw new Error('QRコードが無効か、アカウントがアクティブではありません。')
    }

    // 2. Set the session for the found user
    const { error: sessionError } = await supabase.auth.admin.setUserSession(
        (await supabase.auth.admin.getUserById(staff.user_id)).data.user.id
    )
    if (sessionError) {
      throw new Error('セッションの設定に失敗しました。')
    }


  } catch (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>ログインエラー</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : '不明なエラーが発生しました。'}
            <br />
            <a href="/" className="mt-2 inline-block text-sm underline">トップページに戻る</a>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 3. Redirect to the dashboard on successful session creation
  redirect('/staff/dashboard')
}
