# 게시글 상세 API 명세

이 문서는 상세 화면과 같은 화면에서 수행하는 변경 기능 및 공통 Header API 계약을 기록한다.

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 게시글 | `GET` | `/posts/{postId}` | 게시글·이미지·댓글 상세 조회 |
| 좋아요 | `POST` | `/posts/{postId}/likes` | 좋아요 토글 |
| 댓글 | `POST` | `/posts/{postId}/comments` | 댓글 등록 |
| 댓글 | `PATCH` | `/posts/{postId}/comments/{commentId}` | 댓글 수정 |
| 댓글 | `DELETE` | `/posts/{postId}/comments/{commentId}` | 댓글 삭제 |
| 게시글 | `DELETE` | `/posts/{postId}` | 게시글 삭제 |
| 회원 | `GET` | `/users/me` | Header 현재 사용자 |
| 인증 | `POST` | `/auth/reissue` | Access Token 복구 |
| 인증 | `POST` | `/auth/logout` | Header 로그아웃 |

모든 상세 도메인 요청은 JSON, `credentials: "include"`, Bearer Access Token, 401 재발급·1회 재시도 정책을 사용한다. 로그아웃은 Authorization과 자동 재시도를 사용하지 않는다.

## GET `/posts/{postId}`

### Path parameter

| 필드 | 타입 | 조건 |
|---|---|---|
| `postId` | number | 양의 정수 |

### 프론트엔드 사용 응답

```json
{
  "data": {
    "postId": 1,
    "title": "게시글 제목",
    "content": "게시글 본문",
    "profileImage": "profile.png",
    "nickname": "작성자",
    "authorDeleted": false,
    "createdAt": "2026-07-19T12:34:56.000",
    "edited": false,
    "author": true,
    "likeCount": 10,
    "viewCount": 100,
    "commentCount": 2,
    "liked": false,
    "blinded": false,
    "imageUrls": ["image1.png", "image2.png"],
    "comments": []
  }
}
```

| 필드 | 용도 |
|---|---|
| `postId` | 수정·삭제·좋아요·댓글 endpoint 식별자 |
| `title`, `content` | 상세 본문 |
| `profileImage`, `nickname`, `authorDeleted` | 작성자 표시 |
| `createdAt`, `edited` | 작성·수정 정보 |
| `author` | 게시글 수정·삭제 권한 UI |
| `likeCount`, `viewCount`, `commentCount` | 통계 표시 |
| `liked` | 좋아요 UI 상태 |
| `blinded` | 상세 기능 제한 |
| `imageUrls` | 이미지 갤러리 |
| `comments` | 댓글 목록 |

### 댓글 필드

| 필드 | 용도 |
|---|---|
| `commentId` | 수정·삭제 식별자 |
| `profileImage`, `nickname`, `authorDeleted` | 댓글 작성자 표시 |
| `createdAt` | 작성일 |
| `author` | 수정·삭제 버튼 표시 |
| `commentDeleted` | 삭제 댓글 문구와 버튼 제한 |
| `commentContent` | 댓글 내용 |

## POST `/posts/{postId}/likes`

Request body는 없다.

```json
{
  "data": {
    "liked": true,
    "likeCount": 11
  }
}
```

성공 응답의 두 필드만 현재 화면에서 사용한다.

## POST `/posts/{postId}/comments`

```json
{
  "content": "댓글 내용"
}
```

앞뒤 공백을 제거하여 전송한다. 성공 응답 body는 사용하지 않고 상세를 다시 조회한다.

## PATCH `/posts/{postId}/comments/{commentId}`

```json
{
  "content": "수정한 댓글 내용"
}
```

앞뒤 공백을 제거하여 전송한다. 성공 후 상세를 다시 조회한다.

## DELETE endpoint

- `DELETE /posts/{postId}`: body 없음, 성공 후 목록 이동
- `DELETE /posts/{postId}/comments/{commentId}`: body 없음, 성공 후 상세 재조회

두 요청 모두 성공 응답 body를 사용하지 않는다.

## 실제 백엔드 확인 항목

- [ ] 상세 성공 응답 status와 모든 필드 타입 확인
- [ ] 조회수가 상세 조회 시 증가하는지 확인
- [ ] 숨김 게시글의 `author`, 댓글, 이미지 필드 정책 확인
- [ ] `imageUrls`가 파일명인지 경로인지 확인
- [ ] 삭제 댓글의 작성자 정보 노출 정책 확인
- [ ] 좋아요 endpoint가 POST 한 번으로 토글되는 계약 확인
- [ ] 댓글 작성·수정의 최대 길이 서버 검증 message 확인
- [ ] mutation 성공 응답 body 확인

