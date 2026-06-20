# FSD 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 flat 구조를 Feature-Sliced Design 아키텍처로 전환한다.

**Architecture:** `app/` 은 Next.js 라우팅 shell 전용으로 유지하고, 모든 로직은 `src/` 하위 FSD 레이어(shared → entities → features → widgets → pages)로 이동한다. 마이그레이션 중 양방향 path alias 를 사용해 빌드가 항상 통과하도록 한다.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, pnpm

## Global Constraints

- `src/` 하위 레이어 간 의존 방향: `pages → widgets → features → entities → shared` (역방향 금지)
- 각 슬라이스 내 파일은 `ui/`, `model/`, `data/` 서브폴더에 배치
- `app/` 의 page.tsx 는 FSD pages 컴포넌트를 import 하는 5줄 이하 shell 만 허용
- 마이그레이션 완료 전까지 `pnpm build` 는 항상 통과해야 함
- 작업 디렉토리: `/Users/sinseongsu/Desktop/code/ieum`

---

### Task 1: Path alias 이중화 + 디렉토리 스캐폴딩

**Files:**
- Modify: `tsconfig.json`
- Modify: `jest.config.ts`

**Interfaces:**
- Produces: `@/` 로 `src/*` 와 `./*` 양쪽 모두 resolve 가능한 환경

- [ ] **Step 1: tsconfig.json 수정**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*", "./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: jest.config.ts 수정**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': ['<rootDir>/src/$1', '<rootDir>/$1'],
  },
}

export default createJestConfig(config)
```

- [ ] **Step 3: src/ 디렉토리 구조 생성**

```bash
mkdir -p src/pages/landing/ui
mkdir -p src/pages/explore/ui
mkdir -p src/pages/onboarding/ui
mkdir -p src/pages/onboarding/model
mkdir -p src/pages/heritage-detail/ui
mkdir -p src/widgets/shorts-swiper/ui
mkdir -p src/widgets/navigation/ui
mkdir -p src/widgets/filter-drawer/ui
mkdir -p src/features/like/ui
mkdir -p src/features/bookmark/ui
mkdir -p src/features/filter/ui
mkdir -p src/entities/heritage/model
mkdir -p src/entities/heritage/data
mkdir -p src/shared/ui/Button
mkdir -p src/shared/ui/Calendar
mkdir -p src/shared/ui/DatePickerInput
mkdir -p src/shared/ui/Loading
mkdir -p src/shared/ui/VideoPlayer
mkdir -p src/shared/ui/MuteToggleIcon
mkdir -p src/shared/lib
mkdir -p src/shared/api
mkdir -p src/shared/config
```

- [ ] **Step 4: 빌드 확인**

```bash
pnpm build
```

Expected: 성공 (파일을 아직 이동하지 않았으므로 기존 코드 그대로)

- [ ] **Step 5: 커밋**

```bash
git add tsconfig.json jest.config.ts
git commit -m "chore: add dual path alias for FSD migration"
```

---

### Task 2: shared/config 이동

**Files:**
- Create: `src/shared/config/filter.ts`
- Create: `src/shared/config/session-storage-key.ts`

**Interfaces:**
- Produces: `@/shared/config/filter`, `@/shared/config/session-storage-key`

- [ ] **Step 1: filter.ts 복사**

`src/shared/config/filter.ts` — 기존 `app/_constants/filter.ts` 내용 그대로:
```ts
export const CATEGORY_FILTER_OPTIONS = [
  { label: "음악", value: 1 },
  { label: "무용", value: 2 },
  { label: "연극", value: 3 },
  { label: "놀이", value: 4 },
  { label: "의식", value: 5 },
  { label: "무예", value: 6 },
  { label: "공예", value: 7 },
  { label: "음식", value: 8 },
];

export const LOCATION_FILTER_OPTIONS = [
  { label: "서울", value: 1 },
  { label: "경기", value: 2 },
  { label: "강원", value: 3 },
  { label: "충청", value: 4 },
  { label: "전라", value: 5 },
  { label: "경상", value: 6 },
  { label: "제주", value: 7 },
];
```

- [ ] **Step 2: session-storage-key.ts 복사**

`src/shared/config/session-storage-key.ts`:
```ts
export const ONBOARDING_DATA_KEY = "onboarding_data";
export const IS_COMPLETED_ONBOARDING_KEY = "is_completed_onboarding";
```

- [ ] **Step 3: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add src/shared/config/
git commit -m "feat(shared/config): add filter and session-storage-key"
```

---

### Task 3: shared/lib 이동

**Files:**
- Create: `src/shared/lib/utils.ts`
- Create: `src/shared/lib/session-storage.ts`
- Create: `src/shared/lib/shallow.ts`
- Create: `src/shared/lib/swr-provider.tsx`

**Interfaces:**
- Produces: `@/shared/lib/utils`, `@/shared/lib/session-storage`, `@/shared/lib/shallow`, `@/shared/lib/swr-provider`
- Consumes: `@/shared/config/session-storage-key` (Task 2 산출물)

- [ ] **Step 1: utils.ts 복사**

