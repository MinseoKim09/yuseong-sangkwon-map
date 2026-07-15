'use client'

import { Circle, Popup } from 'react-leaflet'
import type { Tables } from '@/types/database'
import { DONG_CENTERS } from '@/lib/map/dongCenters'

interface PopulationHeatmapProps {
  districts: Tables<'districts'>[]
  timeSlot: number
  visible: boolean
}

function getHourlyValue(hourlyPopulation: Tables<'districts'>['hourly_population'], hour: number): number {
  if (!Array.isArray(hourlyPopulation)) return 0
  const value = hourlyPopulation[hour]
  return typeof value === 'number' ? value : 0
}

function populationColor(ratio: number): string {
  if (ratio <= 0.25) return '#BFDBFE'
  if (ratio <= 0.5) return '#60A5FA'
  if (ratio <= 0.75) return '#2563EB'
  return '#1E3A8A'
}

export function PopulationHeatmap({ districts, timeSlot, visible }: PopulationHeatmapProps) {
  if (!visible) return null

  const maxValue = Math.max(
    ...districts.map((d) => getHourlyValue(d.hourly_population, timeSlot)),
    1
  )

  return (
    <>
      {districts.map((district) => {
        const center = DONG_CENTERS[district.name]
        if (!center) return null

        const value = getHourlyValue(district.hourly_population, timeSlot)
        const ratio = value / maxValue
        const color = populationColor(ratio)

        return (
          <Circle
            key={district.id}
            center={[center.lat, center.lng]}
            radius={250 + ratio * 500}
            pathOptions={{
              color,
              weight: 1,
              fillColor: color,
              fillOpacity: 0.45,
            }}
          >
            <Popup>
              {district.name} {timeSlot}시 유동인구 약 {value.toLocaleString()}명
            </Popup>
          </Circle>
        )
      })}
    </>
  )
}
