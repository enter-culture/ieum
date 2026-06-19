import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '이음 — 무형문화재',
  description: '우리 무형문화재를 숏폼으로 만나보세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="overflow-hidden bg-black">{children}</body>
    </html>
  )
}
