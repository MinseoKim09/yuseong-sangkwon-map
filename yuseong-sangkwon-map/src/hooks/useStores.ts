import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

interface UseStoresResult {
  stores: Tables<'stores'>[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useStores(category?: string | null): UseStoresResult {
  const [stores, setStores] = useState<Tables<'stores'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStores = useCallback(async () => {
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
      setStores(data ?? [])
    }

    setIsLoading(false)
  }, [category])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  return { stores, isLoading, error, refetch: fetchStores }
}
