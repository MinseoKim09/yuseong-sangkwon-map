// Daum(카카오) 우편번호 서비스 전역 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void
      }) => { open: () => void }
    }
  }
}

interface DaumPostcodeResult {
  address: string
  roadAddress: string
  x: string // 경도 (string으로 옴)
  y: string // 위도 (string으로 옴)
}

export {}
