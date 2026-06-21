# 좋아요 기반 주변 추천 지도 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 좋아요한 무형문화재의 지역을 중심으로 한국문화정보원 공연/전시 공공데이터를 Kakao 지도에 추천하고, 마커 탭 시 바텀시트로 상세를 보여준다.

**Architecture:** 백엔드(ieum-api)는 한국문화정보원 period2 API를 프록시(키 은닉)하고 정규화 JSON을 반환한다. 프론트(ieum)는 좋아요→문화재 좌표→좌표별 bbox로 백엔드 호출→Kakao 지도 마커+바텀시트로 렌더한다. 기존 TourAPI(여행지) 경로는 제거하고 여행지 탭도 문화 데이터로 전환한다.

**Tech Stack:** NestJS(+xml2js, jest), Next.js(App Router, React, SWR, jest/RTL), Kakao Maps JS SDK.

## Global Constraints

- data.go.kr 인증키는 **백엔드에만** 둔다(`DATA_GO_KR_API_KEY`). 프론트는 절대 직접 호출하지 않는다.
- Kakao JS 키는 `NEXT_PUBLIC_KAKAO_MAP_KEY`(이미 `.env.local`에 존재).
- period2 base URL: `https://apis.data.go.kr/B553457/cultureinfo/period2`. serviceKey는 UTF-8 URL 인코딩 1회.
- period2 응답 필드(검증됨): `serviceName, seq, title, startDate, endDate, place, realmName, area, sigungu, thumbnail, gpsX(경도), gpsY(위도)`.
- 좋아요 문화재 대표 좌표(curated): 택견 `36.9910,127.9259` / 하회별신굿탈놀이 `36.5390,128.5180` / 남사당놀이 `37.0078,127.2797` / 강강술래 `34.4867,126.2630` / 판소리 `35.8147,127.1480`.
- 테스트: 두 리포 모두 `pnpm test`(jest).
- 커밋은 각 Task 끝에서. 프론트=`ieum`, 백엔드=`ieum-api` 리포에서 각각.

---

## Phase A — 백엔드 (ieum-api): 문화 API 프록시

### Task 1: CultureService — period2 프록시 + 정규화

**Files:**
- Create: `src/culture/culture.service.ts`
- Test: `src/culture/culture.service.spec.ts`

**Interfaces:**
- Produces: `CultureService.events(bbox: Bbox, from: string, to: string): Promise<CultureEvent[]>`
  - `Bbox = { xfrom: number; yfrom: number; xto: number; yto: number }` (x=경도, y=위도)
  - `CultureEvent = { id: string; kind: string; title: string; genre: string; place: string; area: string; sigungu: string; startDate: string; endDate: string; thumbnail: string | null; lat: number; lng: number }`

- [ ] **Step 1: Write the failing test**

```ts
// src/culture/culture.service.spec.ts
import { CultureService } from './culture.service';
import { ConfigService } from '@nestjs/config';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?><response><header><resultCode>00</resultCode></header><body><totalCount>1</totalCount><items><item><serviceName>공연</serviceName><seq>378998</seq><title>트리플 노트</title><startDate>20260604</startDate><endDate>20260604</endDate><place>안동문화예술의전당</place><realmName>기타</realmName><area>경북</area><sigungu>안동시</sigungu><thumbnail>http://x/a.jpg</thumbnail><gpsX>128.7257</gpsX><gpsY>36.5594</gpsY></item></items></body></response>`;

