'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthInput, AuthButton } from '@/components/ui/AuthForm'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // 세션 쿠키가 완전히 설정될 때까지 잠깐 대기
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/map')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <p className="mb-6 text-center text-sm text-slate-500">🗺️ 유성구 상권지도</p>
        <h1 className="mb-6 text-center text-xl font-bold text-slate-900">로그인</h1>

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <AuthInput
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <AuthButton type="submit" isLoading={isLoading}>
            로그인
          </AuthButton>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