`src/shared/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: session-storage.ts 복사 (import 경로 업데이트)**

`src/shared/lib/session-storage.ts`:
```ts
import { IS_COMPLETED_ONBOARDING_KEY, ONBOARDING_DATA_KEY } from "@/shared/config/session-storage-key";
import type { OnboardingSchema } from "@/pages/onboarding/model/onboarding_schema";

export const getOnboardingDataFromSessionStorage = () => {
  const filterData = sessionStorage.getItem(ONBOARDING_DATA_KEY);
  return filterData ? (JSON.parse(filterData) as OnboardingSchema) : null;
};
export const setOnboardingDataToSessionStorage = (data: OnboardingSchema) => {
  sessionStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
};
export const updateOnboardingDataToSessionStorage = (data: Partial<OnboardingSchema>) => {
  const prevFilterData = getOnboardingDataFromSessionStorage();
  if (!prevFilterData) return;
  sessionStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify({ ...prevFilterData, ...data }));
};
export const setIsCompletedOnboardingToSessionStorage = () => {
  sessionStorage.setItem(IS_COMPLETED_ONBOARDING_KEY, "true");
};
export const getIsCompletedOnboardingFromSessionStorage = () => {
  return sessionStorage.getItem(IS_COMPLETED_ONBOARDING_KEY) === "true";
};
```

- [ ] **Step 3: shallow.ts 복사**

`src/shared/lib/shallow.ts`:
```ts
export const shallowPush = (path: string) => { window.history.pushState(null, "", path); };
export const shallowReplace = (path: string) => { window.history.replaceState(null, "", path); };
export const shallowBack = () => { window.history.back(); };
```

- [ ] **Step 4: swr-provider.tsx 복사**

`src/shared/lib/swr-provider.tsx`:
```tsx
"use client";
import { SWRConfig } from "swr";
export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return <SWRConfig>{children}</SWRConfig>;
};
```

- [ ] **Step 5: 빌드 확인**

```bash
pnpm build
```

Expected: 성공 (session-storage.ts의 OnboardingSchema import는 타입만이라 순환 참조 아님)

- [ ] **Step 6: 커밋**

```bash
git add src/shared/lib/
git commit -m "feat(shared/lib): add utils, session-storage, shallow, swr-provider"
```

---

### Task 4: shared/api 이동

**Files:**
- Create: `src/shared/api/explore.ts`
- Create: `src/shared/api/onboarding.ts`

**Interfaces:**
- Produces: `ShortsPlace` 타입, API 함수들

- [ ] **Step 1: explore.ts 복사**

`src/shared/api/explore.ts` — 기존 `app/explore/_apis/explore.interface.ts` 내용:
```ts
export interface ShortsPlace {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  address: string;
  latitude: string;
  longitude: string;
  categoryHigh: string | null;
  categoryMiddle: string | null;
  categoryLow: string | null;
  shortsUrl: string;
  openingHours: string[];
  phoneNumber: string;
  pricePerPerson: number[];
  averagePrice: number;
  averageRating: string;
  bookmarks: { id: number }[];
  videoSrc?: string;
  heritageId?: string;
  holders?: string[];
  number?: string;
  description?: string;
}
```

- [ ] **Step 2: onboarding.ts 복사**

`src/shared/api/onboarding.ts` — 기존 `app/onboarding/_apis/onboarding.api.ts` 내용:
```ts
export interface PostOnboardingInfoDTO {
  vibeList: number[];
  placeCategoryList: number[];
  from: string;
  to: string;
}

export const postOnboardingInfo = async (_data: PostOnboardingInfoDTO) => {};

export type PatchOnboardingInfoDTO = Partial<PostOnboardingInfoDTO>;
export const patchOnboardingInfo = async (_data: PatchOnboardingInfoDTO) => {};
```

- [ ] **Step 3: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add src/shared/api/
git commit -m "feat(shared/api): add explore and onboarding API types"
```

---

### Task 5: shared/ui 이동

**Files:**
- Create: `src/shared/ui/Button/Button.tsx`
- Create: `src/shared/ui/Calendar/Calendar.tsx`
- Create: `src/shared/ui/DatePickerInput/DatePickerInput.tsx`
- Create: `src/shared/ui/Loading/Loading.tsx`
- Create: `src/shared/ui/VideoPlayer/VideoPlayer.tsx`
- Create: `src/shared/ui/MuteToggleIcon/MuteToggleIcon.tsx`

**Interfaces:**
- Consumes: `@/shared/lib/utils` (Task 3 산출물)
- Produces: 재사용 가능한 UI 컴포넌트들

- [ ] **Step 1: Button.tsx 복사 (import 업데이트)**

`src/shared/ui/Button/Button.tsx` — 기존 `app/_components/button.tsx` 에서 import만 업데이트:
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

- [ ] **Step 2: Calendar.tsx 복사 (import 업데이트)**

`src/shared/ui/Calendar/Calendar.tsx` — 기존 `app/_components/calendar.tsx` 에서 import 경로만 업데이트:
```tsx
// 파일 상단 import 만 아래로 교체:
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/Button/Button";
// 나머지 코드는 기존과 동일
```

