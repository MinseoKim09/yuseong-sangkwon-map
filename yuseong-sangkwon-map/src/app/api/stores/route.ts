import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json()

  const insertData: TablesInsert<'stores'> = {
    owner_id: user.id,
    name: body.name,
    category: body.category,
    address: body.address,
    road_address: body.road_address,
    lat: body.lat,
    lng: body.lng,
    phone: body.phone ?? null,
    description: body.description ?? null,
    image_url: body.image_url ?? null,
    source: 'user',
  }

  const { data, error } = await supabase
    .from('stores')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
