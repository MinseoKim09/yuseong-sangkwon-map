'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { KakaoMap } from '@/components/map/KakaoMap'
import { StoreCard } from '@/components/map/StoreCard'
import { CategoryFilter } from '@/components/map/CategoryFilter'
import { useStores } from '@/hooks/useStores'
import type { Tables } from '@/types/database'

export default function MapPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [selectedStore, setSelectedStore] = useState<Tables<'stores'> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')

  const { stores } = useStores(selectedCategory)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch('/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }, [router])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <KakaoMap stores={stores} onSelectStore={setSelectedStore} />
      </div>

      <header className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-white/95 px-4 py-3 shadow-sm">
        <span className="text-lg font-bold text-gray-900">유성구 상권 지도</span>
        <div className="flex gap-2">
          <Link
            href="/stores/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            가게 등록
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="absolute bottom-0 left-0 z-10 w-full bg-white/95 shadow-[0_-1px_4px_rgba(0,0,0,0.08)]">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <StoreCard
        store={selectedStore}
        categories={categories}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  )
}
