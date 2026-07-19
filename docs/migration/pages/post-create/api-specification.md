# 게시글 작성 API 명세

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 게시글 | `POST` | `/posts` | 게시글 작성 |
| 회원 | `GET` | `/users/me` | Header 현재 사용자 |
| 인증 | `POST` | `/auth/reissue` | Access Token 복구 |
| 인증 | `POST` | `/auth/logout` | Header 로그아웃 |

게시글 작성 요청은 JSON, `credentials: "include"`, Bearer Access Token, 401 재발급·1회 재시도 정책을 사용한다. 로그아웃은 Authorization과 자동 재시도를 사용하지 않는다.

## POST `/posts`

### Request headers

```http
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### Request body

```json
{
  "title": "오늘 배운 React",
  "content": "컴포넌트의 책임을 나누었다.",
  "imageUrls": ["react.png", "component.jpg"]
}
```

| 필드 | 타입 | 필수 | 프론트엔드 조건 | 용도 |
|---|---|---:|---|---|
| `title` | string | O | trim 후 1~26자 | 게시글 제목 |
| `content` | string | O | trim 후 빈 값 금지 | 게시글 내용 |
| `imageUrls` | string[] | O | 선택 파일의 `name`, 미선택 시 `[]` | 현재 임시 이미지 참조 |

`imageUrls`라는 이름과 달리 현재 프론트엔드는 실제 URL이나 파일 데이터를 업로드하지 않고 파일명만 전송한다. 서버의 정식 이미지 업로드 계약을 확인하기 전까지 이 필드의 의미를 확대 해석하지 않는다.

### 프론트엔드 사용 성공 응답

```json
{
  "data": {
    "postId": 1
  }
}
```

| 필드 | 용도 |
|---|---|
| `data.postId` | 존재하면 `/posts/{postId}`로 이동 |

성공 응답에 `postId`가 없거나 truthy가 아니면 `/posts`로 이동한다. 정확한 성공 status와 `postId` 타입은 실제 백엔드로 확인해야 한다.

## Header API

- `GET /users/me`: 공통 `AuthContext`가 현재 사용자와 프로필 정보를 보관한다.
- `POST /auth/reissue`: HttpOnly Refresh Token 쿠키로 Access Token을 메모리에 복구한다.
- `POST /auth/logout`: 로그아웃 후 인증 상태를 초기화하고 `/login`으로 이동한다.

## 실제 백엔드 확인 항목

- [ ] 게시글 작성 성공 status 확인
- [ ] 성공 응답의 `data.postId` 타입과 필수 여부 확인
- [ ] `title` 최대 길이가 서버에서도 26자인지 확인
- [ ] `content` 최대 길이와 허용 문자 확인
- [ ] `imageUrls`가 실제로 파일명 배열을 받는 임시 계약인지 확인
- [ ] 이미지 업로드 endpoint 또는 multipart 계약 존재 여부 확인
- [ ] 이미지 개수·파일 크기·형식 제한 확인
- [ ] 인증·rate limit 오류의 정확한 status/message 확인
- [ ] 401 이후 재발급 성공 시 POST 요청을 안전하게 한 번 재시도할 수 있는지 확인

