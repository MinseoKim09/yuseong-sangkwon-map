import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-2xl font-bold text-gray-800">유성구 상권 지도</h1>
      <p className="text-gray-500">대전 유성구 소상공인을 위한 상권 분석 플랫폼</p>
      <div className="flex gap-3 mt-4">
        <Link
          href="/auth/login"
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          로그인
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          회원가입
        </Link>
      </div>
    </main>
  )
}
