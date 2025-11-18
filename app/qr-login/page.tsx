'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function QRLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleQRLogin = async () => {
      const token = searchParams?.get('token')

      if (!token) {
        setStatus('error')
        setMessage('無効なQRコードです')
        return
      }

      try {
        const supabase = createClient()

        // トークンからスタッフ情報を取得
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('qr_token', token)
          .single()

        if (staffError || !staffData) {
          setStatus('error')
          setMessage('スタッフ情報が見つかりません')
          return
        }

        // スタッフに関連付けられたユーザーがあるか確認
        if (staffData.user_id) {
          // 既存ユーザーでログイン
          setStatus('success')
          setMessage(`${staffData.full_name}さん、ようこそ！`)
          setTimeout(() => {
            router.push('/staff/dashboard')
          }, 1500)
        } else {
          // ユーザーがまだ作成されていない場合は、セッションストレージにスタッフIDを保存
          sessionStorage.setItem('qr_staff_id', staffData.id)
          sessionStorage.setItem('qr_staff_name', staffData.full_name)

          setStatus('success')
          setMessage(`${staffData.full_name}さん、初回ログインです。`)
          setTimeout(() => {
            router.push('/staff/dashboard')
          }, 1500)
        }
      } catch (error) {
        setStatus('error')
        setMessage('ログインに失敗しました')
        console.error(error)
      }
    }

    handleQRLogin()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg text-muted-foreground">ログイン中...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
            </div>
            <h2 className="text-2xl font-bold text-green-600">ログイン成功！</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">ダッシュボードに移動します...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600">ログイン失敗</h2>
            <p className="text-muted-foreground">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              ログインページに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
