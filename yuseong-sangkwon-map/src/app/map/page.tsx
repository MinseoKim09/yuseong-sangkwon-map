'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { KakaoMap } from '@/components/map/KakaoMap'
import { StoreCard } from '@/components/map/StoreCard'
import { CategoryFilter } from '@/components/map/CategoryFilter'
import { LayerControl, type MapLayer } from '@/components/map/LayerControl'
import { VacancyHeatmap } from '@/components/map/VacancyHeatmap'
import { RadiusAnalysis } from '@/components/map/RadiusAnalysis'
import { useStores } from '@/hooks/useStores'
import { useDistricts } from '@/hooks/useDistricts'
import { analyzeRadius, type RadiusResult } from '@/lib/analysis/radius'
import type { Tables } from '@/types/database'
import type { KakaoMap as KakaoMapInstance } from '@/lib/kakao/types'

function formatHour(hour: number): string {
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${period} ${displayHour}시`
}

export default function MapPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [selectedStore, setSelectedStore] = useState<Tables<'stores'> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')
  const [activeLayer, setActiveLayer] = useState<MapLayer>('none')
  const [timeSlot, setTimeSlot] = useState(9)
  const [mapInstance, setMapInstance] = useState<KakaoMapInstance | null>(null)
  const [analysisCenter, setAnalysisCenter] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [analysisRadius, setAnalysisRadius] = useState<300 | 500 | 1000>(500)
  const [analysisResult, setAnalysisResult] = useState<RadiusResult | null>(null)

  const { stores } = useStores(selectedCategory)
  const { districts } = useDistricts()

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
        <KakaoMap
          stores={stores}
          categories={categories}
          activeLayer={activeLayer}
          onSelectStore={setSelectedStore}
          onMapReady={setMapInstance}
          onMapClick={handleMapClick}
          analysisCenter={analysisCenter}
          analysisRadius={analysisRadius}
        />
      </div>

      <VacancyHeatmap
        map={mapInstance}
        districts={districts}
        visible={activeLayer === 'vacancy'}
      />

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

      <LayerControl activeLayer={activeLayer} onLayerChange={setActiveLayer} />

      <div className="absolute bottom-0 left-0 z-10 w-full bg-white/95 shadow-[0_-1px_4px_rgba(0,0,0,0.08)]">
        {activeLayer === 'population' && (
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="mb-1 text-center text-sm font-medium text-gray-700">
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
