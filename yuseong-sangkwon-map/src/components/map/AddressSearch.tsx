'use client'

import { useState } from 'react'
import '@/lib/kakao/address'

export interface AddressResult {
  address: string
  road_address: string
  lat: number
  lng: number
}

interface AddressSearchProps {
  onSelect: (data: AddressResult) => void
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&q=${encodeURIComponent(query)}`
  )
  const results: { lat: string; lon: string }[] = await res.json()
  const first = results[0]

  if (!first) return null

  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const handleClick = () => {
    setError('')

    new window.daum.Postcode({
      oncomplete: async (data) => {
        setIsSearching(true)

        try {
          const coords = await geocode(data.roadAddress || data.address)

          if (!coords) {
            setError('주소의 좌표를 찾을 수 없습니다. 다른 주소로 시도해주세요.')
            return
          }

          onSelect({
            address: data.address,
            road_address: data.roadAddress,
            lat: coords.lat,
            lng: coords.lng,
          })
        } catch {
          setError('좌표 조회 중 오류가 발생했습니다.')
        } finally {
          setIsSearching(false)
        }
      },
    }).open()
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isSearching}
        className="whitespace-nowrap rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSearching ? '좌표 조회 중...' : '주소 검색'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
