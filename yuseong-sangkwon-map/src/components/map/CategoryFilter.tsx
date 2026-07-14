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
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          isAllSelected
            ? 'bg-gray-900 text-white'
            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
