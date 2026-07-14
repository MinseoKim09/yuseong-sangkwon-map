'use client'

import { useEffect, useRef, useState } from 'react'
import type { Tables } from '@/types/database'
import type { KakaoMap as KakaoMapInstance, KakaoMarker } from '@/lib/kakao/types'

interface KakaoMapProps {
  stores: Tables<'stores'>[]
  onSelectStore: (store: Tables<'stores'>) => void
}

const YUSEONG_CENTER = { lat: 36.3624, lng: 127.3564 }

export function KakaoMap({ stores, onSelectStore }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const markersRef = useRef<KakaoMarker[]>([])
  const [isMapReady, setIsMapReady] = useState(false)

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
    })
  }, [])

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    stores.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng)
      const marker = new window.kakao.maps.Marker({
        position,
        map: mapRef.current!,
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        onSelectStore(store)
      })

      markersRef.current.push(marker)
    })
  }, [stores, isMapReady, onSelectStore])

  return <div ref={containerRef} className="h-full w-full" />
}