`app/_components/calendar.tsx` 를 그대로 복사하되, 아래 두 줄만 교체:
- `import { cn } from "@/lib/utils";` → `import { cn } from "@/shared/lib/utils";`
- `import { Button, buttonVariants } from "@/app/_components/button";` → `import { Button, buttonVariants } from "@/shared/ui/Button/Button";`

- [ ] **Step 3: DatePickerInput.tsx 복사**

`src/shared/ui/DatePickerInput/DatePickerInput.tsx` — 기존 `app/_components/date-picker-input.tsx` 내용 그대로.

- [ ] **Step 4: Loading.tsx 복사 (import 업데이트)**

`src/shared/ui/Loading/Loading.tsx`:
```tsx
"use client";
import Lottie from "react-lottie";
import animationData from "@/public/lottie/landing.json";

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-dvh flex items-center justify-center bg-[#E5E5EA] z-50">
      <div className="w-32 h-32">
        <Lottie options={{ animationData, loop: true }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: VideoPlayer.tsx 복사**

`src/shared/ui/VideoPlayer/VideoPlayer.tsx` — 기존 `components/VideoPlayer.tsx` 내용 그대로.

- [ ] **Step 6: MuteToggleIcon.tsx 복사**

`src/shared/ui/MuteToggleIcon/MuteToggleIcon.tsx` — 기존 `app/explore/_components/mute-toggle-icon.tsx` 내용 그대로.

- [ ] **Step 7: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 8: 커밋**

```bash
git add src/shared/ui/
git commit -m "feat(shared/ui): add Button, Calendar, DatePickerInput, Loading, VideoPlayer, MuteToggleIcon"
```

---

### Task 6: entities/heritage 이동

**Files:**
- Create: `src/entities/heritage/model/heritage.ts`
- Create: `src/entities/heritage/data/heritageList.ts`
- Create: `src/entities/heritage/model/useShorts.tsx`

**Interfaces:**
- Produces:
  - `Heritage` 타입 (from `@/entities/heritage/model/heritage`)
  - `heritageList: Heritage[]` (from `@/entities/heritage/data/heritageList`)
  - `useShorts` hook (from `@/entities/heritage/model/useShorts`)

- [ ] **Step 1: heritage.ts (타입만)**

`src/entities/heritage/model/heritage.ts`:
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
```

- [ ] **Step 2: heritageList.ts (데이터만)**

`src/entities/heritage/data/heritageList.ts` — 기존 `data/heritage.ts` 에서 타입 제거, 데이터만:
```ts
import type { Heritage } from "@/entities/heritage/model/heritage";

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
];
```

- [ ] **Step 3: useShorts.tsx 복사 (import 업데이트)**

`src/entities/heritage/model/useShorts.tsx`:
```tsx
"use client";
import { useState } from "react";
import { heritageList } from "@/entities/heritage/data/heritageList";

const useShorts = () => {
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  const data = heritageList.map((h, i) => ({
    id: i + 1,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    title: h.name,
    address: h.region,
    latitude: "",
    longitude: "",
    categoryHigh: h.category,
    categoryMiddle: null,
    categoryLow: null,
    shortsUrl: h.videoSrc,
    openingHours: [h.designatedAt],
    phoneNumber: "",
    pricePerPerson: [],
    averagePrice: 0,
    averageRating: h.likes.toString(),
    bookmarks: bookmarks[h.id] ? [{ id: i + 1 }] : [],
    videoSrc: h.videoSrc,
    heritageId: h.id,
    holders: h.holders,
    number: h.number,
    description: h.description,
  }));

  const createBookmark = (placeId: number) => {
    const heritage = heritageList[placeId - 1];
    if (heritage) setBookmarks(prev => ({ ...prev, [heritage.id]: true }));
  };

  const deleteBookmark = (placeId: number) => {
    const heritage = heritageList[placeId - 1];
    if (heritage) setBookmarks(prev => ({ ...prev, [heritage.id]: false }));
  };

  return { data, isLoading: false, error: null, mutate: () => {}, createBookmark, deleteBookmark };
};

export default useShorts;
```

- [ ] **Step 4: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 5: 커밋**

```bash
git add src/entities/
git commit -m "feat(entities/heritage): add Heritage type, heritageList data, useShorts hook"
```

---

### Task 7: features/like 이동

**Files:**
- Create: `src/features/like/ui/LikeButton.tsx`
- Create: `src/features/like/ui/ParticleEffect.tsx`

**Interfaces:**
- Consumes: 없음 (standalone)
- Produces: `<LikeButton initialCount onLike vertical? />`, `<ParticleEffect trigger />`

- [ ] **Step 1: LikeButton.tsx 복사**

`src/features/like/ui/LikeButton.tsx` — 기존 `components/LikeButton.tsx` 내용 그대로.

- [ ] **Step 2: ParticleEffect.tsx 복사**

`src/features/like/ui/ParticleEffect.tsx` — 기존 `components/ParticleEffect.tsx` 내용 그대로.

