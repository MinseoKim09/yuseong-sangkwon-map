// 카카오 맵 SDK 전역 타입 선언
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker
        InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow
        event: {
          addListener: (target: unknown, type: string, handler: () => void) => void
        }
      }
    }
  }
}

export interface KakaoMapOptions {
  center: KakaoLatLng
  level: number
}

export interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void
  getCenter: () => KakaoLatLng
  getLevel: () => number
}

export interface KakaoLatLng {
  getLat: () => number
  getLng: () => number
}

export interface KakaoMarkerOptions {
  position: KakaoLatLng
  map?: KakaoMap
  title?: string
}

export interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void
}

export interface KakaoInfoWindowOptions {
  content: string
  removable?: boolean
}

export interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void
  close: () => void
}

export {}