describe('CultureService', () => {
  const config = { get: () => 'TESTKEY' } as unknown as ConfigService;

  it('normalizes period2 XML into CultureEvent[]', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(SAMPLE_XML),
    }) as unknown as typeof fetch;

    const svc = new CultureService(config);
    const out = await svc.events(
      { xfrom: 128.3, yfrom: 36.4, xto: 128.8, yto: 36.8 },
      '20260601',
      '20260831',
    );

    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      id: '378998',
      kind: '공연',
      title: '트리플 노트',
      genre: '기타',
      place: '안동문화예술의전당',
      area: '경북',
      sigungu: '안동시',
      startDate: '20260604',
      endDate: '20260604',
      thumbnail: 'http://x/a.jpg',
      lat: 36.5594,
      lng: 128.7257,
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('cultureinfo/period2');
    expect(calledUrl).toContain('serviceKey=TESTKEY');
    expect(calledUrl).toContain('gpsxfrom=128.3');
  });

  it('returns [] when no items', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<?xml version="1.0"?><response><body><items></items></body></response>'),
    }) as unknown as typeof fetch;
    const svc = new CultureService(config);
    const out = await svc.events({ xfrom: 0, yfrom: 0, xto: 1, yto: 1 }, '20260601', '20260831');
    expect(out).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- culture.service`
Expected: FAIL — cannot find module `./culture.service`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/culture/culture.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseStringPromise } from 'xml2js';

export interface Bbox {
  xfrom: number;
  yfrom: number;
  xto: number;
  yto: number;
}

export interface CultureEvent {
  id: string;
  kind: string;
  title: string;
  genre: string;
  place: string;
  area: string;
  sigungu: string;
  startDate: string;
  endDate: string;
  thumbnail: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class CultureService {
  private readonly base = 'https://apis.data.go.kr/B553457/cultureinfo';

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string {
    return this.config.get<string>('DATA_GO_KR_API_KEY') ?? '';
  }

  async events(bbox: Bbox, from: string, to: string): Promise<CultureEvent[]> {
    const key = encodeURIComponent(this.apiKey);
    const params = [
      `serviceKey=${key}`,
      `from=${from}`,
      `to=${to}`,
      `cPage=1`,
      `rows=50`,
      `gpsxfrom=${bbox.xfrom}`,
      `gpsyfrom=${bbox.yfrom}`,
      `gpsxto=${bbox.xto}`,
      `gpsyto=${bbox.yto}`,
      `sortStdr=1`,
    ].join('&');

    const res = await fetch(`${this.base}/period2?${params}`);
    const xml = await res.text();
    const data = await parseStringPromise(xml, {
      explicitArray: false,
      trim: true,
    }).catch(() => null);

    const items = data?.response?.body?.items?.item;
    const list = items ? (Array.isArray(items) ? items : [items]) : [];

    return list.map((i: Record<string, string>) => ({
      id: String(i.seq ?? ''),
      kind: i.serviceName ?? '',
      title: i.title ?? '',
      genre: i.realmName ?? '',
      place: i.place ?? '',
      area: i.area ?? '',
      sigungu: i.sigungu ?? '',
      startDate: i.startDate ?? '',
      endDate: i.endDate ?? '',
      thumbnail: i.thumbnail || null,
      lat: Number(i.gpsY),
      lng: Number(i.gpsX),
    }));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- culture.service`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/culture/culture.service.ts src/culture/culture.service.spec.ts
git commit -m "feat: 문화정보원 공연/전시 프록시 서비스(period2 정규화)"
```

---

### Task 2: CultureController + Module 등록

**Files:**
- Create: `src/culture/culture.controller.ts`
- Create: `src/culture/culture.module.ts`
- Modify: `src/app.module.ts` (imports에 CultureModule 추가)

**Interfaces:**
- Consumes: `CultureService.events` (Task 1).
- Produces: `GET /api/culture/events?xfrom&yfrom&xto&yto&from&to` → `CultureEvent[]` (JSON).

- [ ] **Step 1: Write the controller**

```ts
// src/culture/culture.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CultureEvent, CultureService } from './culture.service';

@ApiTags('culture')
@Controller('culture')
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @Get('events')
  events(
    @Query('xfrom') xfrom: string,
    @Query('yfrom') yfrom: string,
    @Query('xto') xto: string,
    @Query('yto') yto: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<CultureEvent[]> {
    return this.cultureService.events(
      {
        xfrom: Number(xfrom),
        yfrom: Number(yfrom),
        xto: Number(xto),
        yto: Number(yto),
      },
      from,
      to,
    );
  }
}
```

- [ ] **Step 2: Write the module**

```ts
// src/culture/culture.module.ts
import { Module } from '@nestjs/common';
import { CultureController } from './culture.controller';
import { CultureService } from './culture.service';

