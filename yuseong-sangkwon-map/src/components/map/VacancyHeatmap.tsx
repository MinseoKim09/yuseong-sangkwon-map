'use client'

import { Circle, Popup } from 'react-leaflet'
import type { Tables } from '@/types/database'

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
  districts: Tables<'districts'>[]
  visible: boolean
}

function vacancyColor(rate: number): string {
  if (rate <= 10) return '#22C55E'
  if (rate <= 30) return '#EAB308'
  return '#EF4444'
}

export function VacancyHeatmap({ districts, visible }: VacancyHeatmapProps) {
  if (!visible) return null

  return (
    <>
      {districts.map((district) => {
        const center = DONG_CENTERS[district.name]
        if (!center) return null

        const color = vacancyColor(district.vacancy_rate)

        return (
          <Circle
            key={district.id}
            center={[center.lat, center.lng]}
            radius={400}
            pathOptions={{
              color,
              weight: 1,
              fillColor: color,
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              {district.name} 공실률 {district.vacancy_rate.toFixed(1)}%
            </Popup>
          </Circle>
        )
      })}
    </>
  )
}
