# 게시글 상세 오류 상태별 화면 동작

## 1. Route 검증

| 조건 | UI 동작 | 이동 |
|---|---|---|
| `postId`가 숫자 아님, 0 이하, 정수 아님 | `잘못된 게시글 주소입니다.` alert | `/posts` |

잘못된 ID에서는 API 요청과 이벤트 등록을 하지 않는다.

React의 `/posts`는 목록 Route이므로 `postId`가 없는 상세 화면으로 해석하지 않는다. Vanilla의 `post.html`에서 query parameter가 없는 경우에만 기존 잘못된 주소 alert가 적용된다.

## 2. 상세 조회 오류

| HTTP 상태 | `message` | UI 동작 | 이동 |
|---:|---|---|---|
| 401 | `unauthorized_request` | `로그인이 필요합니다.` alert | `/login` |
| 404 | `post_not_found` | `존재하지 않는 게시글입니다.` alert | `/posts` |
| 500 | `internal_server_error` | `서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.` alert | 없음 |
| 그 외 | 구분하지 않음 | `게시글을 불러오는 중 오류가 발생했습니다.` alert | 없음 |

500·기타 오류에서 상세와 댓글은 숨겨진 상태로 남는다.

## 3. 게시글 삭제 오류

| HTTP 상태 | `message` | UI 동작 | 이동 |
|---:|---|---|---|
| 401 | `unauthorized_request` | 로그인 필요 alert | `/login` |
| 403 | `post_delete_forbidden` | `게시글을 삭제할 권한이 없습니다.` alert | 없음 |
| 404 | `post_not_found` | 존재하지 않는 게시글 alert | `/posts` |
| 그 외 | 구분하지 않음 | `게시글 삭제 중 오류가 발생했습니다.` alert | 없음 |

오류 전에 모달을 닫고 삭제 대상을 초기화한다.

## 4. 댓글 등록·수정·삭제 오류

| HTTP 상태 | `message` | UI 동작 | 추가 동작 |
|---:|---|---|---|
| 400 | `blank_comment_content` | helper `* 댓글 내용을 입력해주세요.` | 입력 유지 |
| 401 | `unauthorized_request` | 로그인 필요 alert | `/login` 이동 |
| 403 | 구분하지 않음 | `댓글을 {등록/수정/삭제}할 권한이 없습니다.` alert | 현재 화면 유지 |
| 404 | `comment_not_found` | `존재하지 않는 댓글입니다.` alert | 상세 재조회 |
| 500 | `internal_server_error` | 서버 오류 alert | 현재 화면 유지 |
| 그 외 | 구분하지 않음 | `댓글 {동작} 중 오류가 발생했습니다.` alert | 현재 화면 유지 |

댓글 삭제 오류에서는 모달을 먼저 닫는다. 등록·수정 실패 시 입력값과 수정 모드를 유지한다.

## 5. 좋아요 오류

| HTTP 상태 | `message` | UI 동작 | 이동 |
|---:|---|---|---|
| 401 | `unauthorized_request` | 로그인 필요 alert | `/login` |
| 404 | `post_not_found` | 존재하지 않는 게시글 alert | `/posts` |
| 500 | `internal_server_error` | 서버 오류 alert | 없음 |
| 그 외 | 구분하지 않음 | `좋아요 처리 중 오류가 발생했습니다.` alert | 없음 |

실패 후 기존 좋아요 상태와 수치를 유지하고 버튼을 다시 활성화한다.

## 6. 이미지 오류

| 대상 | 실패 | 동작 |
|---|---|---|
| 작성자·댓글 프로필 | 서버 이미지 로드 실패 | 기본 프로필 이미지로 교체 |
| 갤러리 이미지 | 서버 이미지 로드 실패 | `image_fallback.png`로 교체 |
| 갤러리 fallback | fallback도 로드 실패 | `src` 제거 후 갤러리 숨김 |

## 7. 네트워크·파싱 오류

status가 없는 오류는 각 동작의 일반 오류로 처리한다.

- 상세: `게시글을 불러오는 중 오류가 발생했습니다.`
- 좋아요: `좋아요 처리 중 오류가 발생했습니다.`
- 게시글 삭제: `게시글 삭제 중 오류가 발생했습니다.`
- 댓글: `댓글 {동작} 중 오류가 발생했습니다.`
