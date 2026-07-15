'use client'

import { Circle, Popup } from 'react-leaflet'
import type { Tables } from '@/types/database'
import { DONG_CENTERS } from '@/lib/map/dongCenters'

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
