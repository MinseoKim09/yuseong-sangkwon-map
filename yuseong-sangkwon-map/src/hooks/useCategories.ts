import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

interface UseCategoriesResult {
  categories: Tables<'categories'>[]
  isLoading: boolean
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .then(({ data }) => {
        if (data) setCategories(data)
        setIsLoading(false)
      })
  }, [])

  return { categories, isLoading }
}
