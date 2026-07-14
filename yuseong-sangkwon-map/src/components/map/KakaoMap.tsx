'use client'

import { useEffect, useRef, useState } from 'react'
import type { Tables } from '@/types/database'
import type {
  KakaoMap as KakaoMapInstance,
  KakaoMarker,
  KakaoCustomOverlay,
} from '@/lib/kakao/types'
import type { MapLayer } from './LayerControl'

interface KakaoMapProps {
  stores: Tables<'stores'>[]
  categories: Tables<'categories'>[]
  activeLayer: MapLayer
  onSelectStore: (store: Tables<'stores'>) => void
  onMapReady?: (map: KakaoMapInstance) => void
}

const YUSEONG_CENTER = { lat: 36.3624, lng: 127.3564 }

function createCategoryOverlayContent(color: string): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width: 12px; height: 12px; border-radius: 50%;
    background: ${color}; border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;
  `
  return el
}

function createVacantOverlayContent(): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width: 14px; height: 14px; border-radius: 50%;
    background: #EF4444; border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4); cursor: pointer;
  `
  return el
}

export function KakaoMap({
  stores,
  categories,
  activeLayer,
  onSelectStore,
  onMapReady,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const markersRef = useRef<KakaoMarker[]>([])
  const overlaysRef = useRef<KakaoCustomOverlay[]>([])
  const [isMapReady, setIsMapReady] = useState(false)

  const onMapReadyRef = useRef(onMapReady)
  useEffect(() => {
    onMapReadyRef.current = onMapReady
  }, [onMapReady])

  useEffect(() => {
    if (!window.kakao || !containerRef.current) return

    window.kakao.maps.load(() => {
      if (!containerRef.current) return

      const center = new window.kakao.maps.LatLng(YUSEONG_CENTER.lat, YUSEONG_CENTER.lng)

      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: 5,
      })

      setIsMapReady(true)
      onMapReadyRef.current?.(mapRef.current)
    })
  }, [])

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
    overlaysRef.current.forEach((overlay) => overlay.setMap(null))
    overlaysRef.current = []

    stores.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng)

      if (activeLayer === 'category') {
        const category = categories.find((c) => c.code === store.category)
        const content = createCategoryOverlayContent(category?.color ?? '#9CA3AF')
        content.addEventListener('click', () => onSelectStore(store))

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          zIndex: 2,
        })
        overlay.setMap(mapRef.current!)
        overlaysRef.current.push(overlay)
        return
      }

      if (activeLayer === 'vacancy' && store.is_vacant) {
        const content = createVacantOverlayContent()
        content.addEventListener('click', () => onSelectStore(store))

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          zIndex: 3,
        })
        overlay.setMap(mapRef.current!)
        overlaysRef.current.push(overlay)
        return
      }

      const marker = new window.kakao.maps.Marker({
        position,
        map: mapRef.current!,
        opacity: activeLayer === 'vacancy' ? 0.3 : 1,
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        onSelectStore(store)
      })

      markersRef.current.push(marker)
    })
  }, [stores, isMapReady, onSelectStore, activeLayer, categories])

  return <div ref={containerRef} className="h-full w-full" />
}
