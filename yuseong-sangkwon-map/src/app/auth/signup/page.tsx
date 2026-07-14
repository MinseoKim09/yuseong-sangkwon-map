'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthInput, AuthButton } from '@/components/ui/AuthForm'

type SignupRole = 'owner' | 'entrepreneur'

export default function SignupPage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<SignupRole>('owner')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-gray-900">가입 신청 완료</h1>
          <p className="text-sm text-gray-600">이메일을 확인해주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">회원가입</h1>

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />

          <div className="mb-4">
            <span className="mb-1 block text-sm font-medium text-gray-700">역할</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={role === 'owner'}
                  onChange={() => setRole('owner')}
                />
                소상공인
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="role"
                  value="entrepreneur"
                  checked={role === 'entrepreneur'}
                  onChange={() => setRole('entrepreneur')}
                />
                예비창업자
              </label>
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <AuthButton type="submit" isLoading={isLoading}>
            회원가입
          </AuthButton>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
