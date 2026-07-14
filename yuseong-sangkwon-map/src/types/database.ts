export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'owner' | 'entrepreneur' | 'admin'
          name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'owner' | 'entrepreneur' | 'admin'
          name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'owner' | 'entrepreneur' | 'admin'
          name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          code: string
          label: string
          color: string
        }
        Insert: {
          code: string
          label: string
          color: string
        }
        Update: {
          code?: string
          label?: string
          color?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          category: string
          address: string
          road_address: string
          lat: number
          lng: number
          phone: string | null
          is_vacant: boolean
          image_url: string | null
          description: string | null
          business_hours: Json | null
          source: 'user' | 'public_data'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          category: string
          address: string
          road_address: string
          lat: number
          lng: number
          phone?: string | null
          is_vacant?: boolean
          image_url?: string | null
          description?: string | null
          business_hours?: Json | null
          source?: 'user' | 'public_data'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          category?: string
          address?: string
          road_address?: string
          lat?: number
          lng?: number
          phone?: string | null
          is_vacant?: boolean
          image_url?: string | null
          description?: string | null
          business_hours?: Json | null
          source?: 'user' | 'public_data'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stores_owner_id_fkey'
            columns: ['owner_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stores_category_fkey'
            columns: ['category']
            referencedRelation: 'categories'
            referencedColumns: ['code']
          },
        ]
      }
      districts: {
        Row: {
          id: string
          name: string
          vacancy_rate: number
          total_stores: number
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          vacancy_rate?: number
          total_stores?: number
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          vacancy_rate?: number
          total_stores?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<
  T extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][T]['Row']

export type TablesInsert<
  T extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][T]['Insert']

export type TablesUpdate<
  T extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][T]['Update']
