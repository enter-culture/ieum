# 이음 (ieum) — 무형문화재 숏폼 웹 설계

## 개요

무형문화재를 인스타 릴스 스타일의 가로 스냅 스크롤로 소개하는 Next.js 웹 앱.
영상에 집중할 수 있도록 오버레이는 최소화, 좋아요 파티클 애니메이션으로 참여감 부여.

---

## 화면 구조

```
/                    메인 피드 (풀스크린 가로 스냅 스크롤)
/heritage/[id]       상세 페이지
```

---

## 메인 피드 (`/`)

- 뷰포트 전체를 채우는 `<video>` 풀스크린 카드
- CSS `scroll-snap` + 가로 스크롤로 좌우 스와이프
- 자동재생(음소거), Intersection Observer로 화면 진입 시 재생 / 이탈 시 정지
- 데스크탑: 좌우 화살표 버튼 / 모바일: 터치 스와이프

**카드 오버레이 (최소)**

```
┌─────────────────────────────────┐
│                                 │
│     🐱  🤍  🐶  ← 파티클 상승   │
│                                 │
│         [영상 풀스크린]          │
│                                 │
│  강강술래    🤍 1.2k  [더보기→] │
└─────────────────────────────────┘
```

- 하단 한 줄: 종목명 + 좋아요 버튼(카운트) + 더보기 버튼
- 배경 그라데이션은 최소한으로 (영상 집중)

---

## 좋아요 인터랙션

- 하트 버튼 탭 → 카운트 +1
- 이모지 파티클 (🤍 🐱 🐶 🐾 중 랜덤) 하단에서 위로 둥실 올라가며 사라짐
- 여러 번 연타 가능
- 좋아요 수는 세션 내 메모리 유지 (새로고침 시 초기값으로 리셋, DB 연동은 추후)

---

## 상세 페이지 (`/heritage/[id]`)

- 상단: 영상 고정
- 스크롤 시 상세 정보 노출
  - 정식 명칭, 지정 번호, 지정일, 보유자, 전승 지역, 역사 설명
- 뒤로가기 → 메인 피드 해당 카드 위치 복귀

---

## 데이터 모델

```ts
type Heritage = {
  id: string
  name: string           // 종목명
  category: string       // 국가무형문화재 / 시도무형문화재
  number: string         // 지정번호
  region: string         // 전승 지역
  designatedAt: string   // 지정일
  holders: string[]      // 보유자
  shortDesc: string      // 피드용 (미사용, 향후 확장)
  description: string    // 상세 설명
  videoSrc: string       // /videos/xxx.mp4
  thumbnail: string      // /thumbnails/xxx.jpg
  likes: number          // 초기 좋아요 수
}
```

---

## 파일 구조

```
/public/videos/              영상 파일
/public/thumbnails/          썸네일
/data/heritage.ts            콘텐츠 데이터 (정적)
/app/page.tsx                메인 피드
/app/heritage/[id]/page.tsx  상세 페이지
/components/
  HeritageFeed.tsx           가로 스냅 스크롤 컨테이너
  HeritageCard.tsx           개별 카드 (영상 + 오버레이)
  VideoPlayer.tsx            자동재생 / Intersection Observer
  LikeButton.tsx             좋아요 버튼 + 파티클 트리거
  ParticleEffect.tsx         이모지 파티클 애니메이션
```

---

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- 영상: `<video>` 태그 직접 서빙 (`/public/videos/`)
- 애니메이션: CSS keyframes (파티클 상승)
- 상태: React useState (세션 내 좋아요 수)

---

## 범위 외 (추후)

- 콘텐츠 관리자 페이지
- 좋아요 DB 연동
- 댓글
- 검색 / 필터
