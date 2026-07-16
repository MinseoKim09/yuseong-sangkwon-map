'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { StoreCard } from '@/components/map/StoreCard'
import { CategoryFilter } from '@/components/map/CategoryFilter'
import { LayerControl, type MapLayer } from '@/components/map/LayerControl'
import { RadiusAnalysis } from '@/components/map/RadiusAnalysis'
import { useStores } from '@/hooks/useStores'
import { useCategories } from '@/hooks/useCategories'
import { useDistricts } from '@/hooks/useDistricts'
import { analyzeRadius, type RadiusResult } from '@/lib/analysis/radius'
import type { Tables } from '@/types/database'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false })
const VacancyHeatmap = dynamic(
  () => import('@/components/map/VacancyHeatmap').then((mod) => mod.VacancyHeatmap),
  { ssr: false }
)
const PopulationHeatmap = dynamic(
  () => import('@/components/map/PopulationHeatmap').then((mod) => mod.PopulationHeatmap),
  { ssr: false }
)

function formatHour(hour: number): string {
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${period} ${displayHour}시`
}

export default function MapPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<Tables<'stores'> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')
  const [activeLayer, setActiveLayer] = useState<MapLayer>('none')
  const [timeSlot, setTimeSlot] = useState(9)
  const [analysisCenter, setAnalysisCenter] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [analysisRadius, setAnalysisRadius] = useState<300 | 500 | 1000>(500)
  const [analysisResult, setAnalysisResult] = useState<RadiusResult | null>(null)

  const { stores } = useStores(selectedCategory)
  const { categories } = useCategories()
  const { districts } = useDistricts()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch('/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }, [router])

  const handleRegisterClick = useCallback(() => {
    console.log('가게 등록 클릭, user:', user)

    if (user) {
      router.push('/stores/new')
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleMarketingClick = useCallback(() => {
    if (user) {
      router.push('/marketing')
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleMapClick = useCallback(
    (latlng: { lat: number; lng: number }) => {
      setAnalysisCenter(latlng)
      setAnalysisResult(analyzeRadius(latlng, analysisRadius, stores))
    },
    [analysisRadius, stores]
  )

  const handleRadiusChange = useCallback(
    (r: 300 | 500 | 1000) => {
      setAnalysisRadius(r)
      if (analysisCenter) {
        setAnalysisResult(analyzeRadius(analysisCenter, r, stores))
      }
    },
    [analysisCenter, stores]
  )

  const handleAnalysisClose = useCallback(() => {
    setAnalysisCenter(null)
    setAnalysisResult(null)
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <LeafletMap
          stores={stores}
          categories={categories}
          activeLayer={activeLayer}
          onSelectStore={setSelectedStore}
          onMapClick={handleMapClick}
          analysisCenter={analysisCenter}
          analysisRadius={analysisRadius}
          timeSlot={timeSlot}
        >
          <VacancyHeatmap districts={districts} visible={activeLayer === 'vacancy'} />
          <PopulationHeatmap
            districts={districts}
            timeSlot={timeSlot}
            visible={activeLayer === 'population'}
          />
        </LeafletMap>
      </div>

      <header className="absolute left-0 top-0 z-[1001] flex h-14 w-full items-center justify-between bg-white px-4 shadow-sm">
        <span className="text-lg font-bold text-blue-600">유성구 상권지도</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRegisterClick}
            disabled={isAuthLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            가게 등록
          </button>
          <button
            type="button"
            onClick={handleMarketingClick}
            disabled={isAuthLoading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            AI 마케팅
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            로그아웃
          </button>
        </div>
      </header>

      <LayerControl activeLayer={activeLayer} onLayerChange={setActiveLayer} />

      <div className="absolute bottom-0 left-0 z-[1001] w-full">
        {activeLayer === 'population' && (
          <div className="border-b border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className="mb-1 text-center text-sm font-medium text-slate-700">
              {formatHour(timeSlot)}
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={timeSlot}
              onChange={(e) => setTimeSlot(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

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

      <RadiusAnalysis
        center={analysisCenter}
        radiusMeters={analysisRadius}
        onRadiusChange={handleRadiusChange}
        result={analysisResult}
        categories={categories}
        onClose={handleAnalysisClose}
      />
    </div>
  )
}