@Module({
  controllers: [CultureController],
  providers: [CultureService],
})
export class CultureModule {}
```

- [ ] **Step 3: Register in app.module.ts**

`src/app.module.ts` 상단 import 추가:
```ts
import { CultureModule } from './culture/culture.module';
```
`@Module({ imports: [...] })` 배열에 `CultureModule,` 추가 (예: `HeritageModule,` 다음 줄).

- [ ] **Step 4: Build to verify wiring**

Run: `pnpm build`
Expected: 에러 없이 컴파일.

- [ ] **Step 5: Commit**

```bash
git add src/culture/culture.controller.ts src/culture/culture.module.ts src/app.module.ts
git commit -m "feat: GET /api/culture/events 컨트롤러 + 모듈 등록"
```

---

### Task 3: TourAPI(여행지) 제거 + 키 단일화

**Files:**
- Delete: `src/destinations/` (controller, service, module 전체)
- Modify: `src/app.module.ts` (DestinationsModule import/등록 제거)
- Modify: `src/heritage/heritage.service.ts:47` (`HERITAGE_API_KEY` → `DATA_GO_KR_API_KEY`)
- Modify: `render.yaml` (`TOUR_API_KEY` 제거, `HERITAGE_API_KEY` → `DATA_GO_KR_API_KEY`)
- Modify: `.env`, `.env.example` (동일 정리)

**Interfaces:**
- 없음(삭제/정리). 이후 어떤 Task도 `TOUR_API_KEY`·`destinations`를 참조하지 않는다.

- [ ] **Step 1: Delete destinations module**

```bash
git rm -r src/destinations
```

- [ ] **Step 2: Remove from app.module.ts**

`src/app.module.ts`에서 `import { DestinationsModule } from './destinations/destinations.module';` 줄과 imports 배열의 `DestinationsModule,` 제거.

- [ ] **Step 3: Unify key in heritage.service.ts**

`src/heritage/heritage.service.ts`의
```ts
return this.config.get<string>('HERITAGE_API_KEY') ?? FALLBACK_KEY;
```
를
```ts
return this.config.get<string>('DATA_GO_KR_API_KEY') ?? FALLBACK_KEY;
```
로 변경.

- [ ] **Step 4: Clean env declarations**

`render.yaml`에서 `- key: TOUR_API_KEY` 블록 삭제, `- key: HERITAGE_API_KEY`를 `- key: DATA_GO_KR_API_KEY`로 변경.
`.env`/`.env.example`에서 `TOUR_API_KEY=` 삭제, `HERITAGE_API_KEY=`를 `DATA_GO_KR_API_KEY=`로 변경.

- [ ] **Step 5: Build + test**

Run: `pnpm build && pnpm test`
Expected: 컴파일 성공, 기존 테스트 + culture 테스트 통과.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: TourAPI/여행지 백엔드 제거 + data.go.kr 키 단일화(DATA_GO_KR_API_KEY)"
```

> ⚠️ 배포 후 Render 대시보드에 `DATA_GO_KR_API_KEY` 값 설정 필요(기존 키와 동일 값). `TOUR_API_KEY`는 삭제.

---

## Phase B — 프론트 데이터 계층 (ieum)

### Task 4: heritageList에 대표 좌표 추가

**Files:**
- Modify: `src/entities/heritage/data/heritageList.ts` (각 항목에 `lat`, `lng` 추가)

**Interfaces:**
- Produces: `heritageList[i].lat: number`, `heritageList[i].lng: number` (5개 항목 모두).

- [ ] **Step 1: Add coords to each entry**

각 항목 객체에 아래 좌표를 추가(`likes` 다음 줄 등):
- `ganggang-sullae`: `lat: 34.4867, lng: 126.2630`
- `pansori`: `lat: 35.8147, lng: 127.1480`
- `hahoetal`: `lat: 36.5390, lng: 128.5180`
- `namsadang`: `lat: 37.0078, lng: 127.2797`
- `taekkyeon`: `lat: 36.9910, lng: 127.9259`

타입 정의가 있으면(인터페이스) `lat: number; lng: number;` 필드 추가.

- [ ] **Step 2: Build to verify types**

