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

const DRAFT_NUMBERS = ['①', '②', '③', '④', '⑤']

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
    <>
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex border-b border-slate-200">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setContentType(type.value)}
              className={`-mb-px px-4 py-2 text-sm font-medium transition-colors ${
                contentType === type.value
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            오늘의 메뉴·특이사항 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="예: 오늘의 신메뉴 딸기 라떼 출시, 오후 2시까지 아메리카노 1+1"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !store}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : '콘텐츠 생성'}
        </button>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            AI가 콘텐츠를 생성하고 있어요...
          </div>
        )}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          {result.drafts.map((draft, index) => (
            <div key={index} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-lg font-semibold text-blue-600">
                    {DRAFT_NUMBERS[index] ?? index + 1}
                  </span>
                  {draft.title && (
                    <h3 className="text-sm font-bold text-slate-900">{draft.title}</h3>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      draft.title ? `${draft.title}\n\n${draft.content}` : draft.content,
                      index
                    )
                  }
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {copiedIndex === index ? '복사됨 ✓' : '복사 📋'}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{draft.content}</p>
            </div>
          ))}

          {result.hashtags && result.hashtags.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">해시태그</h3>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(result.hashtags!.map((tag) => `#${tag}`).join(' '), -1)
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {copiedIndex === -1 ? '복사됨 ✓' : '복사 📋'}
                </button>
              </div>
              <p className="text-sm text-slate-700">
                {result.hashtags.map((tag) => `#${tag}`).join(' ')}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
