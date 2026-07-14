import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

interface UseDistrictsResult {
  districts: Tables<'districts'>[]
  isLoading: boolean
}

export function useDistricts(): UseDistrictsResult {
  const [districts, setDistricts] = useState<Tables<'districts'>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('districts')
      .select('*')
      .then(({ data }) => {
        setDistricts(data ?? [])
        setIsLoading(false)
      })
  }, [])

  return { districts, isLoading }
}