- [ ] **Step 3: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add src/features/like/
git commit -m "feat(features/like): add LikeButton and ParticleEffect"
```

---

### Task 8: features/bookmark 이동

**Files:**
- Create: `src/features/bookmark/ui/ShortsBookmark.tsx`

**Interfaces:**
- Produces: `<ShortsBookmark isBookmarked onToggle />`

- [ ] **Step 1: ShortsBookmark.tsx 복사**

`src/features/bookmark/ui/ShortsBookmark.tsx` — 기존 `app/explore/_components/shorts-bookmark.tsx` 내용 그대로.

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/features/bookmark/
git commit -m "feat(features/bookmark): add ShortsBookmark"
```

---

### Task 9: features/filter 이동

**Files:**
- Create: `src/features/filter/ui/CheckboxButtonGroup.tsx`
- Create: `src/features/filter/ui/ShortsFilterGroup.tsx`

**Interfaces:**
- Consumes: 없음 (standalone)
- Produces: `<CheckboxButtonGroup />`, `<ShortsFilterGroup />`

- [ ] **Step 1: CheckboxButtonGroup.tsx 복사**

`src/features/filter/ui/CheckboxButtonGroup.tsx` — 기존 `app/_components/checkbox-button-group.tsx` 내용 그대로.

- [ ] **Step 2: ShortsFilterGroup.tsx 복사 (import 업데이트)**

`src/features/filter/ui/ShortsFilterGroup.tsx`:
```tsx
"use client";
import CheckboxButtonGroup from "@/features/filter/ui/CheckboxButtonGroup";

interface ShortsFilterGroupProps {
  title: string;
  options: { label: string; value: number | string }[];
  selectedValues: (number | string)[];
  onSelect: (value: number | string) => void;
  className?: string;
}

export default function ShortsFilterGroup({ title, options, selectedValues, onSelect, className }: ShortsFilterGroupProps) {
  return (
    <div className={`p-4 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="text-xs text-[#ee7f12] border border-[#ee7f12] rounded-full px-2 py-0.5">복수 선택</span>
      </div>
      <CheckboxButtonGroup options={options} selectedValues={selectedValues} onSelect={onSelect} />
    </div>
  );
}
```

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/features/filter/
git commit -m "feat(features/filter): add CheckboxButtonGroup and ShortsFilterGroup"
```

---

### Task 10: widgets/navigation 이동

**Files:**
- Create: `src/widgets/navigation/ui/Navigation.tsx`

**Interfaces:**
- Produces: `<Navigation />`

- [ ] **Step 1: Navigation.tsx 복사**

`src/widgets/navigation/ui/Navigation.tsx` — 기존 `app/_components/navigation.tsx` 내용 그대로.

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/widgets/navigation/
git commit -m "feat(widgets/navigation): add Navigation"
```

---

### Task 11: widgets/shorts-swiper 이동

**Files:**
- Create: `src/widgets/shorts-swiper/ui/HeritageFeed.tsx`
- Create: `src/widgets/shorts-swiper/ui/HeritageCard.tsx`
- Create: `src/widgets/shorts-swiper/ui/ShortsSwiper.tsx`
- Create: `src/widgets/shorts-swiper/ui/Shorts.tsx`
- Create: `src/widgets/shorts-swiper/ui/ShortsInfoSection.tsx`
- Create: `src/widgets/shorts-swiper/ui/DetailDrawerButton.tsx`

**Interfaces:**
- Consumes: `@/features/like/ui/LikeButton`, `@/features/like/ui/ParticleEffect`, `@/features/bookmark/ui/ShortsBookmark`, `@/shared/ui/VideoPlayer/VideoPlayer`, `@/shared/ui/MuteToggleIcon/MuteToggleIcon`, `@/entities/heritage/model/useShorts`, `@/shared/api/explore`
- Produces: `<HeritageFeed />`, `<ShortsSwiper />`

- [ ] **Step 1: HeritageFeed.tsx 복사 (import 업데이트)**

`src/widgets/shorts-swiper/ui/HeritageFeed.tsx` — 기존 `components/HeritageFeed.tsx` 에서 import 경로만 업데이트:
- `from './HeritageCard'` → `from "@/widgets/shorts-swiper/ui/HeritageCard"`
- `import type { Heritage }` → `from "@/entities/heritage/model/heritage"`

- [ ] **Step 2: HeritageCard.tsx 복사 (import 업데이트)**

`src/widgets/shorts-swiper/ui/HeritageCard.tsx` — 기존 `components/HeritageCard.tsx` 에서 import 경로만 업데이트:
- `from './VideoPlayer'` → `from "@/shared/ui/VideoPlayer/VideoPlayer"`
- `from './LikeButton'` → `from "@/features/like/ui/LikeButton"`
- `from './ParticleEffect'` → `from "@/features/like/ui/ParticleEffect"`
- `from '@/data/heritage'` → `from "@/entities/heritage/model/heritage"`

- [ ] **Step 3: ShortsSwiper.tsx 복사 (import 업데이트)**

`src/widgets/shorts-swiper/ui/ShortsSwiper.tsx` — 기존 `app/explore/_components/shorts-swiper.tsx` 에서:
- `from "./shorts"` → `from "@/widgets/shorts-swiper/ui/Shorts"`
- `from "../_hooks/useShorts"` → `from "@/entities/heritage/model/useShorts"`
- `from "./filter-drawer-button"` → `from "@/widgets/filter-drawer/ui/FilterDrawerButton"`

- [ ] **Step 4: Shorts.tsx 복사 (import 업데이트)**

`src/widgets/shorts-swiper/ui/Shorts.tsx` — 기존 `app/explore/_components/shorts.tsx` 에서:
- `from "./mute-toggle-icon"` → `from "@/shared/ui/MuteToggleIcon/MuteToggleIcon"`
- `from "./shorts-info-section"` → `from "@/widgets/shorts-swiper/ui/ShortsInfoSection"`
- `from "../_apis/explore.interface"` → `from "@/shared/api/explore"`

- [ ] **Step 5: ShortsInfoSection.tsx 복사 (import 업데이트)**

`src/widgets/shorts-swiper/ui/ShortsInfoSection.tsx` — 기존 `app/explore/_components/shorts-info-section.tsx` 에서:
- `from "../_hooks/useShorts"` → `from "@/entities/heritage/model/useShorts"`
- `from "./shorts-bookmark"` → `from "@/features/bookmark/ui/ShortsBookmark"`
- `from "./detail-drawer-button"` → `from "@/widgets/shorts-swiper/ui/DetailDrawerButton"`
- `from "../_apis/explore.interface"` → `from "@/shared/api/explore"`

- [ ] **Step 6: DetailDrawerButton.tsx 복사**

`src/widgets/shorts-swiper/ui/DetailDrawerButton.tsx` — 기존 `app/explore/_components/detail-drawer-button.tsx` 에서:
- `from "../_apis/explore.interface"` → `from "@/shared/api/explore"`

- [ ] **Step 7: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 8: 커밋**

```bash
git add src/widgets/shorts-swiper/
git commit -m "feat(widgets/shorts-swiper): add HeritageFeed, HeritageCard, ShortsSwiper, Shorts, ShortsInfoSection"
```

---

### Task 12: widgets/filter-drawer 이동

**Files:**
- Create: `src/widgets/filter-drawer/ui/FilterDrawerButton.tsx`

**Interfaces:**
- Consumes: `@/features/filter/ui/ShortsFilterGroup`, `@/shared/config/filter`, `@/shared/lib/session-storage`
- Produces: `<FilterDrawerButton onApplyFilter />`

- [ ] **Step 1: FilterDrawerButton.tsx 복사 (import 업데이트)**

`src/widgets/filter-drawer/ui/FilterDrawerButton.tsx` — 기존 `app/explore/_components/filter-drawer-button.tsx` 에서:
- `from "@/app/_constants/filter"` → `from "@/shared/config/filter"`
- `from "./shorts-filter-group"` → `from "@/features/filter/ui/ShortsFilterGroup"`
- `from "@/app/_utils/session-storage"` → `from "@/shared/lib/session-storage"`

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/widgets/filter-drawer/
git commit -m "feat(widgets/filter-drawer): add FilterDrawerButton"
```

