# 댓글(Comments) DB 연동 설계

- 날짜: 2026-06-22
- 범위: **조회 + 작성만** (삭제·대댓글·좋아요 없음)
- 대상 리포: `ieum-api`(백엔드, NestJS + MikroORM), `ieum`(프론트, Next.js)

## 1. 목표 / 배경

현재 `CommentDrawer.tsx`는 하드코딩된 더미 댓글 2개를 보여주고, 작성 시 로컬 state에만 추가한다(새로고침 시 소멸). 영상 식별자도 넘어오지 않아 영상별 댓글 구분이 불가능하다. 이를 실제 DB 연동으로 교체한다.

기존 `likes` 모듈과 동일한 구조(접근법 A)를 그대로 미러링해 일관성과 격리를 확보한다.

## 2. 요구사항 확정

| 항목 | 결정 |
|------|------|
| 스코프 | 조회 + 작성만 |
| 인증 | 조회는 공개, 작성은 로그인(`JwtAuthGuard` / 프론트 `requireAuth`) |
| 작성자 표시 | 닉네임(`nickname`, 없으면 `name`) + 프로필 사진(`picture`) |
| 정렬 | 최신순(`createdAt DESC`) |
| 페이지네이션 | 없음 — MVP는 전체 로드. 폭증 시 추후 커서 페이징 |
| 본문 제한 | 비어있지 않음, 최대 500자 |

## 3. 백엔드 설계 (`ieum-api`)

신규 모듈 `src/comments/`:

```
comments/
  comment.entity.ts
  comments.module.ts
  comments.service.ts
  comments.controller.ts
  dto/create-comment.dto.ts
  comments.service.spec.ts
```

### 엔티티 (`comment.entity.ts`)

```ts
import type { InferEntity } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity';

export const Comment = defineEntity({
  name: 'Comment',
  tableName: 'comments',
  properties: {
    id: p.integer().primary(),
    shortsId: p.integer(),
    user: () => p.manyToOne(User),
    content: p.text(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
  indexes: [{ properties: ['shortsId', 'createdAt'] }],
});

export type IComment = InferEntity<typeof Comment>;
```

- `shortsId`는 `likes`와 동일하게 영상 식별 정수값(프론트 `ShortsPlace.id`).
- `(shortsId, createdAt)` 인덱스로 영상별 최신순 조회 최적화.

### DTO (`create-comment.dto.ts`)

```ts
export class CreateCommentDto {
  @IsInt()
  shortsId: number;

  @IsNotEmpty()
  @MaxLength(500)
  content: string;
}
```

### 컨트롤러 (`comments.controller.ts`)

```
@Controller('comments')

@Get()                                  // 공개 (가드 없음)
list(@Query('shortsId', ParseIntPipe) shortsId: number)

@Post()
@UseGuards(JwtAuthGuard)                // 메서드 레벨 가드
create(@Req() req, @Body() dto: CreateCommentDto)
```

> `likes`는 컨트롤러 레벨에 가드를 두지만, 댓글은 GET을 공개해야 하므로 POST에만 메서드 레벨로 적용한다.

### 서비스 (`comments.service.ts`)

- `list(shortsId)`: `em.find(Comment, { shortsId }, { orderBy: { createdAt: 'DESC' }, populate: ['user'] })` → DTO 매핑.
- `create(userId, dto)`: `em.create` 후 `em.flush`, 작성자 populate한 DTO 반환.
- `toDto(c)`:

```ts
{
  id, shortsId, content, createdAt,
  author: {
    id: c.user.id,
    nickname: c.user.nickname,
    name: c.user.name,
    picture: c.user.picture,
  },
}
```

### 마이그레이션

`comments` 테이블 + `(shortsId, createdAt)` 인덱스 생성 마이그레이션 추가(기존 MikroORM 마이그레이션 흐름 따름).

## 4. 프론트엔드 설계 (`ieum`)

### API 클라이언트 (`src/shared/api/comments.ts` 신규)

기존 `explore.ts`의 `API_BASE`/fetch 패턴 재사용.

```ts
export interface CommentAuthor { id: number; nickname: string | null; name: string; picture: string | null; }
export interface CommentItem { id: number; shortsId: number; content: string; createdAt: string; author: CommentAuthor; }

getComments(shortsId: number): Promise<CommentItem[]>          // GET /comments?shortsId=
createComment(shortsId: number, content: string): Promise<CommentItem>  // POST /comments (Authorization 헤더)
```

### `Shorts.tsx`

`<CommentDrawer shortsId={item.id} open={commentOpen} onClose={...} videoTitle={item.title} />`로 `shortsId` 추가 전달.

### `CommentDrawer.tsx`

- 더미 `useState` 제거.
- `open === true`일 때 SWR로 `getComments(shortsId)` 조회 (키: `['comments', shortsId]`).
- `handleSubmit`:
  1. `requireAuth`로 감싸 비로그인 시 모달.
  2. 낙관적으로 입력 댓글을 목록 맨 앞에 추가 + 입력창 비움.
  3. `createComment` 호출 → 성공 시 `mutate`로 서버 데이터 재검증, 실패 시 낙관적 추가분 롤백 + 안내.
- 작성자 아바타: `author.picture` 있으면 `<img>`, 없으면 기존 회색 원 + 이니셜(닉네임/이름 첫 글자). 표시 이름은 `nickname ?? name`.
- 헤더 "댓글 N개"는 조회된 목록 길이로 연동.

## 5. 에러 처리

- 비로그인 작성: 네트워크 요청 전 `requireAuth` 모달로 차단.
- POST 실패: 낙관적 추가분 롤백, 사용자 안내(토스트/인라인).
- 빈 입력: 게시 버튼 `disabled` 유지(기존 로직).
- GET 실패: 빈 목록 대신 재시도 가능한 에러 상태 노출.

## 6. 테스트

- 백엔드 `comments.service.spec.ts`: 작성, 영상별 최신순 조회, 작성자 매핑(`nickname`/`name`/`picture`).
- e2e(기존 패턴 존재 시): `GET /comments` 공개 접근, `POST /comments` 미인증 401, 인증 후 201.
- 프론트: `CommentDrawer` 조회/작성 흐름(기존 `__tests__` 패턴), 낙관적 업데이트·롤백.

## 7. 비범위 (YAGNI)

- 댓글 삭제/수정, 대댓글, 댓글 좋아요, 신고, 멘션, 페이지네이션, 실시간 갱신. 추후 별도 스펙.
