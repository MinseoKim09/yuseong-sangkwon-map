'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'

type ContentType = 'instagram' | 'naver_blog' | 'kakao'

interface Draft {
  title?: string
  content: string
}

interface GenerateResult {
  drafts: Draft[]
  hashtags?: string[]
}

interface ContentGeneratorProps {
  store: Tables<'stores'> | null
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'instagram', label: '인스타그램' },
  { value: 'naver_blog', label: '네이버 블로그' },
  { value: 'kakao', label: '카카오채널' },
]

export function ContentGenerator({ store }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<ContentType>('instagram')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!store) {
      setError('가게를 먼저 선택해주세요.')
      return
    }

    setError('')
    setResult(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: store.name,
          category: store.category,
          description: description || undefined,
          contentType,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? '콘텐츠 생성에 실패했습니다.')
        return
      }

      const data: GenerateResult = await res.json()
      setResult(data)
    } catch {
      setError('콘텐츠 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1500)
  }

  return (
    <div>
      <div className="mb-4">
        <span className="mb-1 block text-sm font-medium text-gray-700">콘텐츠 유형</span>
        <div className="flex gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setContentType(type.value)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                contentType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          오늘의 메뉴·특이사항 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="예: 오늘의 신메뉴 딸기 라떼 출시, 오후 2시까지 아메리카노 1+1"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading || !store}
        className="mb-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? '생성 중...' : '콘텐츠 생성'}
      </button>

      {result && (
        <div className="space-y-4">
          {result.drafts.map((draft, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4 shadow-sm">
              {draft.title && (
                <h3 className="mb-2 text-sm font-bold text-gray-900">{draft.title}</h3>
              )}
              <p className="whitespace-pre-wrap text-sm text-gray-700">{draft.content}</p>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    draft.title ? `${draft.title}\n\n${draft.content}` : draft.content,
                    index
                  )
                }
                className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {copiedIndex === index ? '복사됨!' : '복사'}
              </button>
            </div>
          ))}

          {result.hashtags && result.hashtags.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">해시태그</h3>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(result.hashtags!.map((tag) => `#${tag}`).join(' '), -1)
                  }
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copiedIndex === -1 ? '복사됨!' : '복사'}
                </button>
              </div>
              <p className="text-sm text-gray-700">
                {result.hashtags.map((tag) => `#${tag}`).join(' ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
