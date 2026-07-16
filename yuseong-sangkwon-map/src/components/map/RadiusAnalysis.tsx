'use client'

import type { Tables } from '@/types/database'
import type { RadiusResult } from '@/lib/analysis/radius'

interface RadiusAnalysisProps {
  center: { lat: number; lng: number } | null
  radiusMeters: number
  onRadiusChange: (r: 300 | 500 | 1000) => void
  result: RadiusResult | null
  categories: Tables<'categories'>[]
  onClose: () => void
}

const RADIUS_OPTIONS: { value: 300 | 500 | 1000; label: string }[] = [
  { value: 300, label: '300m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
]

export function RadiusAnalysis({
  center,
  radiusMeters,
  onRadiusChange,
  result,
  categories,
  onClose,
}: RadiusAnalysisProps) {
  const maxCount = result
    ? Math.max(...result.categoryBreakdown.map((c) => c.count), 1)
    : 1

  return (
    <div
      className={`fixed left-0 top-0 z-[1001] h-full w-72 overflow-y-auto border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 ${
        center ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {center && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 transition-colors hover:bg-slate-100"
          >
            ✕
          </button>

          <div className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">반경 분석</h2>

            <div className="mb-5 flex gap-2">
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onRadiusChange(option.value)}
                  className={`flex-1 rounded-full px-2 py-1.5 text-sm font-medium transition-colors ${
                    radiusMeters === option.value
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {!result ? (
              <p className="text-sm text-slate-500">클릭한 위치 분석 중...</p>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-xs text-slate-500">총 가게 수</p>
                  <p className="text-3xl font-bold text-blue-600">{result.totalCount}개</p>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-slate-500">공실</p>
                  <p className="text-sm text-slate-700">
                    {result.vacantCount}개
                    <span className="ml-1 font-semibold text-red-600">
                      ({result.vacancyRate}%)
                    </span>
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">업종별 분포</p>
                  <div className="space-y-2">
                    {result.categoryBreakdown.map((item) => {
                      const category = categories.find((c) => c.code === item.code)
                      const widthPercent = (item.count / maxCount) * 100

                      return (
                        <div key={item.code} className="flex items-center gap-2 text-sm">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category?.color ?? '#9CA3AF' }}
                          />
                          <span className="w-16 shrink-0 truncate text-slate-700">
                            {category?.label ?? item.code}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${widthPercent}%`,
                                backgroundColor: category?.color ?? '#9CA3AF',
                              }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-slate-500">
                            {item.count}개
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
