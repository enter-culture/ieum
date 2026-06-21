# 탑승권 카드 팬 선택 UI 스펙

## 개요

온보딩 Step 1(무형문화재 카테고리 선택)의 기존 체크박스 버튼 그룹을 탑승권(boarding pass) 스타일의 팬(fan) 카드 UI로 교체한다.

## 적용 범위

- `src/views/onboarding/ui/Step02.tsx` (현재 Step 1로 렌더링되는 카테고리 선택 화면)
- 신규 컴포넌트: `src/features/onboarding/ui/BoardingPassCard.tsx`
- 신규 컴포넌트: `src/features/onboarding/ui/BoardingPassFan.tsx`
- 이미지 에셋: `public/images/categories/` (ChatGPT로 생성한 카테고리별 일러스트 8장)

## 카테고리 목록

| value | label | 이모지 |
|-------|-------|--------|
| 1 | 음악 | 🎵 |
| 2 | 무용 | 💃 |
| 3 | 연극 | 🎭 |
| 4 | 놀이 | 🎠 |
| 5 | 의식 | 🪔 |
| 6 | 무예 | 🥋 |
| 7 | 공예 | 🏺 |
| 8 | 음식 | 🍱 |

## 카드 디자인

### 구조
```
┌─────────────────────┐
│  이음 AIR  ✈️       │  ← 헤더 (브랜딩)
│  GATE: [카테고리명]  │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─│  ← 점선 퍼포레이션
│  [카테고리 이미지]   │  ← 카테고리 일러스트
│  [카테고리명] 크게   │
│  BOARDING PASS      │
│  ││││││││││││││    │  ← 장식용 바코드
└─────────────────────┘
```

### 스타일
- 배경: 흰색, 둥근 모서리 (rounded-xl)
- 크기: 약 120px × 180px (팬 레이아웃 기준)
- 상단 헤더: 연한 주황색 배경 (#FFF3E0), "이음 AIR ✈️" + GATE: [카테고리명]
- 중단: 카테고리 일러스트 이미지 (ChatGPT 생성)
- 하단: 카테고리명 (bold), "BOARDING PASS" 서브텍스트, 바코드 SVG
- 퍼포레이션: 점선 border-dashed border-t

### 선택 상태
- 비선택: 흰색 카드, 그림자 기본
- 선택됨: 주황색 테두리 (`border-2 border-[#ee7f12]`), 우상단에 "✓ SELECTED" 스탬프 오버레이 (주황색 원형 배지), 카드가 위로 20px 이동

## 팬(Fan) 레이아웃

### 배치 방식
- 8장 카드를 공통 하단 중심점 기준으로 회전 배치
- 전체 펼침 각도: -70° ~ +70° (총 140°)
- 카드 간 각도 간격: 20°
- 회전 중심: `transform-origin: bottom center`
- 카드 겹침: z-index를 중앙에서 양 끝으로 갈수록 낮아지게 설정 (중앙 카드가 위에 표시)

### 컨테이너
- 화면 하단 고정, 충분한 높이 확보 (약 280px)
- 카드 상단만 보이도록 overflow-hidden 처리

## 인터랙션

### 탭 선택
- 탭 시 해당 카드가 `translateY(-20px)` 애니메이션으로 위로 올라옴
- 선택 상태: 주황색 테두리 + "✓ SELECTED" 배지 표시
- 재탭 시 선택 해제, 카드 원위치로 복귀
- 다중 선택 가능

### 애니메이션
- 라이브러리: CSS transition (`transition-transform duration-200 ease-out`)
- 별도 애니메이션 라이브러리 불필요

## 이미지 에셋

ChatGPT(DALL-E)로 생성할 일러스트 스펙:
- 스타일: 플랫 일러스트, 한국 전통 느낌, 따뜻한 색감
- 크기: 200×120px (PNG, 투명 배경)
- 파일명: `public/images/categories/music.png`, `dance.png`, `theater.png`, `play.png`, `ritual.png`, `martial.png`, `craft.png`, `food.png`
- 이미지 생성 후 프로젝트에 수동 추가 필요

## 데이터 인터페이스

기존 `CheckboxButtonGroup`의 `onSelect` / `selectedValues` 인터페이스를 그대로 유지한다. `BoardingPassFan`은 동일한 props를 받아 드롭인 교체 가능하다.

```ts
interface BoardingPassFanProps {
  options: { label: string; value: number | string }[];
  selectedValues: (number | string)[];
  onSelect: (value: number | string) => void;
}
```

## 비적용 범위

- Step 2(지역 선택)는 이번 스펙에 포함하지 않음. 기존 체크박스 버튼 그룹 유지.
