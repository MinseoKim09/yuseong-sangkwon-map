import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-b from-blue-50 to-emerald-50 px-4 py-24 text-center">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          대전 유성구 상권 플랫폼
        </span>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">유성구 상권 지도</h1>
        <p className="mt-3 text-lg text-slate-500">
          18,000개 이상의 유성구 소상공인 데이터를 한눈에
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/map"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            지도 보기
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            로그인
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">🗺️</div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">상권 지도</h3>
            <p className="mt-1 text-sm text-slate-500">유성구 18,000+ 가게를 지도에서 탐색</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">📊</div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">반경 분석</h3>
            <p className="mt-1 text-sm text-slate-500">원하는 위치의 상권 현황을 즉시 분석</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">✨</div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">AI 마케팅</h3>
            <p className="mt-1 text-sm text-slate-500">AI가 SNS 콘텐츠를 자동으로 생성</p>
          </div>
        </div>
      </section>
    </main>
  )
}
