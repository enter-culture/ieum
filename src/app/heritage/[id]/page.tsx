import { notFound } from 'next/navigation'
import Link from 'next/link'
import { heritageList } from '@/data/heritage'

interface Props {
  params: { id: string }
}

export default function HeritagePage({ params }: Props) {
  const heritage = heritageList.find(h => h.id === params.id)
  if (!heritage) notFound()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <Link href="/explore" aria-label="뒤로" className="text-white text-2xl leading-none">
          ←
        </Link>
        <h1 className="text-base font-bold">{heritage.name}</h1>
      </div>

      {/* 영상 */}
      <video
        src={heritage.videoSrc}
        className="w-full aspect-video object-cover"
        controls
        playsInline
      />

      {/* 상세 정보 */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/50 text-xs mb-1">지정 구분</p>
            <p className="text-sm">{heritage.category}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">지정 번호</p>
            <p className="text-sm">{heritage.number}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">지정일</p>
            <p className="text-sm">{heritage.designatedAt}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">전승 지역</p>
            <p className="text-sm">{heritage.region}</p>
          </div>
        </div>

        {heritage.holders.length > 0 && (
          <div>
            <p className="text-white/50 text-xs mb-1">보유자</p>
            <p className="text-sm">{heritage.holders.join(', ')}</p>
          </div>
        )}

        <div>
          <p className="text-white/50 text-xs mb-2">소개</p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-white/90">
            {heritage.description}
          </p>
        </div>
      </div>
    </div>
  )
}
