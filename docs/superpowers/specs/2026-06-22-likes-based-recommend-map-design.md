# 좋아요 기반 주변 추천 지도 — 설계

작성일: 2026-06-22
대상 리포: `ieum`(프론트), 일부 `ieum-api`(백엔드, 기존 재사용)

## 1. 목표

사용자가 쇼츠에서 **좋아요한 무형문화재**를 기준으로, 그 문화재가 위치한 **지역 주변의 공공데이터(한국관광공사 TourAPI) 장소**를 Kakao 지도 위에 추천한다. 마커를 탭하면 화면 아래에서 **바텀시트**가 올라와 장소 상세를 보여준다.

## 2. 결정 사항 (확정)

| 항목 | 결정 |
|---|---|
| 추천 기준 | 좋아요한 문화재의 **지역 중심** (현재 위치 아님) |
| 지도 SDK | **Kakao Map** (JS 앱키는 사용자가 발급·제공) |
| 추천 범위 | **전체 타입** 마커 표시 + 상단 **칩 필터**로 좁히기 |
| 진입점 | 새 라우트 `/recommend`, 좋아요 페이지에서 CTA로 진입 |

## 3. 좌표 해결 (핵심 설계)

좋아요 데이터에는 위경도가 없고 `heritageId`·지역 텍스트만 있다. 따라서:

1. `heritageList`(시드 5개)에 **대표 좌표(curated)** 필드를 추가한다. (대략값, 대표 지점)
   - 택견 → 충주 `36.9910, 127.9259`
   - 하회별신굿탈놀이 → 안동 하회마을 `36.5390, 128.5180`
   - 남사당놀이 → 안성 `37.0078, 127.2797`
   - 강강술래 → 진도 `34.4867, 126.2630`
   - 판소리 → 전주 `35.8147, 127.1480`
2. `heritageId`로 좌표를 못 찾으면(업로드 영상 등) **Kakao 주소→좌표 지오코딩**으로 폴백. 그래도 실패하면 그 항목은 스킵.

순수 함수 `resolveHeritageCoord(heritageId, address)` 로 분리해 단위 테스트한다.

## 4. 데이터 흐름

```
좋아요 목록 → heritageId 있는 항목만 추출 → 중복 heritageId 제거
  → 각 문화재 대표 좌표 해결 (3절)
  → 좌표별로 GET /api/destinations?lat&lng&radius=5000 (전체 타입) 병렬 호출
  → POI 결과 합치고 contentid(id)로 중복 제거
지도 렌더:
  - 문화재 마커 (주황, "추천 출처")  + 추천 POI 마커 (contentTypeId별 색/아이콘)
  - 전체 마커가 보이도록 fitBounds
칩 필터: POI 마커를 클라이언트에서 필터링 (재호출 없음)
마커 탭 → 바텀시트 오픈(상세)
```

- 좌표별 병렬 호출은 `Promise.allSettled`로 — 일부 실패해도 나머지 표시.
- 좋아요가 많아도 호출 수 = 고유 좋아요 문화재 수 (보통 한 자릿수). 백엔드 신규 엔드포인트는 만들지 않는다(YAGNI).

## 5. 컴포넌트 분리

| 단위 | 책임 | 의존 |
|---|---|---|
| `views/recommend/ui/RecommendPage` | 오케스트레이션: 좋아요→좌표→POI, 상태 관리 | likes-store, destinations api, heritage-geo |
| `widgets/recommend-map/ui/KakaoMap` | Kakao SDK 동적 로드, 마커 렌더, fitBounds, 마커 클릭 콜백 | window.kakao |
| `widgets/recommend-map/ui/PlaceBottomSheet` | 선택 장소 상세 바텀시트 (기존 `CommentDrawer` 패턴 재사용) | — |
| `widgets/recommend-map/ui/CategoryChips` | 칩 필터 UI + 선택 상태 | — |
| `shared/lib/heritage-geo.ts` | `resolveHeritageCoord` (순수, 폴백 포함) | heritageList, kakao geocoder |
| `shared/api/destinations.ts` | `fetchNearby(lat,lng,...)`, `fetchNearbyForCenters(centers)`(fan-out+dedup) | apiUrl |

KakaoMap은 "지도를 그린다"는 한 가지 일만 한다(데이터 조립은 RecommendPage 책임). 내부를 바꿔도 소비자가 깨지지 않도록 props 인터페이스(center 목록, POI 목록, onMarkerClick)로만 통신.

## 6. 화면/상호작용

- 전체 화면 지도. 상단에 칩 필터(전체/관광지(12)/문화시설(14)/행사(15)/음식점(39)/숙박(32)) 가로 스크롤.
- 마커 종류 2가지: 문화재(출처) 마커 / POI 마커. 색·라벨로 구분.
- 바텀시트: 사진(있으면), 제목, 카테고리, 주소, (문화재로부터/현재 중심으로부터) 거리. POI면 외부 상세 없음 — 정보 카드만. 문화재 마커면 "이 지역 기준으로 추천 중" 표기.
- 닫기: 시트 바깥 탭/아래로 스와이프.

## 7. 빈/에러 상태

- 좋아요 0개 또는 heritageId 있는 좋아요 0개 → 빈 상태 화면: "쇼츠에서 마음에 드는 문화재에 좋아요를 눌러보세요" + 쇼츠로 가는 버튼.
- 모든 좌표 해결 실패 → 동일 빈 상태.
- 일부 POI 호출 실패 → 성공한 것만 표시(부분 성공).
- `NEXT_PUBLIC_KAKAO_MAP_KEY` 미설정 또는 SDK 로드 실패 → "지도를 불러오지 못했습니다" 안내(키 누락 힌트 포함).

## 8. 전제조건

- `NEXT_PUBLIC_KAKAO_MAP_KEY` (.env, .env.local) — 사용자 제공.
- Kakao 개발자콘솔 플랫폼에 `http://localhost:3000`, `https://ieum-murex.vercel.app` 도메인 등록.
- 지오코딩 폴백을 쓰려면 Kakao SDK `libraries=services` 로드.

## 9. 테스트

지도 DOM 렌더는 단위 테스트 범위에서 제외. 순수 로직만 Jest로 테스트:
- `resolveHeritageCoord`: heritageId 매칭 / 미존재 시 폴백 경로 / 둘 다 실패 시 null.
- `fetchNearbyForCenters`: 여러 좌표 결과 병합 + `id` 기준 dedup, 일부 실패(allSettled) 허용.
- 거리 포맷(`formatDist`), 칩 필터 함수.

## 10. 범위 밖 (YAGNI)

- 백엔드 다중 좌표 배치 엔드포인트(클라이언트 fan-out으로 충분).
- 길찾기/경로, 즐겨찾기 저장, 추천 랭킹 고도화.
- 네비게이션 탭 구조 변경.
