import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

interface UseStoresResult {
  stores: Tables<'stores'>[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const storesCache = new Map<string, Tables<'stores'>[]>()

export function useStores(category?: string | null): UseStoresResult {
  const cacheKey = category ?? 'all'

  const [stores, setStores] = useState<Tables<'stores'>[]>(storesCache.get(cacheKey) ?? [])
  const [isLoading, setIsLoading] = useState(!storesCache.has(cacheKey))
  const [error, setError] = useState<string | null>(null)

  const fetchStores = useCallback(
    async (force = false) => {
      if (!force && storesCache.has(cacheKey)) {
        setStores(storesCache.get(cacheKey)!)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      let query = supabase.from('stores').select('*')

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
      } else {
        const result = data ?? []
        storesCache.set(cacheKey, result)
        setStores(result)
      }

      setIsLoading(false)
    },
    [category, cacheKey]
  )

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const refetch = useCallback(() => {
    fetchStores(true)
  }, [fetchStores])

  return { stores, isLoading, error, refetch }
}