Run: `pnpm build`
Expected: 타입 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/entities/heritage/data/heritageList.ts
git commit -m "feat: heritageList에 대표 좌표(lat/lng) 추가"
```

---

### Task 5: heritage-geo — 좌표 해결 순수 함수

**Files:**
- Create: `src/shared/lib/heritage-geo.ts`
- Test: `__tests__/heritage-geo.test.ts`

**Interfaces:**
- Consumes: `heritageList` (Task 4).
- Produces: `resolveHeritageCoord(heritageId?: string): { lat: number; lng: number } | null`
  (heritageId가 heritageList에 있으면 좌표, 없으면 null — Kakao 지오코딩 폴백은 Task 10에서 클라이언트단 처리)

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/heritage-geo.test.ts
import { resolveHeritageCoord } from '@/shared/lib/heritage-geo';

describe('resolveHeritageCoord', () => {
  it('returns coords for a known heritageId', () => {
    expect(resolveHeritageCoord('taekkyeon')).toEqual({ lat: 36.9910, lng: 127.9259 });
  });
  it('returns null for unknown id', () => {
    expect(resolveHeritageCoord('nope')).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(resolveHeritageCoord(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- heritage-geo`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

```ts
// src/shared/lib/heritage-geo.ts
import { heritageList } from "@/entities/heritage/data/heritageList";

export interface Coord {
  lat: number;
  lng: number;
}

/** heritageId → 대표 좌표. 없으면 null. */
export function resolveHeritageCoord(heritageId?: string): Coord | null {
  if (!heritageId) return null;
  const h = heritageList.find((x) => x.id === heritageId) as
    | { lat?: number; lng?: number }
    | undefined;
  if (!h || typeof h.lat !== "number" || typeof h.lng !== "number") return null;
  return { lat: h.lat, lng: h.lng };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- heritage-geo`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/heritage-geo.ts __tests__/heritage-geo.test.ts
git commit -m "feat: resolveHeritageCoord(heritageId→좌표) 순수 함수"
```

---

### Task 6: culture api 클라이언트 — bbox 생성 + fan-out + dedup

**Files:**
- Create: `src/shared/api/culture.ts`
- Test: `__tests__/culture-api.test.ts`

**Interfaces:**
- Consumes: `apiUrl` from `@/shared/api/base`; `Coord` from `@/shared/lib/heritage-geo`.
- Produces:
  - `toBbox(center: Coord, pad?: number): { xfrom; yfrom; xto; yto }` (pad 기본 0.05, x=lng, y=lat)
  - `CultureEvent` 타입 (백엔드와 동일 형태)
  - `fetchEventsForCenters(centers: Coord[], from: string, to: string): Promise<CultureEvent[]>` — 좌표별 호출(allSettled) 후 `id` dedup.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/culture-api.test.ts
import { toBbox, fetchEventsForCenters } from '@/shared/api/culture';

describe('toBbox', () => {
  it('pads center by default 0.05', () => {
    expect(toBbox({ lat: 36.5, lng: 128.5 })).toEqual({
      xfrom: 128.45, yfrom: 36.45, xto: 128.55, yto: 36.55,
    });
  });
});

describe('fetchEventsForCenters', () => {
  const ev = (id: string) => ({
    id, kind: '공연', title: 't' + id, genre: '', place: '', area: '',
    sigungu: '', startDate: '', endDate: '', thumbnail: null, lat: 1, lng: 1,
  });

  it('merges results and dedups by id, tolerating a failed center', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([ev('1'), ev('2')]) })
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([ev('2'), ev('3')]) }) as unknown as typeof fetch;

    const out = await fetchEventsForCenters(
      [{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 3 }],
      '20260601', '20260831',
    );
    expect(out.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- culture-api`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

```ts
// src/shared/api/culture.ts
import { apiUrl } from "@/shared/api/base";
import type { Coord } from "@/shared/lib/heritage-geo";

export interface CultureEvent {
  id: string;
  kind: string;
  title: string;
  genre: string;
  place: string;
  area: string;
  sigungu: string;
  startDate: string;
  endDate: string;
  thumbnail: string | null;
  lat: number;
  lng: number;
}

export function toBbox(center: Coord, pad = 0.05) {
  return {
    xfrom: center.lng - pad,
    yfrom: center.lat - pad,
    xto: center.lng + pad,
    yto: center.lat + pad,
  };
}

async function fetchOne(
  center: Coord,
  from: string,
  to: string,
): Promise<CultureEvent[]> {
  const b = toBbox(center);
  const qs = `xfrom=${b.xfrom}&yfrom=${b.yfrom}&xto=${b.xto}&yto=${b.yto}&from=${from}&to=${to}`;
  const res = await fetch(apiUrl(`/culture/events?${qs}`));
  if (!res.ok) throw new Error(`culture ${res.status}`);
  return res.json();
}

/** 여러 중심 좌표에 대해 병렬 호출 후 id로 dedup. 일부 실패는 무시. */
export async function fetchEventsForCenters(
  centers: Coord[],
  from: string,
  to: string,
): Promise<CultureEvent[]> {
  const settled = await Promise.allSettled(
    centers.map((c) => fetchOne(c, from, to)),
  );
  const byId = new Map<string, CultureEvent>();
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const e of r.value) if (!byId.has(e.id)) byId.set(e.id, e);
  }
  return [...byId.values()];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- culture-api`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/culture.ts __tests__/culture-api.test.ts
