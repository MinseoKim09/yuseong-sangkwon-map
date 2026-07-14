import type { TablesInsert } from '@/types/database'
import type { PublicDataStore } from './types'

// 공공데이터 중분류명(indsMclsNm)에 포함된 키워드 → categories.code 매핑
const CATEGORY_KEYWORD_MAP: Record<string, string> = {
  한식: 'restaurant',
  중식: 'restaurant',
  일식: 'restaurant',
  양식: 'restaurant',
  분식: 'restaurant',
  커피: 'cafe',
  카페: 'cafe',
  음료: 'cafe',
  미용실: 'beauty',
  이발소: 'beauty',
  네일: 'beauty',
  편의점: 'retail',
  슈퍼마켓: 'retail',
  소매: 'retail',
  학원: 'academy',
  교육: 'academy',
  병원: 'medical',
  의원: 'medical',
  약국: 'medical',
  치과: 'medical',
}

export function mapCategory(indsMclsNm: string): string {
  const matchedKeyword = Object.keys(CATEGORY_KEYWORD_MAP).find((keyword) =>
    indsMclsNm.includes(keyword)
  )

  return matchedKeyword ? CATEGORY_KEYWORD_MAP[matchedKeyword] : 'other'
}

export function transformToStoreInsert(
  raw: PublicDataStore
): TablesInsert<'stores'> | null {
  if (!raw.bizesNm) return null

  const lat = parseFloat(raw.lat)
  const lng = parseFloat(raw.lon)

  if (!raw.lat || !raw.lon || Number.isNaN(lat) || Number.isNaN(lng) || lat === 0 || lng === 0) {
    return null
  }

  return {
    name: raw.bizesNm + (raw.brchNm ? ` ${raw.brchNm}` : ''),
    category: mapCategory(raw.indsMclsNm),
    address: raw.lnoAdr,
    road_address: raw.rdnmAdr || raw.lnoAdr,
    lat,
    lng,
    phone: null,
    is_vacant: false,
    source: 'public_data',
    owner_id: null,
  }
}
