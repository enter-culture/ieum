# 탑승권 팬 카드 UI 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 온보딩 카테고리 선택 화면을 탑승권(boarding pass) 스타일의 부채꼴 팬 카드 UI로 교체한다.

**Architecture:** `BoardingPassCard`(단일 카드)와 `BoardingPassFan`(팬 레이아웃 컨테이너) 두 컴포넌트를 `src/features/onboarding/ui/`에 신규 생성한다. `Step02`에서 기존 `CheckboxButtonGroup`을 `BoardingPassFan`으로 드롭인 교체하고, `CATEGORY_FILTER_OPTIONS`에 이모지와 이미지 경로 필드를 추가한다.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, CSS transition (애니메이션 별도 라이브러리 불필요), Jest + @testing-library/react

## Global Constraints

- Tailwind CSS v4 사용 (v3 문법인 `@apply` 최소화, 인라인 className 우선)
- 인라인 style은 동적 값(회전 각도, z-index 등)에만 사용
- 이미지 없을 경우 이모지로 폴백 처리 필수
- `onSelect` / `selectedValues` 인터페이스는 기존 `CheckboxButtonGroup`과 동일하게 유지
- 테스트는 jsdom 환경, `@testing-library/react` 사용

---

## 파일 맵

| 작업 | 경로 |
|------|------|
| 신규 생성 | `public/images/categories/` (이미지 8장) |
| 수정 | `src/shared/config/filter.ts` |
| 신규 생성 | `src/features/onboarding/ui/BoardingPassCard.tsx` |
| 신규 생성 | `src/features/onboarding/ui/__tests__/BoardingPassCard.test.tsx` |
| 신규 생성 | `src/features/onboarding/ui/BoardingPassFan.tsx` |
| 신규 생성 | `src/features/onboarding/ui/__tests__/BoardingPassFan.test.tsx` |
| 수정 | `src/views/onboarding/ui/Step02.tsx` |

---

### Task 1: 이미지 에셋 준비 + filter config 업데이트

**Files:**
- Create: `public/images/categories/music.png`, `dance.png`, `theater.png`, `play.png`, `ritual.png`, `martial.png`, `craft.png`, `food.png`
- Modify: `src/shared/config/filter.ts`

**Interfaces:**
- Produces: `CATEGORY_FILTER_OPTIONS` — `{ label, value, emoji, imageSrc }[]`

---

- [ ] **Step 1: ChatGPT(DALL-E)로 카테고리 이미지 8장 생성**

  아래 프롬프트를 ChatGPT에 각 카테고리별로 사용한다. 스타일을 통일하기 위해 공통 접두어를 유지한다.

  공통 접두어:
  ```
  Flat illustration, warm Korean traditional aesthetic, pastel colors, transparent background, 200x120px, no text, centered subject, minimal style
  ```

  카테고리별 추가 설명:
  - 음악 → `traditional Korean musician playing gayageum`
  - 무용 → `Korean traditional dancer in hanbok mid-movement`
  - 연극 → `Korean traditional mask dance performance`
  - 놀이 → `children playing traditional Korean folk games`
  - 의식 → `Korean ceremonial ritual with lanterns`
  - 무예 → `Korean martial artist in taekkyeon stance`
  - 공예 → `Korean artisan crafting pottery`
  - 음식 → `Korean traditional food arrangement on wooden table`

  생성된 이미지를 PNG로 저장 후 아래 경로에 배치한다:
  ```
  public/images/categories/music.png
  public/images/categories/dance.png
  public/images/categories/theater.png
  public/images/categories/play.png
  public/images/categories/ritual.png
  public/images/categories/martial.png
  public/images/categories/craft.png
  public/images/categories/food.png
  ```

