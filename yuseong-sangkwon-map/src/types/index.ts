export type UserRole = 'owner' | 'entrepreneur' | 'admin'

export type StoreCategory =
  | 'restaurant'
  | 'cafe'
  | 'beauty'
  | 'retail'
  | 'academy'
  | 'medical'
  | 'other'

export interface Store {
  id: string
  name: string
  category: StoreCategory
  address: string
  road_address: string
  lat: number
  lng: number
  phone: string | null
  is_vacant: boolean
  image_url: string | null
  owner_id: string | null
  created_at: string
}

export interface District {
  id: string
  name: string           // 예: 봉명동, 온천1동
  vacancy_rate: number   // 공실률 0~100
}

export interface MapLayer {
  type: 'category' | 'vacancy' | 'population'
  label: string
}

export interface RadiusAnalysis {
  center: { lat: number; lng: number }
  radius: number         // 300 | 500 | 1000 (m)
  total_stores: number
  vacant_count: number
  vacancy_rate: number
  category_breakdown: Record<StoreCategory, number>
}
