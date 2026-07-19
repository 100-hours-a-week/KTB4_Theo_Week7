# 게시글 목록 API 명세

이 문서는 게시글 목록 화면 진입부터 Header 사용까지 실제로 호출되는 API 계약을 기록한다.

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 게시글 | `GET` | `/posts?size={size}` | 게시글 목록 최초 조회 |
| 게시글 | `GET` | `/posts?lastPostId={lastPostId}&size={size}` | 게시글 목록 추가 조회 |
| 회원 | `GET` | `/users/me` | Header 프로필 이미지 |
| 인증 | `POST` | `/auth/reissue` | 보호 API 호출 전·401 후 토큰 복구 |
| 인증 | `POST` | `/auth/logout` | Header 프로필 메뉴 로그아웃 |

## GET `/posts`

### 요청 정책

| 항목 | 값 |
|---|---|
| Base URL | React 환경변수 `VITE_API_BASE_URL` |
| Method | `GET` |
| Content-Type | `application/json` |
| 쿠키 | `credentials: "include"` |
| Authorization | `Bearer {accessToken}` |
| 401 자동 재발급·재시도 | 사용 |

### Query parameters

| 필드 | 타입 | 필수 | 프론트엔드 처리 |
|---|---|---:|---|
| `size` | number | 예 | 항상 `10` 전달 |
| `lastPostId` | number | 최초 요청 아니오 | 추가 조회 시 이전 응답 값을 전달 |

최초 요청:

```http
GET /posts?size=10
```

추가 요청:

```http
GET /posts?lastPostId=123&size=10
```

### 사용 응답 형태

```json
{
  "data": {
    "posts": [
      {
        "postId": 123,
        "title": "게시글 제목",
        "edited": false,
        "blinded": false,
        "likeCount": 10,
        "commentCount": 3,
        "viewCount": 100,
        "createdAt": "2026-07-19T12:34:56.000",
        "profileImage": "profile.png",
        "nickname": "작성자",
        "authorDeleted": false
      }
    ],
    "hasNext": true,
    "lastPostId": 123
  }
}
```

| 필드 | 용도 |
|---|---|
| `data.posts` | 이번 응답의 게시글 배열 |
| `data.hasNext` | 추가 요청 가능 여부 |
| `data.lastPostId` | 다음 요청의 커서 |
| `postId` | 카드 식별과 상세 이동 |
| `title` | 카드 제목 |
| `edited` | `수정됨` 표시 |
| `blinded` | 목록 렌더링 제외 |
| `likeCount` | 좋아요 수 |
| `commentCount` | 댓글 수 |
| `viewCount` | 조회수 |
| `createdAt` | 카드 날짜 |
| `profileImage` | 작성자 프로필 이미지 |
| `nickname` | 작성자 닉네임 |
| `authorDeleted` | `알 수 없음` 처리 |

프론트엔드는 응답 스키마를 임의로 페이지 번호 방식으로 바꾸지 않는다.

## GET `/users/me`

Header는 응답의 `data.profileImage`만 사용한다. 값이 없거나 이미지 로드에 실패하면 기본 프로필 이미지를 사용한다. 인증 헤더, 쿠키, 401 재발급 정책은 목록 조회와 같다.

## POST `/auth/reissue`

- Authorization 헤더 없이 Refresh Token 쿠키를 전송한다.
- 성공 응답 `data.accessToken`을 API client와 React 인증 상태에 반영해야 한다.
- 동시에 여러 보호 API가 토큰을 요구해도 재발급 요청은 하나만 실행한다.
- 실패하면 Access Token을 제거하고 미인증 상태로 처리한다.

## POST `/auth/logout`

- Authorization 헤더를 보내지 않는다.
- 401 자동 재발급과 원 요청 재시도를 사용하지 않는다.
- Refresh Token 쿠키 처리를 위해 `credentials: "include"`는 유지한다.
- 성공 응답 body는 사용하지 않는다.

## 실제 백엔드 확인 항목

- [ ] 게시글 목록 성공 응답의 정확한 status와 전체 필드 타입 확인
- [ ] 빈 목록에서 `lastPostId` 값이 `null`인지 확인
- [ ] `hasNext === true`인데 `posts`가 빈 배열인 응답이 가능한지 확인
- [ ] `blinded` 게시글이 목록 응답에 포함되는 정책 확인
- [ ] 게시글 삭제 사이의 커서 중복·누락 가능성 확인
- [ ] `GET /users/me`의 프로필 이미지 필드 확인
- [ ] 재발급 실패 message와 로그인 이동 정책 확인

