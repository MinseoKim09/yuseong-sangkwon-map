'use client'

import type { Tables } from '@/types/database'

interface StoreCardProps {
  store: Tables<'stores'> | null
  categories: Tables<'categories'>[]
  onClose: () => void
}

export function StoreCard({ store, categories, onClose }: StoreCardProps) {
  const category = store ? categories.find((c) => c.code === store.category) : undefined

  return (
    <div
      className={`fixed right-0 top-0 z-[1001] h-full w-80 overflow-y-auto border-l border-slate-100 bg-white shadow-xl transition-transform duration-300 ${
        store ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {store && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 transition-colors hover:bg-slate-100"
          >
            ✕
          </button>

          <div className="relative h-48 w-full bg-slate-100">
            {store.is_vacant && (
              <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                공실
              </span>
            )}
            {store.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.image_url}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                등록된 사진 없음
              </div>
            )}
          </div>

          <div className="p-5">
            <h2 className="mt-3 text-lg font-bold text-slate-900">{store.name}</h2>

            {category && (
              <span
                className="mb-3 mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.label}
              </span>
            )}

            <p className="mb-1 text-sm text-slate-500">{store.road_address}</p>

            {store.phone && <p className="mb-1 text-sm text-slate-500">{store.phone}</p>}

            {store.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {store.description}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