---

### Task 13: pages/landing 이동

**Files:**
- Create: `src/pages/landing/ui/LandingLottie.tsx`
- Create: `src/pages/landing/ui/LandingFooter.tsx`
- Create: `src/pages/landing/ui/LandingPage.tsx`
- Create: `src/pages/landing/index.ts`

**Interfaces:**
- Produces: `LandingPage` (named export)

- [ ] **Step 1: LandingLottie.tsx 복사**

`src/pages/landing/ui/LandingLottie.tsx` — 기존 `app/(landing)/_components/landing-lottie.tsx` 에서:
- `from "./landing-footer"` → `from "@/pages/landing/ui/LandingFooter"`
- `from "@/public/lottie/landing.json"` → 그대로 유지 (public은 루트 기준)

단, `animationData` import 경로를 수정:
```tsx
"use client";
import Lottie from "react-lottie";
import LandingFooter from "@/pages/landing/ui/LandingFooter";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const animationData = require("../../../public/lottie/landing.json");

export default function LandingLottie() {
  return (
    <div className="relative bg-[#e8e8e8]">
      <Lottie options={{ animationData, loop: true }} height="100dvh" />
      <div className="absolute bottom-0 w-full">
        <LandingFooter />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: LandingFooter.tsx 복사**

`src/pages/landing/ui/LandingFooter.tsx` — 기존 `app/(landing)/_components/landing-footer.tsx` 내용 그대로.

- [ ] **Step 3: LandingPage.tsx 생성**

`src/pages/landing/ui/LandingPage.tsx`:
```tsx
import LandingLottie from "@/pages/landing/ui/LandingLottie";

export default function LandingPage() {
  return <LandingLottie />;
}
```

- [ ] **Step 4: index.ts 생성**

`src/pages/landing/index.ts`:
```ts
export { default as LandingPage } from "./ui/LandingPage";
```

- [ ] **Step 5: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/pages/landing/
git commit -m "feat(pages/landing): add LandingPage"
```

---

### Task 14: pages/explore 생성

**Files:**
- Create: `src/pages/explore/ui/ExplorePage.tsx`
- Create: `src/pages/explore/index.ts`

**Interfaces:**
- Consumes: `@/widgets/shorts-swiper/ui/ShortsSwiper`
- Produces: `ExplorePage`

