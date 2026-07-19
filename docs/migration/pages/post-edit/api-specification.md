# 게시글 수정 API 명세

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 게시글 | `GET` | `/posts/{postId}` | 수정할 게시글 초기값과 기존 이미지 조회 |
| 게시글 | `PATCH` | `/posts/{postId}` | 게시글 제목·내용·이미지 수정 |
| 회원 | `GET` | `/users/me` | Header 현재 사용자 |
| 인증 | `POST` | `/auth/reissue` | Access Token 복구 |
| 인증 | `POST` | `/auth/logout` | Header 로그아웃 |

게시글 GET/PATCH는 JSON, `credentials: "include"`, Bearer Access Token, 401 재발급·1회 재시도 정책을 사용한다.

## GET `/posts/{postId}`

### Path parameter

| 필드 | 타입 | 조건 |
|---|---|---|
| `postId` | number | 양의 정수 |

### 수정 화면이 사용하는 성공 응답

```json
{
  "data": {
    "postId": 1,
    "title": "기존 제목",
    "content": "기존 내용",
    "imageUrls": ["old-1.png", "old-2.jpg"],
    "author": true
  }
}
```

| 필드 | 용도 |
|---|---|
| `title` | 제목 input 초기값 |
| `content` | textarea 초기값 |
| `imageUrls` | 기존 이미지 표시 및 새 파일 미선택 시 PATCH 값 |
| `author` | 상세 화면에서 수정 링크를 제한하지만 Vanilla 수정 페이지는 별도 사전 검사에 사용하지 않음 |

현재 수정 화면은 상세 응답의 다른 필드를 사용하지 않는다. GET 성공만으로 수정 권한을 확정하지 않고 PATCH 403을 최종 권한 판단으로 처리한다.

## PATCH `/posts/{postId}`

### Request body: 기존 이미지 유지

```json
{
  "title": "수정한 제목",
  "content": "수정한 내용",
  "imageUrls": ["old-1.png", "old-2.jpg"]
}
```

### Request body: 새 이미지로 전체 교체

```json
{
  "title": "수정한 제목",
  "content": "수정한 내용",
  "imageUrls": ["new-1.png", "new-2.jpg"]
}
```

| 필드 | 타입 | 필수 | 프론트엔드 조건 |
|---|---|---:|---|
| `title` | string | O | trim 후 1~26자 |
| `content` | string | O | trim 후 빈 값 금지 |
| `imageUrls` | string[] | O | 새 파일이 있으면 `File.name[]`, 없으면 기존 배열 |

성공 응답 body는 사용하지 않는다. 성공하면 현재 게시글 상세로 이동한다.

현재 API에는 일부 기존 이미지만 삭제하거나 기존 이미지에 새 이미지를 추가하는 표현이 없다. 새 파일을 선택하면 배열 전체를 교체한다.

## 실제 백엔드 확인 항목

- [ ] GET 상세가 수정 페이지에 필요한 모든 필드를 반환하는지 확인
- [ ] 다른 작성자도 GET은 가능하고 PATCH에서만 403인지 확인
- [ ] 숨김 게시글의 수정 허용 정책 확인
- [ ] PATCH 성공 status와 응답 body 확인
- [ ] PATCH가 전체 교체 방식인지 부분 수정 방식인지 확인
- [ ] `imageUrls` 빈 배열이 모든 이미지 삭제를 의미하는지 확인
- [ ] 이미지 파일명 배열을 받는 임시 계약인지 확인
- [ ] 실제 이미지 upload 또는 multipart API 존재 여부 확인
- [ ] 제목·내용·이미지의 서버 제한 확인

