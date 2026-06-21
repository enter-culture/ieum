# 좋아요 기반 주변 추천 지도 — 설계

작성일: 2026-06-22 (갱신: 데이터 소스 확정)
대상 리포: `ieum`(프론트), `ieum-api`(백엔드)

## 1. 목표

사용자가 쇼츠에서 **좋아요한 무형문화재**를 기준으로, 그 문화재가 위치한 **지역 주변의 문화 공공데이터**(공연·전시·문화시설)를 Kakao 지도 위에 추천한다. 마커를 탭하면 화면 아래에서 **바텀시트**가 올라와 상세를 보여준다.

## 2. 결정 사항 (확정)

| 항목 | 결정 |
|---|---|
| 추천 기준 | 좋아요한 문화재의 **지역 중심** |
| 지도 SDK | **Kakao Map** (JS 키 발급 완료, `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_KEY`) |
| 데이터 소스 | **한국문화정보원**(data.go.kr) — 공연/전시 + 문화시설. TourAPI 사용 안 함 |
| 추천 범위 | 전체 표시 + 상단 **칩 필터** |
| 진입점 | 새 라우트 `/recommend`, 좋아요 페이지에서 CTA |
| 여행지 탭 | 기존 `/destinations`(TourAPI)를 **문화시설·공연 중심으로 전환** |
| TourAPI | **제거** (`TOUR_API_KEY`, destinations TourAPI 서비스 삭제) |
| API 키 | data.go.kr **단일 인증키** 사용 (cha·문화정보원 공용). 백엔드 `.env`에 `DATA_GO_KR_API_KEY`로 통합 |

## 3. 데이터 소스 — 한국문화정보원 (검증 완료)

### 3.1 공연/전시 (한눈에보는문화정보, data.go.kr 15138937)
- 엔드포인트: `https://apis.data.go.kr/B553457/cultureinfo/period2`
- 핵심 파라미터: `serviceKey`, `from`/`to`(YYYYMMDD), `cPage`, `rows`, **bbox** `gpsxfrom/gpsyfrom/gpsxto/gpsyto`, `keyword`, `sortStdr`
- 응답(검증됨, XML): `title`, `startDate`/`endDate`, `place`, `realmName`(장르), `area`, `sigungu`, **`gpsX`/`gpsY`**, **`thumbnail`**
- bbox로 "지역 주변" 검색 가능 → 문화재 좌표 주변 박스를 만들어 호출.

### 3.2 문화시설 (상설: 박물관·미술관·공연장, data.go.kr 15138930)
- 정확한 operation 경로는 구현 시 data.go.kr Swagger에서 확정(좌표·주소·대표이미지 제공 확인됨).
- MVP에서는 3.1(공연/전시)이 핵심. 문화시설은 확보되면 같은 지도에 레이어 추가.

### 3.3 키 사용
- data.go.kr 디코딩 키를 **UTF-8 URL 인코딩 1회** 후 `serviceKey`로 전송.
- 호출은 **백엔드(ieum-api) 프록시**를 통해서만(키 노출 방지, CORS 회피). 프론트는 `/api/recommend...` 형태로만 호출.

## 4. 좌표 해결 (핵심)

좋아요엔 위경도가 없고 `heritageId`·지역 텍스트만 있다.
1. `heritageList`(시드 5개)에 **대표 좌표(curated lat/lng)** 추가:
   - 택견 → 충주 `36.9910, 127.9259`
   - 하회별신굿탈놀이 → 안동 하회마을 `36.5390, 128.5180`
   - 남사당놀이 → 안성 `37.0078, 127.2797`
   - 강강술래 → 진도 `34.4867, 126.2630`
   - 판소리 → 전주 `35.8147, 127.1480`
2. `heritageId`로 못 찾으면 **Kakao 주소→좌표 지오코딩** 폴백. 그래도 실패하면 스킵.
3. 순수 함수 `resolveHeritageCoord(heritageId, address)` 로 분리해 단위 테스트.

## 5. 데이터 흐름

```
좋아요 목록 → heritageId 있는 항목만, 중복 heritageId 제거
  → 각 문화재 대표 좌표 해결 (4절)
  → 좌표별 bbox 생성(±약 0.05도) → 백엔드 프록시로 공연/전시(period2) 병렬 호출
  → 결과 합치고 seq(id)로 중복 제거
지도 렌더(Kakao):
  - 문화재 마커(주황, "추천 출처") + 문화행사/시설 마커(종류별)
  - 전체 마커 fitBounds
칩 필터: 마커 클라이언트 필터링(재호출 없음)
마커 탭 → 바텀시트(제목·장르·장소·기간·썸네일, 문화재면 "이 지역 기준")
```

- 병렬 호출은 `Promise.allSettled` — 일부 실패해도 나머지 표시.
- 호출 수 = 고유 좋아요 문화재 수(보통 한 자릿수). 백엔드 배치 엔드포인트는 안 만든다.

## 6. 백엔드 변경 (ieum-api)

- `DestinationsModule`(TourAPI/`KorService1`/`TOUR_API_KEY`) **제거**.
- 신규 `CultureModule`: 한국문화정보원 프록시.
  - `GET /api/culture/events?gpsxfrom&gpsyfrom&gpsxto&gpsyto&from&to` → period2 정규화 JSON 반환.
  - (확보 시) `GET /api/culture/facilities?...`.
- `HERITAGE_API_KEY` + 신규 키를 **`DATA_GO_KR_API_KEY` 단일 변수로 통합**(기존 cha 폴백 키와 동일). `render.yaml`/`.env.example` 정리, `TOUR_API_KEY` 삭제.

## 7. 프론트 변경 (ieum)

- 신규 `views/recommend/ui/RecommendPage` (오케스트레이션).
- `widgets/recommend-map/ui/KakaoMap` (SDK 동적 로드·마커·fitBounds·클릭 콜백).
- `widgets/recommend-map/ui/PlaceBottomSheet` (기존 `CommentDrawer` 패턴 재사용).
- `widgets/recommend-map/ui/CategoryChips`.
- `shared/lib/heritage-geo.ts` (`resolveHeritageCoord`, 순수).
- `shared/api/culture.ts` (`fetchEventsForCenters(centers)` fan-out+dedup, 순수 로직).
- `app/destinations/page.tsx`(여행지 탭): 데이터 소스를 문화행사/시설로 전환(또는 `/recommend` 컴포넌트 재사용). 좌표 기준 = 현재 위치.
- 좋아요 페이지에 "주변 추천 지도" CTA.

## 8. 빈/에러 상태

- heritageId 있는 좋아요 0개 → 빈 상태: "쇼츠에서 마음에 드는 문화재에 좋아요를 눌러보세요" + 쇼츠 버튼.
- 모든 좌표 해결 실패 → 동일 빈 상태.
- 일부 호출 실패 → 성공분만 표시(부분 성공).
- Kakao 키 미설정/SDK 로드 실패 → "지도를 불러오지 못했습니다" 안내.

## 9. 테스트

지도 DOM 렌더는 단위 테스트 제외. 순수 로직만 Jest:
- `resolveHeritageCoord`: id 매칭 / 폴백 / 실패 null.
- `fetchEventsForCenters`: 병합 + `seq` dedup, allSettled 부분 실패 허용.
- bbox 생성 함수, 칩 필터 함수, 거리/기간 포맷.

## 10. 범위 밖 (YAGNI)

- 백엔드 다중 좌표 배치 엔드포인트.
- 길찾기/경로, 추천 랭킹 고도화.
- 네비게이션 탭 구조 변경(여행지 탭은 유지, 내용만 전환).