- [ ] **Step 1: ExplorePage.tsx 생성**

`src/pages/explore/ui/ExplorePage.tsx`:
```tsx
import ShortsSwiper from "@/widgets/shorts-swiper/ui/ShortsSwiper";

export default function ExplorePage() {
  return <ShortsSwiper />;
}
```

- [ ] **Step 2: index.ts 생성**

`src/pages/explore/index.ts`:
```ts
export { default as ExplorePage } from "./ui/ExplorePage";
```

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/pages/explore/
git commit -m "feat(pages/explore): add ExplorePage"
```

---

### Task 15: pages/onboarding 이동

**Files:**
- Create: `src/pages/onboarding/model/onboarding_schema.tsx`
- Create: `src/pages/onboarding/model/useStep.tsx`
- Create: `src/pages/onboarding/ui/OnboardingTitle.tsx`
- Create: `src/pages/onboarding/ui/OnboardingHeader.tsx`
- Create: `src/pages/onboarding/ui/OnboardingFooter.tsx`
- Create: `src/pages/onboarding/ui/Step01DateRange.tsx`
- Create: `src/pages/onboarding/ui/Step01.tsx`
- Create: `src/pages/onboarding/ui/Step02.tsx`
- Create: `src/pages/onboarding/ui/Step03.tsx`
- Create: `src/pages/onboarding/ui/OnboardingPage.tsx`
- Create: `src/pages/onboarding/index.ts`

**Interfaces:**
- Consumes: `@/shared/ui/Button/Button`, `@/shared/ui/Calendar/Calendar`, `@/shared/ui/DatePickerInput/DatePickerInput`, `@/shared/ui/Loading/Loading`, `@/shared/lib/session-storage`, `@/shared/lib/shallow`, `@/shared/config/filter`, `@/features/filter/ui/CheckboxButtonGroup`
- Produces: `OnboardingPage`

- [ ] **Step 1: onboarding_schema.tsx 복사**

`src/pages/onboarding/model/onboarding_schema.tsx` — 기존 `app/onboarding/_schemas/onboarding_schema.tsx` 내용 그대로.

- [ ] **Step 2: useStep.tsx 복사 (import 업데이트)**

`src/pages/onboarding/model/useStep.tsx` — 기존 `app/onboarding/_hooks/useStep.tsx` 에서:
- `from "@/app/_utils/shallow"` → `from "@/shared/lib/shallow"`

- [ ] **Step 3: OnboardingTitle.tsx 복사**

`src/pages/onboarding/ui/OnboardingTitle.tsx` — 기존 `app/onboarding/_components/onboarding-title.tsx` 내용 그대로.

- [ ] **Step 4: OnboardingHeader.tsx 복사**

`src/pages/onboarding/ui/OnboardingHeader.tsx` — 기존 `app/onboarding/_components/onboarding-header.tsx` 내용 그대로.

- [ ] **Step 5: OnboardingFooter.tsx 복사 (import 업데이트)**

`src/pages/onboarding/ui/OnboardingFooter.tsx` — 기존 `app/onboarding/_components/onboarding-footer.tsx` 에서:
- `from "../_hooks/useStep"` → `from "@/pages/onboarding/model/useStep"`
- `from "../_schemas/onboarding_schema"` → `from "@/pages/onboarding/model/onboarding_schema"`
- `from "@/app/_utils/session-storage"` → `from "@/shared/lib/session-storage"`
- `from "@/app/_components/loading"` → `from "@/shared/ui/Loading/Loading"`

- [ ] **Step 6: Step01DateRange.tsx 복사 (import 업데이트)**

`src/pages/onboarding/ui/Step01DateRange.tsx` — 기존 `app/onboarding/_components/step01/step-01-date-range.tsx` 에서:
- `from "@/app/_components/calendar"` → `from "@/shared/ui/Calendar/Calendar"`
- `from "@/app/_components/date-picker-input"` → `from "@/shared/ui/DatePickerInput/DatePickerInput"`
- `from "@/app/_components/button"` → `from "@/shared/ui/Button/Button"`

- [ ] **Step 7: Step01.tsx 복사 (import 업데이트)**

`src/pages/onboarding/ui/Step01.tsx` — 기존 `app/onboarding/_components/step01/step-01.tsx` 에서:
- `from "../../_schemas/onboarding_schema"` → `from "@/pages/onboarding/model/onboarding_schema"`
- `from "../onboarding-title"` → `from "@/pages/onboarding/ui/OnboardingTitle"`
- `from "./step-01-date-range"` → `from "@/pages/onboarding/ui/Step01DateRange"`

- [ ] **Step 8: Step02.tsx 복사 (import 업데이트)**

`src/pages/onboarding/ui/Step02.tsx` — 기존 `app/onboarding/_components/step02/step-02.tsx` 에서:
- `from "@/app/_components/checkbox-button-group"` → `from "@/features/filter/ui/CheckboxButtonGroup"`
- `from "../onboarding-title"` → `from "@/pages/onboarding/ui/OnboardingTitle"`
- `from "../../_schemas/onboarding_schema"` → `from "@/pages/onboarding/model/onboarding_schema"`
- `from "@/app/_constants/filter"` → `from "@/shared/config/filter"`

- [ ] **Step 9: Step03.tsx 복사 (import 업데이트)**

`src/pages/onboarding/ui/Step03.tsx` — 기존 `app/onboarding/_components/step03/step03.tsx` 에서 동일하게 경로 업데이트.

- [ ] **Step 10: OnboardingPage.tsx 생성**

`src/pages/onboarding/ui/OnboardingPage.tsx`:
```tsx
"use client";
import { Suspense } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingSchema, defaultValues } from "@/pages/onboarding/model/onboarding_schema";
import OnboardingHeader from "@/pages/onboarding/ui/OnboardingHeader";
import OnboardingFooter from "@/pages/onboarding/ui/OnboardingFooter";
import Step01 from "@/pages/onboarding/ui/Step01";
import Step02 from "@/pages/onboarding/ui/Step02";
import Step03 from "@/pages/onboarding/ui/Step03";
import useStep from "@/pages/onboarding/model/useStep";

