'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useStores } from '@/hooks/useStores'
import { ContentGenerator } from '@/components/marketing/ContentGenerator'

function StoreAndGenerator({ userId }: { userId: string }) {
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const { stores, isLoading } = useStores(null, { ownerId: userId })

  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null

  return (
    <>
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">가게 선택</label>
        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{isLoading ? '불러오는 중...' : '가게를 선택해주세요'}</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        {!isLoading && stores.length === 0 && (
          <p className="mt-1 text-xs text-slate-500">
            등록된 가게가 없습니다. 먼저 가게를 등록해주세요.
          </p>
        )}
      </div>

      <ContentGenerator store={selectedStore} />
    </>
  )
}

export default function MarketingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      setIsAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (isAuthLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">✨ AI 마케팅 어시스턴트</h1>
        <Link
          href="/map"
          className="text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          ← 지도로
        </Link>
      </div>
      <StoreAndGenerator userId={user.id} />
    </div>
  )
}