git commit -m "feat: culture api 클라이언트(bbox/fan-out/dedup)"
```

---

## Phase C — 프론트 UI (ieum)

### Task 7: 칩 필터 데이터 + 필터 순수 함수

**Files:**
- Create: `src/widgets/recommend-map/lib/filter.ts`
- Create: `src/widgets/recommend-map/ui/CategoryChips.tsx`
- Test: `__tests__/recommend-filter.test.ts`

**Interfaces:**
- Consumes: `CultureEvent` (Task 6).
- Produces:
  - `CHIPS: { label: string; kind: string }[]` (kind ''=전체)
  - `filterByKind(events: CultureEvent[], kind: string): CultureEvent[]`
  - `<CategoryChips active onChange />` (UI)

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/recommend-filter.test.ts
import { filterByKind } from '@/widgets/recommend-map/lib/filter';

const ev = (kind: string) => ({
  id: kind, kind, title: '', genre: '', place: '', area: '',
  sigungu: '', startDate: '', endDate: '', thumbnail: null, lat: 0, lng: 0,
});

it('returns all when kind is empty', () => {
  const list = [ev('공연'), ev('전시')];
  expect(filterByKind(list, '')).toHaveLength(2);
});
it('filters by kind', () => {
  const list = [ev('공연'), ev('전시')];
  expect(filterByKind(list, '전시').map((e) => e.kind)).toEqual(['전시']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- recommend-filter`
Expected: FAIL — module not found.

- [ ] **Step 3: Write filter lib**

```ts
// src/widgets/recommend-map/lib/filter.ts
import type { CultureEvent } from "@/shared/api/culture";

export const CHIPS: { label: string; kind: string }[] = [
  { label: "전체", kind: "" },
  { label: "공연", kind: "공연" },
  { label: "전시", kind: "전시" },
];

export function filterByKind(events: CultureEvent[], kind: string): CultureEvent[] {
  if (!kind) return events;
  return events.filter((e) => e.kind === kind);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- recommend-filter`
Expected: PASS.

- [ ] **Step 5: Write CategoryChips UI**

```tsx
// src/widgets/recommend-map/ui/CategoryChips.tsx
"use client";
import { CHIPS } from "@/widgets/recommend-map/lib/filter";

interface Props {
  active: string;
  onChange: (kind: string) => void;
}

export default function CategoryChips({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
      {CHIPS.map((c) => {
        const on = active === c.kind;
        return (
          <button
            key={c.kind || "all"}
            onClick={() => onChange(c.kind)}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: on ? "#ee7f12" : "rgba(0,0,0,0.05)",
              color: on ? "white" : "#4b5563",
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/widgets/recommend-map/lib/filter.ts src/widgets/recommend-map/ui/CategoryChips.tsx __tests__/recommend-filter.test.ts
git commit -m "feat: 추천 칩 필터(공연/전시) + filterByKind"
```

---

### Task 8: PlaceBottomSheet — 상세 바텀시트

**Files:**
- Create: `src/widgets/recommend-map/ui/PlaceBottomSheet.tsx`

**Interfaces:**
- Consumes: `CultureEvent` (Task 6).
- Produces: `<PlaceBottomSheet event={CultureEvent | null} onClose={() => void} />` (event=null이면 닫힘).

- [ ] **Step 1: Write the component**

