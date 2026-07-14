import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchAllYuseongStores } from '@/lib/public-data/client'
import { transformToStoreInsert } from '@/lib/public-data/transform'
import type { TablesInsert } from '@/types/database'

const CHUNK_SIZE = 500

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (authHeader !== `Bearer ${process.env.SYNC_SECRET_KEY}`) {
    return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 })
  }

  try {
    const rawStores = await fetchAllYuseongStores()

    const storesToInsert = rawStores
      .map(transformToStoreInsert)
      .filter((store): store is TablesInsert<'stores'> => store !== null)

    const skipped = rawStores.length - storesToInsert.length

    const supabase = await createClient()

    // source='public_data' 행을 전량 교체하는 방식으로 중복을 방지한다
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('source', 'public_data')

    if (deleteError) {
      throw deleteError
    }

    let inserted = 0

    for (let i = 0; i < storesToInsert.length; i += CHUNK_SIZE) {
      const chunk = storesToInsert.slice(i, i + CHUNK_SIZE)
      const { error: insertError } = await supabase.from('stores').insert(chunk)

      if (insertError) {
        throw insertError
      }

      inserted += chunk.length
    }

    return NextResponse.json({
      message: '동기화 완료',
      inserted,
      skipped,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '동기화 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
