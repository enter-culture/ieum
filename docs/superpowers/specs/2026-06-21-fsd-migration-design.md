# FSD 마이그레이션 설계

## 개요

Next.js App Router + 현재 flat 구조를 **Feature-Sliced Design(FSD)** 아키텍처로 전환한다.
vanilla-extract 전환은 이후 별도 작업으로 진행.

---

## 디렉토리 구조

```
ieum/
├── app/                          ← Next.js 라우팅 shell (import만)
│   ├── layout.tsx
│   ├── (landing)/page.tsx
│   ├── explore/page.tsx
│   ├── onboarding/page.tsx
│   └── heritage/[id]/page.tsx
│
└── src/
    ├── pages/
    │   ├── landing/
    │   │   └── ui/LandingPage.tsx
    │   ├── explore/
    │   │   └── ui/ExplorePage.tsx
    │   ├── onboarding/
    │   │   └── ui/OnboardingPage.tsx
    │   └── heritage-detail/
    │       └── ui/HeritageDetailPage.tsx
    │
    ├── widgets/
    │   ├── shorts-swiper/
    │   │   └── ui/ShortsSwiper.tsx
    │   ├── navigation/
    │   │   └── ui/Navigation.tsx
    │   └── filter-drawer/
    │       └── ui/FilterDrawerButton.tsx
    │
    ├── features/
    │   ├── like/
    │   │   └── ui/{LikeButton,ParticleEffect}.tsx
    │   ├── bookmark/
    │   │   └── ui/ShortsBookmark.tsx
    │   └── filter/
    │       └── ui/{ShortsFilterGroup,CheckboxButtonGroup}.tsx
    │
    ├── entities/
    │   └── heritage/
    │       ├── model/heritage.ts
    │       └── data/heritageList.ts
    │
    └── shared/
        ├── ui/
        │   ├── Button/
        │   ├── Calendar/
        │   ├── DatePickerInput/
        │   └── Loading/
        ├── lib/
        │   ├── utils.ts
        │   ├── session-storage.ts
        │   └── shallow.ts
        ├── api/
        │   ├── explore.ts
        │   └── onboarding.ts
        └── config/
            ├── filter.ts
            └── session-storage-key.ts
```

---

## 현재 파일 → 새 위치 매핑

| 현재 경로 | 새 경로 |
|---|---|
| `components/HeritageCard.tsx` | `src/widgets/shorts-swiper/ui/HeritageCard.tsx` |
| `components/HeritageFeed.tsx` | `src/widgets/shorts-swiper/ui/HeritageFeed.tsx` |
| `components/VideoPlayer.tsx` | `src/shared/ui/VideoPlayer/VideoPlayer.tsx` |
| `components/LikeButton.tsx` | `src/features/like/ui/LikeButton.tsx` |
| `components/ParticleEffect.tsx` | `src/features/like/ui/ParticleEffect.tsx` |
| `data/heritage.ts` | `src/entities/heritage/model/heritage.ts` (타입) + `src/entities/heritage/data/heritageList.ts` (데이터) |
| `lib/utils.ts` | `src/shared/lib/utils.ts` |
| `app/_components/navigation.tsx` | `src/widgets/navigation/ui/Navigation.tsx` |
| `app/_components/button.tsx` | `src/shared/ui/Button/Button.tsx` |
| `app/_components/calendar.tsx` | `src/shared/ui/Calendar/Calendar.tsx` |
| `app/_components/date-picker-input.tsx` | `src/shared/ui/DatePickerInput/DatePickerInput.tsx` |
| `app/_components/checkbox-button-group.tsx` | `src/features/filter/ui/CheckboxButtonGroup.tsx` |
| `app/_components/loading.tsx` | `src/shared/ui/Loading/Loading.tsx` |
| `app/_utils/session-storage.ts` | `src/shared/lib/session-storage.ts` |
| `app/_utils/shallow.ts` | `src/shared/lib/shallow.ts` |
| `app/_constants/filter.ts` | `src/shared/config/filter.ts` |
| `app/_constants/session-storage-key.ts` | `src/shared/config/session-storage-key.ts` |
| `app/_providers/swr-provider.tsx` | `src/shared/lib/swr-provider.tsx` |
| `app/explore/_components/shorts-swiper.tsx` | `src/widgets/shorts-swiper/ui/ShortsSwiper.tsx` |
| `app/explore/_components/shorts.tsx` | `src/widgets/shorts-swiper/ui/Shorts.tsx` |
| `app/explore/_components/shorts-bookmark.tsx` | `src/features/bookmark/ui/ShortsBookmark.tsx` |
| `app/explore/_components/shorts-info-section.tsx` | `src/widgets/shorts-swiper/ui/ShortsInfoSection.tsx` |
| `app/explore/_components/mute-toggle-icon.tsx` | `src/shared/ui/MuteToggleIcon/MuteToggleIcon.tsx` |
| `app/explore/_components/detail-drawer-button.tsx` | `src/widgets/shorts-swiper/ui/DetailDrawerButton.tsx` |
| `app/explore/_components/filter-drawer-button.tsx` | `src/widgets/filter-drawer/ui/FilterDrawerButton.tsx` |
| `app/explore/_components/shorts-filter-group.tsx` | `src/features/filter/ui/ShortsFilterGroup.tsx` |
| `app/explore/_hooks/useShorts.tsx` | `src/entities/heritage/model/useShorts.tsx` |
| `app/explore/_apis/explore.interface.ts` | `src/shared/api/explore.ts` |
| `app/onboarding/_components/*.tsx` | `src/pages/onboarding/ui/*.tsx` |
| `app/onboarding/_hooks/useStep.tsx` | `src/pages/onboarding/model/useStep.tsx` |
| `app/onboarding/_schemas/onboarding_schema.tsx` | `src/pages/onboarding/model/onboarding_schema.tsx` |
| `app/onboarding/_apis/onboarding.api.ts` | `src/shared/api/onboarding.ts` |
| `app/(landing)/_components/*.tsx` | `src/pages/landing/ui/*.tsx` |

---

## app/ shell 패턴

```tsx
// app/explore/page.tsx
import { ExplorePage } from '@/pages/explore'
export default ExplorePage

// app/heritage/[id]/page.tsx
import { HeritageDetailPage } from '@/pages/heritage-detail'
export default function Page({ params }: { params: { id: string } }) {
  return <HeritageDetailPage id={params.id} />
}
```

---

## tsconfig 경로 별칭

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

---

## 레이어 의존성 규칙

```
pages    → widgets, features, entities, shared
widgets  → features, entities, shared
features → entities, shared
entities → shared
shared   → 외부 라이브러리만
```

---

## 범위 외

- vanilla-extract 전환 (별도 작업)
- 테스트 파일 이동 (`__tests__/` → 각 슬라이스 내 `__tests__/`)