```tsx
// src/widgets/recommend-map/ui/PlaceBottomSheet.tsx
"use client";
import type { CultureEvent } from "@/shared/api/culture";

function fmtPeriod(s: string, e: string) {
  const d = (v: string) =>
    v && v.length === 8 ? `${v.slice(0, 4)}.${v.slice(4, 6)}.${v.slice(6, 8)}` : v;
  if (s && e && s !== e) return `${d(s)} ~ ${d(e)}`;
  return d(s || e);
}

interface Props {
  event: CultureEvent | null;
  onClose: () => void;
}

export default function PlaceBottomSheet({ event, onClose }: Props) {
  const open = !!event;
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-[61] rounded-t-2xl bg-white transition-transform duration-300"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="mx-auto my-3 h-1 w-10 rounded-full bg-gray-300" />
        {event && (
          <div className="px-5 pb-8">
            {event.thumbnail && (
              <div className="mb-4 w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "16/9" }}>
                <img src={event.thumbnail} alt={event.title} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="text-xs font-semibold text-[#ee7f12]">
              {event.kind}{event.genre ? ` · ${event.genre}` : ""}
            </span>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{event.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{event.place}</p>
            <p className="text-sm text-gray-400">{event.area} {event.sigungu}</p>
            <p className="mt-1 text-sm text-gray-400">{fmtPeriod(event.startDate, event.endDate)}</p>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Build to verify**

Run: `pnpm build`
Expected: 컴파일 성공.

- [ ] **Step 3: Commit**

```bash
git add src/widgets/recommend-map/ui/PlaceBottomSheet.tsx
git commit -m "feat: PlaceBottomSheet(추천 장소 상세 바텀시트)"
```

---

### Task 9: KakaoMap — SDK 로더 + 마커

**Files:**
- Create: `src/widgets/recommend-map/ui/KakaoMap.tsx`
- Create: `src/widgets/recommend-map/lib/loadKakao.ts`

**Interfaces:**
- Consumes: `CultureEvent` (Task 6), `Coord` (Task 5), `NEXT_PUBLIC_KAKAO_MAP_KEY`.
- Produces:
  - `loadKakao(): Promise<any>` (window.kakao 보장, 중복 로드 방지; 키 없으면 reject)
  - `<KakaoMap sources={Coord[]} events={CultureEvent[]} onSelect={(e: CultureEvent) => void} />`

- [ ] **Step 1: Write the SDK loader**

```ts
// src/widgets/recommend-map/lib/loadKakao.ts
let promise: Promise<unknown> | null = null;

export function loadKakao(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as { kakao?: { maps?: unknown } };
  if (w.kakao?.maps) return Promise.resolve(w.kakao);
  if (promise) return promise;

  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) return Promise.reject(new Error("NEXT_PUBLIC_KAKAO_MAP_KEY missing"));

  promise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    s.onerror = () => reject(new Error("kakao sdk load failed"));
    s.onload = () => {
      const kakao = (window as unknown as { kakao: { maps: { load: (cb: () => void) => void } } }).kakao;
      kakao.maps.load(() => resolve(kakao));
    };
    document.head.appendChild(s);
  });
  return promise;
}
```

- [ ] **Step 2: Write KakaoMap component**

```tsx
// src/widgets/recommend-map/ui/KakaoMap.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { CultureEvent } from "@/shared/api/culture";
import type { Coord } from "@/shared/lib/heritage-geo";
import { loadKakao } from "@/widgets/recommend-map/lib/loadKakao";

