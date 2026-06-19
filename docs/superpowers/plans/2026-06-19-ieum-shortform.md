# 이음 (ieum) 무형문화재 숏폼 웹 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 무형문화재를 인스타 릴스 스타일의 가로 스냅 스크롤로 소개하는 Next.js 웹 앱 구현

**Architecture:** Next.js 14 App Router 기반. 정적 TypeScript 파일로 콘텐츠 관리. `HeritageFeed`가 CSS snap scroll로 전체화면 카드를 가로로 연결하고, `HeritageCard`가 영상·오버레이·좋아요를 담는다. 좋아요 클릭 시 `ParticleEffect`가 이모지를 위로 띄운다. 더보기 클릭 시 `/heritage/[id]` 상세 페이지로 라우팅.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Jest, React Testing Library

## Global Constraints

- Next.js 14 App Router 사용 (`app/` 디렉토리 구조)
- 클라이언트 훅 사용 컴포넌트는 파일 최상단에 `'use client'` 필수
- 영상 파일 위치: `/public/videos/*.mp4` / 썸네일: `/public/thumbnails/*.jpg`
- 좋아요 수는 세션 메모리만 유지 (DB/localStorage 없음)
- 모든 UI 텍스트는 한국어

---

## File Map

```
ieum/
├── app/
│   ├── globals.css                   CSS 애니메이션 + 스크롤바 숨김
│   ├── layout.tsx                    body overflow-hidden 설정
│   ├── page.tsx                      메인 피드 페이지
│   └── heritage/
│       └── [id]/
│           └── page.tsx              상세 페이지
├── components/
│   ├── HeritageFeed.tsx              가로 스냅 스크롤 컨테이너 + 인디케이터
│   ├── HeritageCard.tsx              개별 카드 (영상 + 오버레이)
│   ├── VideoPlayer.tsx               <video> + Intersection Observer 자동재생
│   ├── LikeButton.tsx                하트 버튼 + 카운트
│   └── ParticleEffect.tsx            이모지 파티클 떠오르는 애니메이션
├── data/
│   └── heritage.ts                   Heritage 타입 + 샘플 데이터 3개
├── __tests__/
│   ├── data.test.ts
│   ├── LikeButton.test.tsx
│   ├── ParticleEffect.test.tsx
│   ├── HeritageCard.test.tsx
│   ├── HeritageFeed.test.tsx
│   └── heritage-detail.test.tsx
├── jest.config.ts
├── jest.setup.ts
└── package.json
```

---

### Task 1: 프로젝트 초기화 + 테스트 인프라

**Files:**
- Create: `ieum/` (Next.js 앱 전체)
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `__tests__/smoke.test.ts`

**Interfaces:**
- Produces: `npx jest` 명령으로 테스트 실행 가능한 환경

- [ ] **Step 1: Next.js 앱 생성**

```bash
cd /Users/sinseongsu/Desktop/code/ieum
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint --import-alias "@/*"
```

프롬프트에서 모두 기본값(Enter) 선택.

- [ ] **Step 2: Jest + React Testing Library 설치**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: jest.config.ts 작성**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 4: jest.setup.ts 작성**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: package.json에 test 스크립트 추가**

`package.json`의 `scripts`에:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: 스모크 테스트 작성**

`__tests__/smoke.test.ts`:
```ts
describe('test setup', () => {
  it('runs', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 7: 테스트 실행 확인**

```bash
npm test
```

Expected: `PASS __tests__/smoke.test.ts`

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "chore: initialize Next.js project with Jest setup"
```

---

### Task 2: Heritage 데이터 레이어

**Files:**
- Create: `data/heritage.ts`
- Create: `__tests__/data.test.ts`
- Create: `public/videos/.gitkeep`
- Create: `public/thumbnails/.gitkeep`

**Interfaces:**
- Produces:
  - `Heritage` 타입 (모든 컴포넌트가 import)
  - `heritageList: Heritage[]` (page.tsx, detail page가 import)

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/data.test.ts`:
```ts
import { heritageList } from '@/data/heritage'
import type { Heritage } from '@/data/heritage'

