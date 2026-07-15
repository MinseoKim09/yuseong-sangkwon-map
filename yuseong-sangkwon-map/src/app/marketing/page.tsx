'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">가게 선택</label>
        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">{isLoading ? '불러오는 중...' : '가게를 선택해주세요'}</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        {!isLoading && stores.length === 0 && (
          <p className="mt-1 text-xs text-gray-500">
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
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">AI 마케팅 어시스턴트</h1>
      <StoreAndGenerator userId={user.id} />
    </div>
  )
}
