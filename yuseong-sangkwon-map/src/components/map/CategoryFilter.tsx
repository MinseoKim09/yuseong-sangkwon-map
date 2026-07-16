'use client'

import type { Tables } from '@/types/database'

interface CategoryFilterProps {
  categories: Tables<'categories'>[]
  selected: string | null
  onSelect: (code: string | null) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const isAllSelected = selected === null || selected === 'all'

  return (
    <div className="flex h-14 items-center gap-2 overflow-x-auto bg-white px-4 shadow-lg">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          isAllSelected
            ? 'bg-blue-600 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        전체
      </button>

      {categories.map((c) => {
        const isSelected = selected === c.code
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => onSelect(c.code)}
            style={isSelected ? { backgroundColor: c.color, borderColor: c.color } : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? 'text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