describe('heritageList', () => {
  it('has at least one item', () => {
    expect(heritageList.length).toBeGreaterThan(0)
  })

  it('every item has required fields', () => {
    heritageList.forEach((item: Heritage) => {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.videoSrc).toBeTruthy()
      expect(typeof item.likes).toBe('number')
    })
  })

  it('every id is unique', () => {
    const ids = heritageList.map((h: Heritage) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- data
```

Expected: FAIL (Cannot find module '@/data/heritage')

- [ ] **Step 3: data/heritage.ts 구현**

```ts
export type Heritage = {
  id: string
  name: string
  category: string
  number: string
  region: string
  designatedAt: string
  holders: string[]
  shortDesc: string
  description: string
  videoSrc: string
  thumbnail: string
  likes: number
}

export const heritageList: Heritage[] = [
  {
    id: 'ganggang-sullae',
    name: '강강술래',
    category: '국가무형문화재',
    number: '제8호',
    region: '전라남도 해남·진도',
    designatedAt: '1966년 2월 15일',
    holders: ['박양애', '이길주'],
    shortDesc: '여성들이 손을 잡고 원을 그리며 추는 전통 집단 무용',
    description: `강강술래는 주로 전라남도 해남과 진도 지방에서 전승되어 온 전통 여성 집단 무용입니다.\n\n음력 8월 한가위 밤에 수십 명의 여성들이 손을 잡고 원을 이루어 '강강술래'라는 후렴구를 부르며 춤을 춥니다. 풍요로운 수확과 마을의 화합을 기원하는 의미를 담고 있으며, 2009년 유네스코 인류무형문화유산에 등재되었습니다.`,
    videoSrc: '/videos/ganggang-sullae.mp4',
    thumbnail: '/thumbnails/ganggang-sullae.jpg',
    likes: 342,
  },
  {
    id: 'pansori',
    name: '판소리',
    category: '국가무형문화재',
    number: '제5호',
    region: '전국',
    designatedAt: '1964년 12월 24일',
    holders: ['성우향', '남해성', '송순섭'],
    shortDesc: '소리꾼이 고수의 북장단에 맞춰 이야기를 노래하는 전통 음악',
    description: `판소리는 한 명의 소리꾼이 고수의 북장단에 맞추어 노래(창)와 말(아니리), 몸짓(너름새)으로 긴 이야기를 엮어가는 우리나라 고유의 음악 형식입니다.\n\n춘향가·심청가·흥보가·수궁가·적벽가 다섯 마당이 전해집니다. 2003년 유네스코 인류무형문화유산에 등재되었습니다.`,
    videoSrc: '/videos/pansori.mp4',
    thumbnail: '/thumbnails/pansori.jpg',
    likes: 518,
  },
  {
    id: 'hahoetal',
    name: '하회별신굿탈놀이',
    category: '국가무형문화재',
    number: '제69호',
    region: '경상북도 안동',
    designatedAt: '1980년 11월 17일',
    holders: ['류한국', '이창희'],
    shortDesc: '안동 하회마을의 탈춤, 서민의 해학과 풍자를 담은 놀이',
    description: `하회별신굿탈놀이는 경상북도 안동시 풍천면 하회마을에서 전승되어 온 탈놀이입니다.\n\n고려 중기부터 행해진 것으로 추정되며, 마을의 안녕과 풍요를 기원하는 별신굿 과정에서 공연되었습니다. 양반·선비·중·각시·이매·백정 등 다양한 탈이 등장하여 봉건적 신분 사회에 대한 서민의 해학과 풍자를 담고 있습니다.`,
    videoSrc: '/videos/hahoetal.mp4',
    thumbnail: '/thumbnails/hahoetal.jpg',
    likes: 287,
  },
]
```

- [ ] **Step 4: public 디렉토리 플레이스홀더 생성**

```bash
mkdir -p public/videos public/thumbnails
touch public/videos/.gitkeep public/thumbnails/.gitkeep
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- data
```

Expected: PASS (3 tests)

- [ ] **Step 6: 커밋**

```bash
git add data/heritage.ts public/ __tests__/data.test.ts
git commit -m "feat: add Heritage data model and sample content"
```

---

### Task 3: VideoPlayer 컴포넌트

**Files:**
- Create: `components/VideoPlayer.tsx`
- Create: `__tests__/VideoPlayer.test.tsx`

**Interfaces:**
- Consumes: `src: string` (videoSrc from Heritage)
- Produces: `<VideoPlayer src={string} />` — 화면 진입 시 자동재생, 이탈 시 정지

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/VideoPlayer.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import VideoPlayer from '@/components/VideoPlayer'

const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
const mockIntersectionObserver = jest.fn(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}))

beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  })
})

describe('VideoPlayer', () => {
  it('renders a video element with the given src', () => {
    render(<VideoPlayer src="/videos/test.mp4" />)
    const video = screen.getByTestId('video-player')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', '/videos/test.mp4')
  })

  it('attaches an IntersectionObserver on mount', () => {
    render(<VideoPlayer src="/videos/test.mp4" />)
    expect(mockIntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- VideoPlayer
```

Expected: FAIL

- [ ] **Step 3: VideoPlayer 구현**

`components/VideoPlayer.tsx`:
```tsx
'use client'
import { useRef, useEffect } from 'react'

interface Props {
  src: string
}

export default function VideoPlayer({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      data-testid="video-player"
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
    />
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- VideoPlayer
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add components/VideoPlayer.tsx __tests__/VideoPlayer.test.tsx
git commit -m "feat: add VideoPlayer with IntersectionObserver autoplay"
```

---

### Task 4: ParticleEffect 컴포넌트 + CSS 애니메이션

**Files:**
- Modify: `app/globals.css`
- Create: `components/ParticleEffect.tsx`
- Create: `__tests__/ParticleEffect.test.tsx`

**Interfaces:**
- Consumes: `trigger: number` — 값이 바뀔 때마다 파티클 1개 생성
- Produces: `<ParticleEffect trigger={number} />` — 이모지가 위로 떠오름

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/ParticleEffect.test.tsx`:
```tsx
import { render, act } from '@testing-library/react'
import ParticleEffect from '@/components/ParticleEffect'

jest.useFakeTimers()

describe('ParticleEffect', () => {
  it('renders no particles initially when trigger is 0', () => {
    const { container } = render(<ParticleEffect trigger={0} />)
    expect(container.querySelectorAll('span')).toHaveLength(0)
  })

  it('renders a particle when trigger increments from 0 to 1', () => {
    const { container, rerender } = render(<ParticleEffect trigger={0} />)
    rerender(<ParticleEffect trigger={1} />)
    expect(container.querySelectorAll('span').length).toBeGreaterThan(0)
  })

  it('removes the particle after 1500ms', () => {
    const { container, rerender } = render(<ParticleEffect trigger={0} />)
    rerender(<ParticleEffect trigger={1} />)
    act(() => { jest.advanceTimersByTime(1500) })
    expect(container.querySelectorAll('span')).toHaveLength(0)
  })

  it('adds a new particle for each trigger increment', () => {
    const { container, rerender } = render(<ParticleEffect trigger={0} />)
    rerender(<ParticleEffect trigger={1} />)
    rerender(<ParticleEffect trigger={2} />)
    expect(container.querySelectorAll('span').length).toBe(2)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- ParticleEffect
```

Expected: FAIL

- [ ] **Step 3: globals.css에 float-up 애니메이션 추가**

`app/globals.css` 파일 하단에 추가:
```css
@keyframes float-up {
  0%   { transform: translateY(0) scale(1);    opacity: 1; }
  100% { transform: translateY(-280px) scale(0.4); opacity: 0; }
}

.animate-float-up {
  animation: float-up 1.5s ease-out forwards;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 4: ParticleEffect 구현**

`components/ParticleEffect.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'

const EMOJIS = ['🤍', '🐱', '🐶', '🐾', '💕']

type Particle = {
  id: number
  emoji: string
  x: number
}

interface Props {
  trigger: number
}

export default function ParticleEffect({ trigger }: Props) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger === 0) return

    const id = Date.now() + Math.random()
    const particle: Particle = {
      id,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 60 + 20,
    }

    setParticles(prev => [...prev, particle])

    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id))
    }, 1500)

    return () => clearTimeout(timer)
  }, [trigger])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-3xl animate-float-up"
          style={{ left: `${p.x}%`, bottom: '80px' }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- ParticleEffect
```

Expected: PASS (4 tests)

- [ ] **Step 6: 커밋**

```bash
git add components/ParticleEffect.tsx __tests__/ParticleEffect.test.tsx app/globals.css
git commit -m "feat: add ParticleEffect with float-up emoji animation"
```

---

### Task 5: LikeButton 컴포넌트

**Files:**
- Create: `components/LikeButton.tsx`
- Create: `__tests__/LikeButton.test.tsx`

**Interfaces:**
- Consumes: `initialCount: number`, `onLike: () => void`
- Produces: `<LikeButton initialCount={number} onLike={fn} />` — 클릭 시 카운트 증가 + onLike 호출

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/LikeButton.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import LikeButton from '@/components/LikeButton'

describe('LikeButton', () => {
  it('shows initial count', () => {
    render(<LikeButton initialCount={42} onLike={() => {}} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('increments count on click', () => {
    render(<LikeButton initialCount={42} onLike={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('43')).toBeInTheDocument()
  })

  it('calls onLike callback on click', () => {
    const onLike = jest.fn()
    render(<LikeButton initialCount={0} onLike={onLike} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onLike).toHaveBeenCalledTimes(1)
  })

  it('formats count >= 1000 as Xk', () => {
    render(<LikeButton initialCount={1200} onLike={() => {}} />)
    expect(screen.getByText('1.2k')).toBeInTheDocument()
  })

  it('can be clicked multiple times', () => {
    render(<LikeButton initialCount={0} onLike={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- LikeButton
```

Expected: FAIL

- [ ] **Step 3: LikeButton 구현**

`components/LikeButton.tsx`:
```tsx
'use client'
import { useState } from 'react'

interface Props {
  initialCount: number
  onLike: () => void
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function LikeButton({ initialCount, onLike }: Props) {
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    setCount(prev => prev + 1)
    onLike()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-white"
      aria-label="좋아요"
    >
      <span className="text-xl">🤍</span>
      <span className="text-sm font-medium">{formatCount(count)}</span>
    </button>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- LikeButton
```

Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add components/LikeButton.tsx __tests__/LikeButton.test.tsx
git commit -m "feat: add LikeButton with count formatting"
```

---

### Task 6: HeritageCard 컴포넌트

**Files:**
- Create: `components/HeritageCard.tsx`
- Create: `__tests__/HeritageCard.test.tsx`

**Interfaces:**
- Consumes:
  - `heritage: Heritage` (from `@/data/heritage`)
  - `<VideoPlayer src={string} />` (from Task 3)
  - `<LikeButton initialCount={number} onLike={fn} />` (from Task 5)
  - `<ParticleEffect trigger={number} />` (from Task 4)
- Produces: `<HeritageCard heritage={Heritage} />` — 풀스크린 카드

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/HeritageCard.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import HeritageCard from '@/components/HeritageCard'
import { heritageList } from '@/data/heritage'

jest.mock('@/components/VideoPlayer', () => () => <div data-testid="video-player" />)
jest.mock('@/components/ParticleEffect', () => ({ trigger }: { trigger: number }) => (
  <div data-testid="particle-effect" data-trigger={trigger} />
))

const heritage = heritageList[0]

describe('HeritageCard', () => {
  it('renders heritage name', () => {
    render(<HeritageCard heritage={heritage} />)
    expect(screen.getByText(heritage.name)).toBeInTheDocument()
  })

  it('renders 더보기 link pointing to detail page', () => {
    render(<HeritageCard heritage={heritage} />)
    const link = screen.getByRole('link', { name: /더보기/ })
    expect(link).toHaveAttribute('href', `/heritage/${heritage.id}`)
  })

  it('increments particle trigger when like button is clicked', () => {
    render(<HeritageCard heritage={heritage} />)
    const likeBtn = screen.getByRole('button', { name: '좋아요' })
    expect(screen.getByTestId('particle-effect')).toHaveAttribute('data-trigger', '0')
    fireEvent.click(likeBtn)
    expect(screen.getByTestId('particle-effect')).toHaveAttribute('data-trigger', '1')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- HeritageCard
```

Expected: FAIL

- [ ] **Step 3: HeritageCard 구현**

`components/HeritageCard.tsx`:
```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import VideoPlayer from './VideoPlayer'
import LikeButton from './LikeButton'
import ParticleEffect from './ParticleEffect'
import type { Heritage } from '@/data/heritage'

interface Props {
  heritage: Heritage
}

export default function HeritageCard({ heritage }: Props) {
  const [likeCount, setLikeCount] = useState(0)

  const handleLike = () => {
    setLikeCount(prev => prev + 1)
  }

  return (
    <div className="snap-center flex-none w-screen h-screen relative bg-black">
      <VideoPlayer src={heritage.videoSrc} />
      <ParticleEffect trigger={likeCount} />

      {/* 하단 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-10 pt-16 flex justify-between items-end">
        <h2 className="text-white text-xl font-bold drop-shadow">
          {heritage.name}
        </h2>
        <div className="flex items-center gap-3">
          <LikeButton initialCount={heritage.likes} onLike={handleLike} />
          <Link
            href={`/heritage/${heritage.id}`}
            className="text-white text-sm border border-white/60 px-3 py-1 rounded-full backdrop-blur-sm"
          >
            더보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- HeritageCard
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add components/HeritageCard.tsx __tests__/HeritageCard.test.tsx
git commit -m "feat: add HeritageCard with video overlay and like interaction"
```

---

### Task 7: HeritageFeed 컴포넌트

**Files:**
- Create: `components/HeritageFeed.tsx`
- Create: `__tests__/HeritageFeed.test.tsx`

**Interfaces:**
- Consumes:
  - `items: Heritage[]`
  - `<HeritageCard heritage={Heritage} />` (from Task 6)
- Produces: `<HeritageFeed items={Heritage[]} />` — 가로 스냅 스크롤 + 페이지 인디케이터

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/HeritageFeed.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import HeritageFeed from '@/components/HeritageFeed'
import { heritageList } from '@/data/heritage'

jest.mock('@/components/HeritageCard', () => ({ heritage }: { heritage: { name: string } }) => (
  <div data-testid="heritage-card">{heritage.name}</div>
))

describe('HeritageFeed', () => {
  it('renders a card for each item', () => {
    render(<HeritageFeed items={heritageList} />)
    const cards = screen.getAllByTestId('heritage-card')
    expect(cards).toHaveLength(heritageList.length)
  })

  it('renders page indicator dots equal to item count', () => {
    render(<HeritageFeed items={heritageList} />)
    // dot buttons are rendered in the indicator area
    const dots = screen.getAllByRole('button', { name: /페이지/ })
    expect(dots).toHaveLength(heritageList.length)
  })

  it('renders each heritage name inside a card', () => {
    render(<HeritageFeed items={heritageList} />)
    heritageList.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- HeritageFeed
```

Expected: FAIL

- [ ] **Step 3: HeritageFeed 구현**

`components/HeritageFeed.tsx`:
```tsx
'use client'
import { useState, useRef } from 'react'
import HeritageCard from './HeritageCard'
import type { Heritage } from '@/data/heritage'

interface Props {
  items: Heritage[]
}

export default function HeritageFeed({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(index)
  }

  const goTo = (index: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 카드 스크롤 영역 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-hide"
      >
        {items.map(item => (
          <HeritageCard key={item.id} heritage={item} />
        ))}
      </div>

      {/* 페이지 인디케이터 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`페이지 ${i + 1}`}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full pointer-events-auto transition-all duration-200 ${
              i === activeIndex ? 'bg-white scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* 데스크탑 화살표 */}
      {activeIndex > 0 && (
        <button
          onClick={() => goTo(activeIndex - 1)}
          aria-label="이전"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-4xl hidden md:block hover:text-white transition-colors"
        >
          ‹
        </button>
      )}
      {activeIndex < items.length - 1 && (
        <button
          onClick={() => goTo(activeIndex + 1)}
          aria-label="다음"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-4xl hidden md:block hover:text-white transition-colors"
        >
          ›
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- HeritageFeed
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add components/HeritageFeed.tsx __tests__/HeritageFeed.test.tsx
git commit -m "feat: add HeritageFeed with horizontal snap scroll and indicators"
```

---

### Task 8: 메인 피드 페이지 + 레이아웃

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `heritageList` (from `@/data/heritage`), `<HeritageFeed />` (from Task 7)
- Produces: `/` 라우트에서 전체화면 피드 렌더링

- [ ] **Step 1: layout.tsx 수정**

`app/layout.tsx`:
```tsx
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
```

- [ ] **Step 2: page.tsx 수정**

`app/page.tsx`:
```tsx
import HeritageFeed from '@/components/HeritageFeed'
import { heritageList } from '@/data/heritage'

export default function Home() {
  return <HeritageFeed items={heritageList} />
}
```

- [ ] **Step 3: 개발 서버 실행 및 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열기.

확인 사항:
- 영상 자리에 검은 화면 (아직 영상 파일 없음 — 정상)
- 하단에 종목명 텍스트 표시
- 좋아요 버튼 클릭 시 파티클 애니메이션
- 페이지 인디케이터 점 3개 표시
- 데스크탑에서 ‹ › 화살표 표시

- [ ] **Step 4: 커밋**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: wire up main feed page with HeritageFeed"
```

---

### Task 9: 상세 페이지

**Files:**
- Create: `app/heritage/[id]/page.tsx`
- Create: `__tests__/heritage-detail.test.tsx`

**Interfaces:**
- Consumes: `params.id: string`, `heritageList` (from `@/data/heritage`)
- Produces: `/heritage/[id]` 라우트 — 영상 + 상세 정보 + 뒤로가기

- [ ] **Step 1: 실패 테스트 작성**

`__tests__/heritage-detail.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import HeritagePage from '@/app/heritage/[id]/page'
import { heritageList } from '@/data/heritage'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

const heritage = heritageList[0]

describe('HeritagePage', () => {
  it('renders heritage name in header', () => {
    render(<HeritagePage params={{ id: heritage.id }} />)
    expect(screen.getByText(heritage.name)).toBeInTheDocument()
  })

  it('renders category and region', () => {
    render(<HeritagePage params={{ id: heritage.id }} />)
    expect(screen.getByText(heritage.category)).toBeInTheDocument()
    expect(screen.getByText(heritage.region)).toBeInTheDocument()
  })

  it('renders 뒤로가기 link to home', () => {
    render(<HeritagePage params={{ id: heritage.id }} />)
    const link = screen.getByRole('link', { name: /뒤로/ })
    expect(link).toHaveAttribute('href', '/')
  })

  it('throws notFound for unknown id', () => {
    expect(() =>
      render(<HeritagePage params={{ id: 'does-not-exist' }} />)
    ).toThrow('NEXT_NOT_FOUND')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- heritage-detail
```

Expected: FAIL

- [ ] **Step 3: 디렉토리 생성 + 페이지 구현**

```bash
mkdir -p app/heritage/\[id\]
```

`app/heritage/[id]/page.tsx`:
```tsx
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
        <Link href="/" aria-label="뒤로" className="text-white text-2xl leading-none">
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- heritage-detail
```

Expected: PASS (4 tests)

- [ ] **Step 5: 전체 테스트 실행**

```bash
npm test
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add app/heritage __tests__/heritage-detail.test.tsx
git commit -m "feat: add heritage detail page with video and metadata"
```

---

## 완료 후 확인 사항

1. `public/videos/` 에 실제 영상 파일(`.mp4`) 추가 — 파일명이 `heritage.ts`의 `videoSrc` 경로와 일치해야 함
2. `public/thumbnails/` 에 썸네일 이미지(`.jpg`) 추가
3. `npm run dev` → `localhost:3000` 에서 풀스크린 피드 동작 확인
4. 모바일 뷰포트에서 터치 스와이프 확인 (브라우저 DevTools 모바일 시뮬레이터)

## 다음 단계 (범위 외)

- 콘텐츠 관리 페이지 (로그인 + 업로드)
- 좋아요 수 DB 연동 (Supabase / PlanetScale)
- 검색 / 카테고리 필터