interface Props {
  sources: Coord[];
  events: CultureEvent[];
  onSelect: (e: CultureEvent) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function KakaoMap({ sources, events, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [error, setError] = useState(false);

  // 지도 초기화
  useEffect(() => {
    let cancelled = false;
    loadKakao()
      .then((k: any) => {
        if (cancelled || !ref.current) return;
        const center = sources[0] ?? { lat: 37.5666, lng: 126.9784 };
        mapRef.current = new k.maps.Map(ref.current, {
          center: new k.maps.LatLng(center.lat, center.lng),
          level: 8,
        });
      })
      .catch(() => setError(true));
    return () => { cancelled = true; };
  }, [sources]);

  // 마커 갱신
  useEffect(() => {
    const w = window as any;
    const k = w.kakao;
    const map = mapRef.current;
    if (!k?.maps || !map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    const bounds = new k.maps.LatLngBounds();

    sources.forEach((s) => {
      const pos = new k.maps.LatLng(s.lat, s.lng);
      const m = new k.maps.Marker({
        position: pos, map,
        image: new k.maps.MarkerImage(
          "data:image/svg+xml;base64," + btoa(
            '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="10" fill="%23ee7f12"/></svg>'.replace("%23", "#"),
          ),
          new k.maps.Size(28, 28),
        ),
      });
      markersRef.current.push(m);
      bounds.extend(pos);
    });

    events.forEach((e) => {
      if (!Number.isFinite(e.lat) || !Number.isFinite(e.lng)) return;
      const pos = new k.maps.LatLng(e.lat, e.lng);
      const m = new k.maps.Marker({ position: pos, map });
      k.maps.event.addListener(m, "click", () => onSelect(e));
      markersRef.current.push(m);
      bounds.extend(pos);
    });

    if (!bounds.isEmpty()) map.setBounds(bounds);
  }, [sources, events, onSelect]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-400">
        지도를 불러오지 못했습니다.
      </div>
    );
  }
  return <div ref={ref} className="h-full w-full" />;
}
```

- [ ] **Step 3: Build to verify**

Run: `pnpm build`
Expected: 컴파일 성공.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/recommend-map/ui/KakaoMap.tsx src/widgets/recommend-map/lib/loadKakao.ts
git commit -m "feat: KakaoMap 위젯 + SDK 로더(마커/fitBounds)"
```

---

### Task 10: RecommendPage + 라우트 + 빈 상태

**Files:**
- Create: `src/views/recommend/ui/RecommendPage.tsx`
- Create: `src/app/recommend/page.tsx`

**Interfaces:**
- Consumes: `useLikes` (`@/shared/lib/likes-store`), `resolveHeritageCoord` (Task 5), `fetchEventsForCenters` (Task 6), `filterByKind` (Task 7), `KakaoMap` (Task 9), `PlaceBottomSheet` (Task 8), `CategoryChips` (Task 7).
- Produces: `/recommend` 라우트.

- [ ] **Step 1: Write RecommendPage**

```tsx
// src/views/recommend/ui/RecommendPage.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLikes } from "@/shared/lib/likes-store";
import { resolveHeritageCoord, type Coord } from "@/shared/lib/heritage-geo";
import { fetchEventsForCenters, type CultureEvent } from "@/shared/api/culture";
import { filterByKind } from "@/widgets/recommend-map/lib/filter";
import KakaoMap from "@/widgets/recommend-map/ui/KakaoMap";
import CategoryChips from "@/widgets/recommend-map/ui/CategoryChips";
import PlaceBottomSheet from "@/widgets/recommend-map/ui/PlaceBottomSheet";

function yyyymmdd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export default function RecommendPage() {
  const router = useRouter();
  const { likedList } = useLikes();
  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState("");
  const [selected, setSelected] = useState<CultureEvent | null>(null);

  const sources = useMemo<Coord[]>(() => {
    const seen = new Set<string>();
    const out: Coord[] = [];
    for (const l of likedList) {
      if (!l.heritageId || seen.has(l.heritageId)) continue;
      const c = resolveHeritageCoord(l.heritageId);
      if (c) { seen.add(l.heritageId); out.push(c); }
    }
    return out;
  }, [likedList]);

  useEffect(() => {
    if (sources.length === 0) { setLoading(false); setEvents([]); return; }
    setLoading(true);
    const now = new Date();
    const later = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    fetchEventsForCenters(sources, yyyymmdd(now), yyyymmdd(later))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [sources]);

  const shown = useMemo(() => filterByKind(events, chip), [events, chip]);

  if (!loading && sources.length === 0) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-white px-8 text-center">
        <p className="text-gray-500">쇼츠에서 마음에 드는 문화재에 좋아요를 눌러보세요.</p>
        <button onClick={() => router.push("/explore")} className="rounded-full bg-[#ee7f12] px-5 py-2 text-sm font-medium text-white">
          쇼츠 보러가기
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-dvh bg-white pb-16">
      <div className="absolute left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-md">
        <h1 className="px-4 pt-10 text-xl font-bold text-gray-900">주변 문화 추천</h1>
        <CategoryChips active={chip} onChange={setChip} />
      </div>
      <div className="h-full pt-[120px]">
        <KakaoMap sources={sources} events={shown} onSelect={setSelected} />
      </div>
      {loading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
          불러오는 중…
        </div>
      )}
      <PlaceBottomSheet event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
```

- [ ] **Step 2: Write the route**

```tsx
// src/app/recommend/page.tsx
import RecommendPage from "@/views/recommend/ui/RecommendPage";
export default RecommendPage;
```

- [ ] **Step 3: Build + run**

Run: `pnpm build`
Expected: 컴파일 성공.

- [ ] **Step 4: Commit**

```bash
git add src/views/recommend/ui/RecommendPage.tsx src/app/recommend/page.tsx
git commit -m "feat: /recommend 추천 지도 페이지(좋아요→좌표→문화행사)"
```

---

### Task 11: 좋아요 페이지에 진입 CTA

**Files:**
- Modify: `src/app/likes/page.tsx` (헤더 영역에 "주변 추천 지도" 버튼 추가)

**Interfaces:**
- Consumes: Next `useRouter`, `/recommend` 라우트(Task 10).

- [ ] **Step 1: Add CTA button**

`src/app/likes/page.tsx` 상단 헤더(제목 근처)에 버튼 추가. 파일이 client component인지 확인 후(`"use client"`), `useRouter` import. 예:
```tsx
<button
  onClick={() => router.push("/recommend")}
  className="mt-3 rounded-full bg-[#ee7f12] px-4 py-2 text-sm font-medium text-white"
>
  주변 추천 지도 보기
</button>
```
(이미 `useRouter`가 있으면 재사용. 없으면 `import { useRouter } from "next/navigation";` 추가하고 컴포넌트 내 `const router = useRouter();`.)

- [ ] **Step 2: Build to verify**

Run: `pnpm build`
Expected: 컴파일 성공.

- [ ] **Step 3: Commit**

```bash
git add src/app/likes/page.tsx
git commit -m "feat: 좋아요 페이지에 추천 지도 진입 CTA"
```

---

### Task 12: 여행지 탭(/destinations) 문화 데이터로 전환

**Files:**
- Modify: `src/app/destinations/page.tsx` (TourAPI `/destinations` 호출 제거 → 현재 위치 기준 문화행사)

**Interfaces:**
- Consumes: `fetchEventsForCenters` (Task 6), `PlaceBottomSheet`/`CategoryChips`/`KakaoMap` (선택), geolocation.

- [ ] **Step 1: Replace data source**

`src/app/destinations/page.tsx`를 현재 위치 1개를 center로 하는 문화행사 화면으로 교체. 최소 변경안: 위치 획득 후 `fetchEventsForCenters([{lat,lng}], from, to)`로 목록 렌더(기존 카드 UI 재사용, `dest.title→event.title`, `dest.address→event.place`, `dest.image→event.thumbnail`, 거리 표기 제거). 또는 `RecommendPage`의 지도/리스트 컴포넌트를 center=현재위치로 재사용.

기존 `apiUrl('/destinations...')` 및 `Destination` 타입/`FILTERS`(TourAPI contentTypeId) 제거. 칩이 필요하면 Task 7의 `CHIPS` 사용.

- [ ] **Step 2: Build + test**

Run: `pnpm build && pnpm test`
Expected: 컴파일 성공, 전체 테스트 통과.

- [ ] **Step 3: Manual verify**

Run: `pnpm dev` → `/destinations` 진입 → 위치 허용 → 주변 공연/전시 표시 확인(또는 빈 상태). `/recommend` 진입 → 좋아요한 문화재 주변 마커·바텀시트 확인.

- [ ] **Step 4: Commit**

```bash
git add src/app/destinations/page.tsx
git commit -m "refactor: 여행지 탭을 문화행사(문화정보원) 기반으로 전환"
```

---

## Self-Review 결과

- **스펙 커버리지:** 데이터소스(Task1-2,6), TourAPI 제거/키 단일화(Task3), 좌표해결(Task4-5), bbox/fan-out(Task6), 칩(Task7), 바텀시트(Task8), 지도(Task9), 오케스트레이션/라우트/빈상태(Task10), CTA(Task11), 여행지 전환(Task12). ✅
- **플레이스홀더:** Task12는 기존 UI 재사용이라 구체 코드 대신 매핑 지침 — 실행 시 기존 `destinations/page.tsx` 구조에 맞춰 적용(파일이 케이스별로 달라 의도적 유연).
- **타입 일관성:** `CultureEvent`/`Coord`/`toBbox`/`fetchEventsForCenters`/`filterByKind`/`resolveHeritageCoord` 시그니처가 Task 간 일치. ✅
- **미해결:** 상설 문화시설 엔드포인트(스펙 3.2)는 MVP 범위 밖 — 확보 시 Task 추가.