- [ ] **Step 2: filter.ts에 emoji, imageSrc 필드 추가**

  `src/shared/config/filter.ts`를 아래와 같이 수정한다:

  ```ts
  export const CATEGORY_FILTER_OPTIONS = [
    { label: "음악", value: 1, emoji: "🎵", imageSrc: "/images/categories/music.png" },
    { label: "무용", value: 2, emoji: "💃", imageSrc: "/images/categories/dance.png" },
    { label: "연극", value: 3, emoji: "🎭", imageSrc: "/images/categories/theater.png" },
    { label: "놀이", value: 4, emoji: "🎠", imageSrc: "/images/categories/play.png" },
    { label: "의식", value: 5, emoji: "🪔", imageSrc: "/images/categories/ritual.png" },
    { label: "무예", value: 6, emoji: "🥋", imageSrc: "/images/categories/martial.png" },
    { label: "공예", value: 7, emoji: "🏺", imageSrc: "/images/categories/craft.png" },
    { label: "음식", value: 8, emoji: "🍱", imageSrc: "/images/categories/food.png" },
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

- [ ] **Step 3: 빌드 에러 없는지 확인**

  ```bash
  pnpm build 2>&1 | tail -20
  ```
  Expected: 에러 없음 (기존 `CheckboxButtonGroup`은 `label`, `value`만 사용하므로 추가 필드 무시됨)

- [ ] **Step 4: Commit**

  ```bash
  git add public/images/categories/ src/shared/config/filter.ts
  git commit -m "feat: add category images and emoji to CATEGORY_FILTER_OPTIONS"
  ```

---

### Task 2: BoardingPassCard 컴포넌트

**Files:**
- Create: `src/features/onboarding/ui/BoardingPassCard.tsx`
- Create: `src/features/onboarding/ui/__tests__/BoardingPassCard.test.tsx`

**Interfaces:**
- Consumes: 없음 (독립 컴포넌트)
- Produces:
  ```ts
  interface BoardingPassCardProps {
    label: string;
    emoji: string;
    imageSrc?: string;
    isSelected: boolean;
    onClick: () => void;
  }
  export default function BoardingPassCard(props: BoardingPassCardProps): JSX.Element
  ```

---

- [ ] **Step 1: 실패하는 테스트 작성**

  `src/features/onboarding/ui/__tests__/BoardingPassCard.test.tsx`:

  ```tsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import BoardingPassCard from "../BoardingPassCard";

  const defaultProps = {
    label: "음악",
    emoji: "🎵",
    isSelected: false,
    onClick: jest.fn(),
  };

  describe("BoardingPassCard", () => {
    it("카테고리 이름을 렌더링한다", () => {
      render(<BoardingPassCard {...defaultProps} />);
      expect(screen.getByText("음악")).toBeInTheDocument();
    });

    it("비선택 상태에서는 SELECTED 배지가 없다", () => {
      render(<BoardingPassCard {...defaultProps} isSelected={false} />);
      expect(screen.queryByText("✓ SELECTED")).not.toBeInTheDocument();
    });

    it("선택 상태에서는 SELECTED 배지가 표시된다", () => {
      render(<BoardingPassCard {...defaultProps} isSelected={true} />);
      expect(screen.getByText("✓ SELECTED")).toBeInTheDocument();
    });

    it("클릭하면 onClick이 호출된다", () => {
      const onClick = jest.fn();
      render(<BoardingPassCard {...defaultProps} onClick={onClick} />);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
  ```

- [ ] **Step 2: 테스트 실패 확인**

  ```bash
  pnpm test src/features/onboarding/ui/__tests__/BoardingPassCard.test.tsx --no-coverage
  ```
  Expected: FAIL — `Cannot find module '../BoardingPassCard'`

- [ ] **Step 3: BoardingPassCard 구현**

  `src/features/onboarding/ui/BoardingPassCard.tsx`:

  ```tsx
  import Image from "next/image";

  interface BoardingPassCardProps {
    label: string;
    emoji: string;
    imageSrc?: string;
    isSelected: boolean;
    onClick: () => void;
  }

  export default function BoardingPassCard({
    label,
    emoji,
    imageSrc,
    isSelected,
    onClick,
  }: BoardingPassCardProps) {
    return (
      <button
        onClick={onClick}
        className="relative w-[110px] h-[170px] bg-white rounded-xl shadow-md flex flex-col overflow-hidden select-none"
        style={{
          border: isSelected ? "2px solid #ee7f12" : "2px solid transparent",
        }}
      >
        {/* 선택 배지 */}
        {isSelected && (
          <div className="absolute top-2 right-2 z-10 bg-[#ee7f12] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-tight">
            ✓ SELECTED
          </div>
        )}

        {/* 헤더 */}
        <div className="bg-[#FFF3E0] px-2 py-1.5 flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-[#ee7f12] tracking-widest">이음 AIR ✈️</span>
          <span className="text-[8px] text-gray-500 truncate">GATE: {label}</span>
        </div>

        {/* 퍼포레이션 */}
        <div className="border-t border-dashed border-gray-200 mx-2" />

        {/* 이미지 or 이모지 */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={label}
              width={80}
              height={50}
              className="object-contain"
            />
          ) : (
            <span className="text-3xl">{emoji}</span>
          )}
        </div>

        {/* 퍼포레이션 */}
        <div className="border-t border-dashed border-gray-200 mx-2" />

        {/* 하단 */}
        <div className="px-2 py-1.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-gray-800 truncate">{label}</span>
          <span className="text-[7px] text-gray-400 tracking-widest">BOARDING PASS</span>
          {/* 바코드 */}
          <div className="flex gap-px mt-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-300"
                style={{ width: i % 3 === 0 ? 2 : 1, height: 8 }}
              />
            ))}
          </div>
        </div>
      </button>
    );
  }
  ```

- [ ] **Step 4: 테스트 통과 확인**

  ```bash
  pnpm test src/features/onboarding/ui/__tests__/BoardingPassCard.test.tsx --no-coverage
  ```
  Expected: PASS (4개 테스트 모두 통과)

- [ ] **Step 5: Commit**

  ```bash
  git add src/features/onboarding/
  git commit -m "feat: add BoardingPassCard component"
  ```

---

### Task 3: BoardingPassFan 컴포넌트

**Files:**
- Create: `src/features/onboarding/ui/BoardingPassFan.tsx`
- Create: `src/features/onboarding/ui/__tests__/BoardingPassFan.test.tsx`

**Interfaces:**
- Consumes:
  ```ts
  // BoardingPassCard
  import BoardingPassCard from "./BoardingPassCard"
  // props: { label, emoji, imageSrc?, isSelected, onClick }
  ```
- Produces:
  ```ts
  interface BoardingPassFanProps {
    options: { label: string; value: number | string; emoji: string; imageSrc?: string }[];
    selectedValues: (number | string)[];
    onSelect: (value: number | string) => void;
  }
  export default function BoardingPassFan(props: BoardingPassFanProps): JSX.Element
  ```

---

- [ ] **Step 1: 실패하는 테스트 작성**

  `src/features/onboarding/ui/__tests__/BoardingPassFan.test.tsx`:

  ```tsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import BoardingPassFan from "../BoardingPassFan";

  const options = [
    { label: "음악", value: 1, emoji: "🎵" },
    { label: "무용", value: 2, emoji: "💃" },
    { label: "연극", value: 3, emoji: "🎭" },
  ];

  describe("BoardingPassFan", () => {
    it("모든 옵션 카드를 렌더링한다", () => {
      render(
        <BoardingPassFan options={options} selectedValues={[]} onSelect={jest.fn()} />
      );
      expect(screen.getByText("음악")).toBeInTheDocument();
      expect(screen.getByText("무용")).toBeInTheDocument();
      expect(screen.getByText("연극")).toBeInTheDocument();
    });

    it("카드 클릭 시 onSelect가 해당 value로 호출된다", () => {
      const onSelect = jest.fn();
      render(
        <BoardingPassFan options={options} selectedValues={[]} onSelect={onSelect} />
      );
      fireEvent.click(screen.getAllByRole("button")[0]);
      expect(onSelect).toHaveBeenCalledWith(1);
    });

    it("selectedValues에 포함된 카드는 선택 상태로 표시된다", () => {
      render(
        <BoardingPassFan options={options} selectedValues={[1]} onSelect={jest.fn()} />
      );
      expect(screen.getByText("✓ SELECTED")).toBeInTheDocument();
    });

    it("선택된 카드 재클릭 시 onSelect가 다시 호출된다 (해제는 부모가 처리)", () => {
      const onSelect = jest.fn();
      render(
        <BoardingPassFan options={options} selectedValues={[1]} onSelect={onSelect} />
      );
      fireEvent.click(screen.getAllByRole("button")[0]);
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });
  ```

- [ ] **Step 2: 테스트 실패 확인**

  ```bash
  pnpm test src/features/onboarding/ui/__tests__/BoardingPassFan.test.tsx --no-coverage
  ```
  Expected: FAIL — `Cannot find module '../BoardingPassFan'`

- [ ] **Step 3: BoardingPassFan 구현**

  `src/features/onboarding/ui/BoardingPassFan.tsx`:

  ```tsx
  import BoardingPassCard from "./BoardingPassCard";

  // 8장 기준 각도 배열: -70° ~ +70°, 20° 간격
  const ANGLES = [-70, -50, -30, -10, 10, 30, 50, 70];
  // 중앙 카드가 위에 오도록 z-index 설정
  const Z_INDICES = [1, 2, 3, 4, 4, 3, 2, 1];

  interface BoardingPassFanProps {
    options: { label: string; value: number | string; emoji: string; imageSrc?: string }[];
    selectedValues: (number | string)[];
    onSelect: (value: number | string) => void;
  }

  export default function BoardingPassFan({
    options,
    selectedValues,
    onSelect,
  }: BoardingPassFanProps) {
    return (
      <div className="relative w-full h-72 flex items-end justify-center">
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value);
          const angle = ANGLES[index] ?? 0;
          const zIndex = isSelected ? 10 : (Z_INDICES[index] ?? 1);

          return (
            <div
              key={option.value}
              className="absolute bottom-4"
              style={{
                zIndex,
                transform: `rotate(${angle}deg) translateY(${isSelected ? "-24px" : "0px"})`,
                transformOrigin: "bottom center",
                transition: "transform 0.2s ease-out, z-index 0s",
              }}
            >
              <BoardingPassCard
                label={option.label}
                emoji={option.emoji}
                imageSrc={option.imageSrc}
                isSelected={isSelected}
                onClick={() => onSelect(option.value)}
              />
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 4: 테스트 통과 확인**

  ```bash
  pnpm test src/features/onboarding/ui/__tests__/BoardingPassFan.test.tsx --no-coverage
  ```
  Expected: PASS (4개 테스트 모두 통과)

- [ ] **Step 5: Commit**

  ```bash
  git add src/features/onboarding/ui/BoardingPassFan.tsx src/features/onboarding/ui/__tests__/BoardingPassFan.test.tsx
  git commit -m "feat: add BoardingPassFan layout component"
  ```

---

### Task 4: Step02에 BoardingPassFan 적용

**Files:**
- Modify: `src/views/onboarding/ui/Step02.tsx`

**Interfaces:**
- Consumes:
  ```ts
  // BoardingPassFan
  // props: { options, selectedValues, onSelect }
  // options 타입: { label, value, emoji, imageSrc? }[]

  // CATEGORY_FILTER_OPTIONS (updated)
  // 타입: { label: string; value: number; emoji: string; imageSrc: string }[]
  ```

---

- [ ] **Step 1: Step02 교체**

  `src/views/onboarding/ui/Step02.tsx` 전체를 아래로 교체한다:

  ```tsx
  "use client";
  import { useFormContext } from "react-hook-form";
  import { OnboardingSchema } from "@/views/onboarding/model/onboarding_schema";
  import OnboardingTitle from "@/views/onboarding/ui/OnboardingTitle";
  import BoardingPassFan from "@/features/onboarding/ui/BoardingPassFan";
  import { CATEGORY_FILTER_OPTIONS } from "@/shared/config/filter";

  export default function Step02() {
    const { setValue, watch } = useFormContext<OnboardingSchema>();
    const placeCategoryList = watch("placeCategoryList") || [];

    const handleSelect = (value: number | string) => {
      const numValue = Number(value);
      if (placeCategoryList.includes(numValue)) {
        setValue("placeCategoryList", placeCategoryList.filter((v) => v !== numValue));
      } else {
        setValue("placeCategoryList", [...placeCategoryList, numValue]);
      }
    };

    return (
      <div className="flex flex-col gap-4 px-6 py-8 h-full">
        <OnboardingTitle
          title="어떤 무형문화재에 관심있으세요?"
          subtitle="카드를 탭해서 탑승권을 골라보세요"
        />
        <BoardingPassFan
          options={CATEGORY_FILTER_OPTIONS}
          selectedValues={placeCategoryList}
          onSelect={handleSelect}
        />
      </div>
    );
  }
  ```

- [ ] **Step 2: 타입 에러 없는지 확인**

  ```bash
  pnpm build 2>&1 | grep -E "error|Error" | head -20
  ```
  Expected: 에러 없음

- [ ] **Step 3: 개발 서버에서 실제 화면 확인**

  ```bash
  pnpm dev
  ```

  브라우저에서 `http://localhost:3000/onboarding` 접속 후 확인 사항:
  - 8장 탑승권 카드가 부채꼴로 펼쳐짐
  - 카드 탭 시 위로 올라오고 주황색 테두리 + SELECTED 배지 표시
  - 재탭 시 선택 해제
  - 1개 이상 선택 시 하단 "다음으로" 버튼 활성화

- [ ] **Step 4: 전체 테스트 통과 확인**

  ```bash
  pnpm test --no-coverage
  ```
  Expected: 모든 테스트 PASS

- [ ] **Step 5: Commit**

  ```bash
  git add src/views/onboarding/ui/Step02.tsx
  git commit -m "feat: replace category checkbox with BoardingPassFan in onboarding step 1"
  ```
