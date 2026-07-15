import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllYuseongStores } from '@/lib/public-data/client'
import { transformToStoreInsert } from '@/lib/public-data/transform'
import type { TablesInsert } from '@/types/database'

const CHUNK_SIZE = 500

export async function POST(request: Request) {
  console.log('[sync] 시작')
  console.log('[sync] PUBLIC_DATA_API_KEY:', process.env.PUBLIC_DATA_API_KEY ? '있음' : '없음')
  console.log('[sync] SYNC_SECRET_KEY:', process.env.SYNC_SECRET_KEY ? '있음' : '없음')

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

    // 로그인 세션 없이 호출되는 배치 라우트이므로 RLS를 우회하는 서비스 롤 클라이언트를 사용한다.
    // 이 키는 절대 NEXT_PUBLIC_ 접두사를 붙이지 말고 이 라우트 밖에서 재사용하지 않는다.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
    console.error('[sync] 오류:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
