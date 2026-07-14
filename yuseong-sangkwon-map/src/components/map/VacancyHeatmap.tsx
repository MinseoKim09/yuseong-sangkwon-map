'use client'

import { useEffect, useRef } from 'react'
import type { Tables } from '@/types/database'
import type { KakaoMap as KakaoMapInstance, KakaoCustomOverlay } from '@/lib/kakao/types'

const DONG_CENTERS: Record<string, { lat: number; lng: number }> = {
  관평동: { lat: 36.4327, lng: 127.3856 },
  구즉동: { lat: 36.3857, lng: 127.3319 },
  노은1동: { lat: 36.3941, lng: 127.3387 },
  노은2동: { lat: 36.4012, lng: 127.3501 },
  노은3동: { lat: 36.4098, lng: 127.3612 },
  봉명1동: { lat: 36.3598, lng: 127.3441 },
  '봉명2·구암동': { lat: 36.3521, lng: 127.3387 },
  신성동: { lat: 36.3789, lng: 127.3412 },
  온천1동: { lat: 36.3645, lng: 127.3489 },
  온천2동: { lat: 36.3712, lng: 127.3534 },
  원신흥동: { lat: 36.3534, lng: 127.3521 },
  전민동: { lat: 36.4201, lng: 127.3712 },
  진잠동: { lat: 36.3298, lng: 127.2987 },
  하기동: { lat: 36.3734, lng: 127.3198 },
}

interface VacancyHeatmapProps {
  map: KakaoMapInstance | null
  districts: Tables<'districts'>[]
  visible: boolean
}

function vacancyColor(rate: number): string {
  if (rate <= 10) return '#22C55E'
  if (rate <= 30) return '#EAB308'
  return '#EF4444'
}

export function VacancyHeatmap({ map, districts, visible }: VacancyHeatmapProps) {
  const overlaysRef = useRef<KakaoCustomOverlay[]>([])

  useEffect(() => {
    if (!map || !window.kakao) return

    overlaysRef.current.forEach((overlay) => overlay.setMap(null))
    overlaysRef.current = []

    if (!visible) return

    districts.forEach((district) => {
      const center = DONG_CENTERS[district.name]
      if (!center) return

      const position = new window.kakao.maps.LatLng(center.lat, center.lng)
      const color = vacancyColor(district.vacancy_rate)

      const content = document.createElement('div')
      content.style.cssText = `
        padding: 4px 10px;
        border-radius: 9999px;
        background: ${color};
        color: white;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      `
      content.innerText = `${district.name} ${district.vacancy_rate.toFixed(1)}%`

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content,
        zIndex: 5,
      })

      overlay.setMap(map)
      overlaysRef.current.push(overlay)
    })
  }, [map, districts, visible])

  return null
}
