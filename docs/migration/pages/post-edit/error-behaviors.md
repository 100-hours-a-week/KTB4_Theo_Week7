# 게시글 수정 오류 상태별 UI 동작

## 1. Route와 클라이언트 검증

| 조건 | API 요청 | UI 동작 | 이동 |
|---|---|---|---|
| `postId`가 숫자가 아니거나 0·음수·소수다 | 전송 안 함 | `잘못된 게시글 주소입니다.` alert | `/posts` |
| 제목이 비어 있거나 공백뿐이다 | PATCH 안 함 | `* 제목을 입력해주세요.` helper | 없음 |
| 제목이 trim 후 26자를 초과한다 | PATCH 안 함 | `* 제목은 최대 26자까지 작성 가능합니다.` helper | 없음 |
| 내용이 비어 있거나 공백뿐이다 | PATCH 안 함 | `* 내용을 입력해주세요.` helper | 없음 |
| 조회 또는 수정 요청 중 다시 실행한다 | 추가 전송 안 함 | 버튼 비활성화 유지 | 없음 |

## 2. GET `/posts/{postId}` 오류

| Status | message | UI 동작 | 이동 |
|---:|---|---|---|
| 401 | `unauthorized_request` | `로그인이 필요합니다.` alert | `/login` |
| 404 | `post_not_found` | `존재하지 않는 게시글입니다.` alert | `/posts` |
| 500 | `internal_server_error` | 서버 오류 alert, form은 계속 숨김 | 없음 |
| 기타 또는 네트워크 오류 | 기타 | `수정할 게시글을 불러오는 중 오류가 발생했습니다.` alert, form은 숨김 | 없음 |

서버 오류 alert 문구는 `서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`다. Vanilla에는 GET 실패 후 별도 재시도 버튼이 없다.

## 3. PATCH `/posts/{postId}` 오류

처리 전에 기존 제목·내용 서버 helper를 비우고 아래에서 일치하는 항목 하나를 표시한다.

| Status | message | UI 동작 | 입력 상태 | 이동 |
|---:|---|---|---|---|
| 400 | `blank_title` | 제목 빈 값 helper | 유지 | 없음 |
| 400 | `blank_content` | 내용 빈 값 helper | 유지 | 없음 |
| 400 | `invalid_post_title` | 제목 최대 26자 helper | 유지 | 없음 |
| 401 | `unauthorized_request` | 로그인 필요 alert | 페이지 이탈 | `/login` |
| 403 | `post_modify_forbidden` | `게시글을 수정할 권한이 없습니다.` alert | 페이지 이탈 | `/posts/:postId` |
| 404 | `post_not_found` | 존재하지 않는 게시글 alert | 페이지 이탈 | `/posts` |
| 500 | `internal_server_error` | 서버 오류 alert | 유지 | 없음 |
| 기타 또는 네트워크 오류 | 기타 | `게시글 수정 중 오류가 발생했습니다.` alert | 유지 | 없음 |

이동하지 않는 오류에서는 pending을 해제한 뒤 폼 유효성에 따라 수정 버튼을 다시 활성화한다.

## 4. 이미지 오류

- 기존 이미지 로드 실패: 실패한 이미지 요소만 숨기거나 제거한다.
- 새 미리보기 로드 실패: Vanilla에는 별도 fallback과 오류 문구가 없다.
- 파일 개수·크기·형식: 프론트엔드 별도 오류 처리가 없다.
- Object URL 생성 실패: Vanilla에는 별도 처리 로직이 없다.

React 1차 구현에서 새로운 이미지 제한을 임의로 만들지 않는다. 개선하면 설계 변경 기록과 체크리스트를 함께 수정한다.

