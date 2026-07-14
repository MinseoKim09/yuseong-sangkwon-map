'use client'

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

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const handleClick = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        onSelect({
          address: data.address,
          road_address: data.roadAddress,
          lat: parseFloat(data.y),
          lng: parseFloat(data.x),
        })
      },
    }).open()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="whitespace-nowrap rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      주소 검색
    </button>
  )
}
