'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthInput, AuthButton } from '@/components/ui/AuthForm'
import { AddressSearch, type AddressResult } from '@/components/map/AddressSearch'
import { useCategories } from '@/hooks/useCategories'

export default function NewStorePage() {
  const router = useRouter()
  const supabase = createClient()

  const { categories } = useCategories()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddressSelect = (result: AddressResult) => {
    setAddress(result.address)
    setRoadAddress(result.road_address)
    setLat(result.lat)
    setLng(result.lng)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('가게명을 입력해주세요.')
      return
    }
    if (!category) {
      setError('업종을 선택해주세요.')
      return
    }
    if (!address || lat === null || lng === null) {
      setError('주소를 검색해주세요.')
      return
    }

    setIsLoading(true)

    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('로그인이 필요합니다.')
          setIsLoading(false)
          return
        }

        const fileExt = imageFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${fileExt}`

        // 'store-images' 버킷은 Supabase 대시보드에서 public 버킷으로 미리 생성해야 합니다.
        const { error: uploadError } = await supabase.storage
          .from('store-images')
          .upload(path, imageFile)

        if (uploadError) {
          setError(uploadError.message)
          setIsLoading(false)
          return
        }

        const { data } = supabase.storage.from('store-images').getPublicUrl(path)
        imageUrl = data.publicUrl
      }

      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          address,
          road_address: roadAddress,
          lat,
          lng,
          phone: phone || null,
          description: description || null,
          image_url: imageUrl,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? '가게 등록에 실패했습니다.')
        setIsLoading(false)
        return
      }

      router.push('/map')
      router.refresh()
    } catch {
      setError('가게 등록 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">가게 등록</h1>

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="가게명"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">업종</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">선택해주세요</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <AuthInput
          label="전화번호"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">소개</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{description.length}/200</p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">주소</label>
          <div className="flex items-center gap-2">
            <AddressSearch onSelect={handleAddressSelect} />
            <span className="text-sm text-gray-600">
              {roadAddress || address || '주소를 검색해주세요'}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">대표 사진</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-700"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <AuthButton type="submit" isLoading={isLoading}>
          등록하기
        </AuthButton>
      </form>
    </div>
  )
}
