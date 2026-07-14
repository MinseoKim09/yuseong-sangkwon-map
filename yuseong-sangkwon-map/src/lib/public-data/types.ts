// 소상공인시장진흥공단 상권분석 API(storeListInDong) 응답 타입

export interface PublicDataStore {
  bizesId: string // 사업체 ID
  bizesNm: string // 사업체명
  brchNm: string // 지점명 (없으면 빈 문자열)
  indsLclsCd: string // 대분류 코드
  indsLclsNm: string // 대분류명
  indsMclsCd: string // 중분류 코드
  indsMclsNm: string // 중분류명
  indsSclsCd: string // 소분류 코드
  indsSclsNm: string // 소분류명
  ksicCd: string
  ksicNm: string
  ctprvnCd: string // 시도 코드
  ctprvnNm: string // 시도명
  signguCd: string // 시군구 코드
  signguNm: string // 시군구명
  adongCd: string // 행정동 코드
  adongNm: string // 행정동명
  ldongCd: string // 법정동 코드
  ldongNm: string // 법정동명
  lnoCd: string
  plotSctCd: string
  lnoMnno: string
  lnoSlno: string
  lnoAdr: string // 지번 주소
  rdnmCd: string
  rdnm: string // 도로명
  bldMnno: string
  bldSlno: string
  bldMngNo: string
  bldNm: string
  rdnmAdr: string // 도로명 주소
  oldZipCd: string
  zipCd: string
  lon: string // 경도 (string으로 옴)
  lat: string // 위도 (string으로 옴)
  fracDataYmYm: string // 기준 년월
}

export interface PublicDataApiResponse {
  response: {
    body: {
      items: {
        // 결과가 1건이면 단일 객체, 여러 건이면 배열로 내려온다
        item: PublicDataStore[] | PublicDataStore | ''
      }
    }
  }
}
