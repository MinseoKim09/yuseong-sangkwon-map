import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '유성구 상권 지도',
  description: '대전 유성구 소상공인을 위한 상권 분석 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