function OnboardingContent() {
  const form = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
  });
  const { step, nextStep, isLastStep } = useStep();

  const renderStep = () => {
    switch (step) {
      case "1": return <Step01 />;
      case "2": return <Step02 />;
      case "3": return <Step03 />;
      default: return null;
    }
  };

  return (
    <FormProvider {...form}>
      <div className="relative h-full">
        <OnboardingHeader />
        {renderStep()}
        <div className="absolute bottom-0 w-full">
          <OnboardingFooter step={step as "1"|"2"|"3"} isLastStep={isLastStep} onNextStep={nextStep} />
        </div>
      </div>
    </FormProvider>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
```

- [ ] **Step 11: index.ts 생성**

`src/pages/onboarding/index.ts`:
```ts
export { default as OnboardingPage } from "./ui/OnboardingPage";
```

- [ ] **Step 12: 빌드 확인**

```bash
pnpm build
```

Expected: 성공

- [ ] **Step 13: 커밋**

```bash
git add src/pages/onboarding/
git commit -m "feat(pages/onboarding): add OnboardingPage with all steps"
```

---

### Task 16: pages/heritage-detail 생성

**Files:**
- Create: `src/pages/heritage-detail/ui/HeritageDetailPage.tsx`
- Create: `src/pages/heritage-detail/index.ts`

**Interfaces:**
- Consumes: `@/entities/heritage/data/heritageList`, `@/entities/heritage/model/heritage`
- Produces: `HeritageDetailPage` (props: `{ id: string }`)

- [ ] **Step 1: HeritageDetailPage.tsx 생성**

`src/pages/heritage-detail/ui/HeritageDetailPage.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { heritageList } from '@/entities/heritage/data/heritageList'

interface Props {
  id: string
}

export default function HeritageDetailPage({ id }: Props) {
  const heritage = heritageList.find(h => h.id === id)
  if (!heritage) notFound()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <Link href="/explore" aria-label="뒤로" className="text-white text-2xl leading-none">←</Link>
        <h1 className="text-base font-bold">{heritage.name}</h1>
      </div>
      <video src={heritage.videoSrc} className="w-full aspect-video object-cover" controls playsInline />
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
          <p className="text-sm leading-relaxed whitespace-pre-line text-white/90">{heritage.description}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: index.ts 생성**

`src/pages/heritage-detail/index.ts`:
```ts
export { default as HeritageDetailPage } from "./ui/HeritageDetailPage";
```

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
pnpm build
git add src/pages/heritage-detail/
git commit -m "feat(pages/heritage-detail): add HeritageDetailPage"
```

---

### Task 17: app/ shell 교체 + layout 업데이트

**Files:**
- Modify: `app/(landing)/page.tsx`
- Modify: `app/explore/page.tsx`
- Modify: `app/onboarding/page.tsx`
- Modify: `app/heritage/[id]/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: 모든 pages/* 와 widgets/* 산출물

- [ ] **Step 1: app/(landing)/page.tsx 교체**

```tsx
import { LandingPage } from '@/pages/landing'
export default LandingPage
```

- [ ] **Step 2: app/explore/page.tsx 교체**

```tsx
import { ExplorePage } from '@/pages/explore'
export default ExplorePage
```

- [ ] **Step 3: app/onboarding/page.tsx 교체**

```tsx
import { OnboardingPage } from '@/pages/onboarding'
export default OnboardingPage
```

- [ ] **Step 4: app/heritage/[id]/page.tsx 교체**

```tsx
import { HeritageDetailPage } from '@/pages/heritage-detail'

export default function Page({ params }: { params: { id: string } }) {
  return <HeritageDetailPage id={params.id} />
}
```

- [ ] **Step 5: app/layout.tsx 업데이트**

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { SWRProvider } from "@/shared/lib/swr-provider";
import Navigation from "@/widgets/navigation/ui/Navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "이음",
  description: "우리 무형문화재를 숏폼으로 만나다",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="relative bg-black">
        <Suspense fallback={null}>
          <SWRProvider>
            <main className="bg-black max-w-[393px] mx-auto h-dvh">
              {children}
              <Navigation />
            </main>
          </SWRProvider>
        </Suspense>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: 빌드 확인**

```bash
pnpm build
```

Expected: 성공 — 모든 라우트가 FSD 컴포넌트를 사용

- [ ] **Step 7: 커밋**

```bash
git add app/
git commit -m "refactor(app): replace all pages with thin FSD shell"
```

---

### Task 18: 테스트 업데이트 + 구 파일 삭제

**Files:**
- Modify: `__tests__/data.test.ts`
- Modify: `__tests__/LikeButton.test.tsx`
- Modify: `__tests__/ParticleEffect.test.tsx`
- Modify: `__tests__/HeritageCard.test.tsx`
- Modify: `__tests__/HeritageFeed.test.tsx`
- Modify: `__tests__/VideoPlayer.test.tsx`
- Modify: `__tests__/heritage-detail.test.tsx`
- Delete: `components/`, `data/`, `lib/`, `app/_components/`, `app/_constants/`, `app/_utils/`, `app/_providers/`, `app/explore/_components/`, `app/explore/_hooks/`, `app/explore/_apis/`, `app/onboarding/_components/`, `app/onboarding/_hooks/`, `app/onboarding/_schemas/`, `app/onboarding/_apis/`, `app/(landing)/_components/`

- [ ] **Step 1: 테스트 파일 import 업데이트**

`__tests__/data.test.ts`:
```ts
import { heritageList } from '@/entities/heritage/data/heritageList'
import type { Heritage } from '@/entities/heritage/model/heritage'
// 나머지 테스트 코드 동일
```

`__tests__/LikeButton.test.tsx`:
```tsx
import LikeButton from '@/features/like/ui/LikeButton'
```

`__tests__/ParticleEffect.test.tsx`:
```tsx
import ParticleEffect from '@/features/like/ui/ParticleEffect'
```

`__tests__/HeritageCard.test.tsx`:
```tsx
import HeritageCard from '@/widgets/shorts-swiper/ui/HeritageCard'
import { heritageList } from '@/entities/heritage/data/heritageList'

jest.mock('@/shared/ui/VideoPlayer/VideoPlayer', () => () => <div data-testid="video-player" />)
jest.mock('@/features/like/ui/ParticleEffect', () => ({ trigger }: { trigger: number }) => (
  <div data-testid="particle-effect" data-trigger={trigger} />
))
```

`__tests__/HeritageFeed.test.tsx`:
```tsx
import HeritageFeed from '@/widgets/shorts-swiper/ui/HeritageFeed'
import { heritageList } from '@/entities/heritage/data/heritageList'

jest.mock('@/widgets/shorts-swiper/ui/HeritageCard', () => ({ heritage }: { heritage: { name: string } }) => (
  <div data-testid="heritage-card">{heritage.name}</div>
))
```

`__tests__/VideoPlayer.test.tsx`:
```tsx
import VideoPlayer from '@/shared/ui/VideoPlayer/VideoPlayer'
```

`__tests__/heritage-detail.test.tsx`:
```tsx
import HeritageDetailPage from '@/pages/heritage-detail/ui/HeritageDetailPage'
import { heritageList } from '@/entities/heritage/data/heritageList'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

const heritage = heritageList[0]

describe('HeritageDetailPage', () => {
  it('renders heritage name in header', () => {
    render(<HeritageDetailPage id={heritage.id} />)
    expect(screen.getByText(heritage.name)).toBeInTheDocument()
  })

  it('renders category and region', () => {
    render(<HeritageDetailPage id={heritage.id} />)
    expect(screen.getByText(heritage.category)).toBeInTheDocument()
    expect(screen.getByText(heritage.region)).toBeInTheDocument()
  })

  it('renders 뒤로가기 link to explore', () => {
    render(<HeritageDetailPage id={heritage.id} />)
    const link = screen.getByRole('link', { name: /뒤로/ })
    expect(link).toHaveAttribute('href', '/explore')
  })

  it('throws notFound for unknown id', () => {
    expect(() =>
      render(<HeritageDetailPage id="does-not-exist" />)
    ).toThrow('NEXT_NOT_FOUND')
  })
})
```

- [ ] **Step 2: 테스트 실행 확인**

```bash
pnpm test
```

Expected: 25 passed

- [ ] **Step 3: tsconfig path alias 단순화**

`tsconfig.json` 에서 fallback 제거:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 4: jest.config.ts 단순화**

```ts
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
},
```

- [ ] **Step 5: 구 파일 삭제**

```bash
rm -rf components/
rm -rf data/
rm -rf lib/
rm -rf app/_components/
rm -rf app/_constants/
rm -rf app/_utils/
rm -rf app/_providers/
rm -rf "app/explore/_components/"
rm -rf "app/explore/_hooks/"
rm -rf "app/explore/_apis/"
rm -rf "app/onboarding/_components/"
rm -rf "app/onboarding/_hooks/"
rm -rf "app/onboarding/_schemas/"
rm -rf "app/onboarding/_apis/"
rm -rf "app/(landing)/_components/"
```

- [ ] **Step 6: 빌드 + 테스트 최종 확인**

```bash
pnpm build && pnpm test
```

Expected: 빌드 성공, 25 passed

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "refactor: complete FSD migration, remove old structure"
```
