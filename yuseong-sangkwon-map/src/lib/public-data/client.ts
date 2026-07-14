import type { PublicDataApiResponse, PublicDataStore } from './types'

const API_ENDPOINT = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong'
const FETCH_TIMEOUT_MS = 10_000

// 유성구 14개 행정동 법정동코드
export const YUSEONG_DONG_CODES: Record<string, string> = {
  관평동: '3020011700',
  구즉동: '3020011600',
  노은1동: '3020011300',
  노은2동: '3020011400',
  노은3동: '3020011500',
  봉명1동: '3020010300',
  '봉명2·구암동': '3020010400',
  신성동: '3020011200',
  온천1동: '3020010100',
  온천2동: '3020010200',
  원신흥동: '3020010600',
  전민동: '3020011100',
  진잠동: '3020012100',
  하기동: '3020011000',
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchStoresByDong(dongCode: string): Promise<PublicDataStore[]> {
  const params = new URLSearchParams({
    serviceKey: process.env.PUBLIC_DATA_API_KEY ?? '',
    pageNo: '1',
    numOfRows: '1000',
    divId: 'adongCd',
    key: dongCode,
    type: 'json',
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`공공데이터 API 요청 실패 (${dongCode}): ${res.status}`)
    }

    const data: PublicDataApiResponse = await res.json()
    const item = data.response?.body?.items?.item

    if (!item) return []

    return Array.isArray(item) ? item : [item]
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchAllYuseongStores(): Promise<PublicDataStore[]> {
  const allStores: PublicDataStore[] = []
  const dongCodes = Object.values(YUSEONG_DONG_CODES)

  for (let i = 0; i < dongCodes.length; i++) {
    const stores = await fetchStoresByDong(dongCodes[i])
    allStores.push(...stores)

    // API rate limit 방지
    if (i < dongCodes.length - 1) {
      await delay(300)
    }
  }

  return allStores
}
