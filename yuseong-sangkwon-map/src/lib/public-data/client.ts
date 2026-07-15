import type { PublicDataStore } from './types'

export async function fetchAllYuseongStores(): Promise<PublicDataStore[]> {
  const allStores: PublicDataStore[] = []
  let pageNo = 1
  const numOfRows = 1000

  while (true) {
    const url = new URL('https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong')
    url.searchParams.append('serviceKey', process.env.PUBLIC_DATA_API_KEY!)
    url.searchParams.append('pageNo', String(pageNo))
    url.searchParams.append('numOfRows', String(numOfRows))
    url.searchParams.append('divId', 'signguCd')
    url.searchParams.append('key', '30200')
    url.searchParams.append('type', 'json')

    console.log('[public-data] URL:', url.toString())

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url.toString(), { signal: controller.signal })
    clearTimeout(timeout)

    const data = await response.json()
    console.log('[public-data] 응답:', JSON.stringify(data).slice(0, 300))

    const items = data?.body?.items
    if (!items) break

    const arr = Array.isArray(items) ? items : [items]
    allStores.push(...arr)

    if (arr.length < numOfRows) break
    pageNo++

    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return allStores
}
