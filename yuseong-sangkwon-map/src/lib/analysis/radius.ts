import type { Tables } from '@/types/database'

export interface RadiusResult {
  totalCount: number
  vacantCount: number
  vacancyRate: number
  categoryBreakdown: {
    code: string
    count: number
  }[]
}

const EARTH_RADIUS_METERS = 6371000

export function getDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))

  return EARTH_RADIUS_METERS * c
}

export function analyzeRadius(
  center: { lat: number; lng: number },
  radiusMeters: number,
  stores: Tables<'stores'>[]
): RadiusResult {
  const storesInRadius = stores.filter(
    (store) => getDistanceMeters(center, { lat: store.lat, lng: store.lng }) <= radiusMeters
  )

  const totalCount = storesInRadius.length
  const vacantCount = storesInRadius.filter((store) => store.is_vacant).length
  const vacancyRate = totalCount === 0 ? 0 : Math.round((vacantCount / totalCount) * 1000) / 10

  const countByCategory = new Map<string, number>()
  storesInRadius.forEach((store) => {
    countByCategory.set(store.category, (countByCategory.get(store.category) ?? 0) + 1)
  })

  const categoryBreakdown = Array.from(countByCategory.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalCount,
    vacantCount,
    vacancyRate,
    categoryBreakdown,
  }
}
