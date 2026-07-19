# 게시글 상세 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 브라우저·코드 검증 |
| Vanilla URL |  |
| React URL | `http://localhost:5173/posts/{postId}` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 테스트 계정·게시글 | 보안을 위해 식별 가능한 계정 정보는 기록하지 않는다. |
| 브라우저/버전 | Codex In-app Browser |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## Route와 상세 조회

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-001 | 인증 사용자가 유효한 상세 URL에 진입한다. | Header와 상세 데이터가 표시된다. | 미실행 | BLOCKED | 실제 테스트 계정과 상세 데이터 필요 |
| POST-DETAIL-002 | ID 없이 `/posts`에 진입한다. | Vanilla에서는 잘못된 주소로 처리하고 React에서는 정상 목록 Route를 표시한다. | 미실행 | PASS | `/posts` 목록 Route와 상세 Route 분리 확인 |
| POST-DETAIL-003 | 숫자가 아닌 ID로 진입한다. | 잘못된 주소 alert 후 목록으로 이동한다. | 미실행 | PASS | `Number`와 정수 검증 코드 확인 |
| POST-DETAIL-004 | 0·음수·소수 ID로 진입한다. | 잘못된 주소 alert 후 목록으로 이동한다. | 미실행 | PASS | 양의 정수 조건 확인 |
| POST-DETAIL-005 | 유효한 ID로 진입한다. | `GET /posts/{postId}`를 한 번 요청한다. | 미실행 | PASS | `getPost`와 ID별 Promise Map 확인 |
| POST-DETAIL-006 | 상세 요청을 지연한다. | 상세·댓글은 표시되지 않고 중복 요청하지 않는다. | 미실행 | PASS | 현재 ID 응답 전 `post=null`, 동일 Promise 재사용 확인 |
| POST-DETAIL-007 | 목록의 카드를 선택한다. | 해당 ID의 상세 화면이 표시된다. | 미실행 | PASS | 카드 `/posts/{id}` Link와 Route 매칭 확인 |
| POST-DETAIL-008 | Header 뒤로가기를 선택한다. | `/posts`로 이동한다. | 미실행 | PASS | Header `backTo`와 기존 이미지 확인 |

## 게시글 표시

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-010 | 일반 게시글을 표시한다. | 제목, 본문, 작성자, 날짜와 통계가 일치한다. | 미실행 | PASS | 상세 표현 컴포넌트와 formatter 연결 확인 |
| POST-DETAIL-011 | 줄바꿈이 있는 본문을 표시한다. | 줄바꿈과 긴 단어가 레이아웃을 깨지 않고 표시된다. | 미실행 | PASS | `pre-wrap`, `overflow-wrap` CSS 확인 |
| POST-DETAIL-012 | 수정된 게시글을 표시한다. | 작성일 옆에 `(수정됨)`이 표시된다. | 미실행 | PASS | `edited` 조건부 렌더링 확인 |
| POST-DETAIL-013 | 수정되지 않은 게시글을 표시한다. | `(수정됨)`이 표시되지 않는다. | 미실행 | PASS | `edited` 조건부 렌더링 확인 |
| POST-DETAIL-014 | 1,000 이상 통계를 표시한다. | 좋아요·조회수·댓글이 `{n}k` 형식이다. | 미실행 | PASS | 목록에서 검증한 `formatPostCount` 재사용 |
| POST-DETAIL-015 | 탈퇴 작성자의 게시글을 표시한다. | 닉네임이 `알 수 없음`이다. | 미실행 | PASS | `getPostNickname` 조건 확인 |
| POST-DETAIL-016 | 프로필 이미지가 없거나 로드 실패한다. | 기본 프로필 이미지가 표시된다. | 미실행 | PASS | 공통 `ProfileImage` fallback 확인 |
| POST-DETAIL-017 | 내가 작성한 게시글을 표시한다. | 수정·삭제 버튼이 표시된다. | 미실행 | PASS | `author` 조건부 렌더링 확인 |
| POST-DETAIL-018 | 다른 작성자의 게시글을 표시한다. | 수정·삭제 버튼이 표시되지 않는다. | 미실행 | PASS | `author` 조건부 렌더링 확인 |
| POST-DETAIL-019 | 수정 링크를 선택한다. | `/posts/{postId}/edit`로 이동한다. | 미실행 | BLOCKED | Link는 구현됐으나 수정 Route 미구현 |

## 숨김 게시글

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-020 | `blinded=true` 상세를 조회한다. | 제목과 본문에 숨김 문구가 표시된다. | 미실행 | PASS | 제목·본문 대체 조건 확인 |
| POST-DETAIL-021 | 숨김 게시글의 반응 영역을 확인한다. | 좋아요 버튼이 숨겨지고 비활성화된다. | 미실행 | PASS | 좋아요 영역 미렌더링 확인 |
| POST-DETAIL-022 | 숨김 게시글의 이미지와 댓글을 확인한다. | 갤러리와 댓글 section 전체가 표시되지 않는다. | 미실행 | PASS | 두 영역 조건부 렌더링 확인 |

## 이미지 갤러리

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-030 | 이미지가 없는 게시글을 표시한다. | 갤러리가 표시되지 않는다. | 미실행 | PASS | 배열 방어와 빈 배열 반환 확인 |
| POST-DETAIL-031 | 이미지가 1개인 게시글을 표시한다. | 이미지만 표시되고 버튼·indicator는 숨겨진다. | 미실행 | PASS | `hasMultipleImages` 조건 확인 |
| POST-DETAIL-032 | 이미지가 여러 개인 게시글을 표시한다. | 첫 이미지와 `1 / N`이 표시된다. | 미실행 | PASS | 초기 index와 indicator 확인 |
| POST-DETAIL-033 | 첫 이미지 상태를 확인한다. | 이전 버튼 disabled, 다음 버튼 enabled다. | 미실행 | PASS | 경계 조건 확인 |
| POST-DETAIL-034 | 다음 버튼을 선택한다. | 다음 이미지와 index가 표시된다. | 미실행 | PASS | 상한 제한 state 갱신 확인 |
| POST-DETAIL-035 | 마지막 이미지 상태를 확인한다. | 다음 버튼이 disabled다. | 미실행 | PASS | 마지막 index 조건 확인 |
| POST-DETAIL-036 | 이전 버튼을 선택한다. | 이전 이미지와 index가 표시된다. | 미실행 | PASS | 하한 제한 state 갱신 확인 |
| POST-DETAIL-037 | 잘못된 이미지 URL을 받는다. | fallback 이미지로 교체된다. | 미실행 | PASS | 첫 error에서 fallback 적용 확인 |
| POST-DETAIL-038 | fallback도 실패한다. | 갤러리가 숨겨지고 오류가 반복되지 않는다. | 미실행 | PASS | data flag와 unavailable state 확인 |
| POST-DETAIL-039 | 다른 게시글 상세로 전환한다. | 갤러리 index가 0으로 초기화된다. | 미실행 | PASS | 상세 응답 `renderVersion` key 확인 |

## 댓글 조회

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-040 | 댓글이 없는 게시글을 표시한다. | 빈 상태 문구 없이 댓글 폼만 표시된다. | 미실행 | PASS | CommentForm과 빈 CommentList 렌더링 확인 |
| POST-DETAIL-041 | 일반 댓글을 표시한다. | 작성자, 날짜와 내용이 표시된다. | 미실행 | PASS | `CommentCard` JSX 확인 |
| POST-DETAIL-042 | 삭제 댓글을 표시한다. | 내용이 `삭제된 댓글입니다.`로 표시된다. | 미실행 | PASS | `commentDeleted` 조건 확인 |
| POST-DETAIL-043 | 탈퇴 작성자의 댓글을 표시한다. | 닉네임이 `알 수 없음`이고 수정·삭제 버튼이 없다. | 미실행 | PASS | 닉네임과 `canModify` 조건 확인 |
| POST-DETAIL-044 | 내가 작성한 일반 댓글을 표시한다. | 수정·삭제 버튼이 표시된다. | 미실행 | PASS | `author` 조건 확인 |
| POST-DETAIL-045 | 다른 사용자의 댓글을 표시한다. | 수정·삭제 버튼이 표시되지 않는다. | 미실행 | PASS | `author` 조건 확인 |
| POST-DETAIL-046 | 댓글 프로필 이미지가 실패한다. | 기본 프로필 이미지로 교체된다. | 미실행 | PASS | 공통 `ProfileImage` 재사용 확인 |

## 좋아요

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-050 | 좋아요하지 않은 게시글을 표시한다. | `aria-pressed=false`와 기본 스타일이다. | 미실행 | PASS | 표시 상태 확인 |
| POST-DETAIL-051 | 좋아요한 게시글을 표시한다. | `aria-pressed=true`와 liked 스타일이다. | 미실행 | PASS | 표시 상태 확인 |
| POST-DETAIL-052 | 좋아요 버튼을 선택한다. | POST 요청 후 liked와 수치가 응답대로 갱신된다. | 미실행 | PASS | API 함수와 현재 post 부분 state 갱신 확인 |
| POST-DETAIL-053 | 버튼을 빠르게 여러 번 선택한다. | 진행 중 요청이 한 번만 전송된다. | 미실행 | PASS | Promise ref 차단과 버튼 disabled 확인 |
| POST-DETAIL-054 | 좋아요 요청이 실패한다. | 기존 상태를 유지하고 버튼을 복구한다. | 미실행 | PASS | 실패 시 post 미변경, finally 상태 복구 확인 |

## 댓글 등록과 수정

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-060 | 빈 댓글 폼을 확인한다. | 등록 버튼이 비활성화되어 있다. | 미실행 | PASS | trim 기반 `canSubmit` 확인 |
| POST-DETAIL-061 | 공백만 입력하고 제출한다. | 빈 내용 helper가 표시되고 요청하지 않는다. | 미실행 | PASS | 순수 검증과 submit 조기 종료 확인 |
| POST-DETAIL-062 | 유효한 댓글을 입력한다. | 등록 버튼이 활성화된다. | 미실행 | PASS | controlled input과 버튼 조건 확인 |
| POST-DETAIL-063 | 댓글을 등록한다. | trim한 content를 전송하고 성공 후 상세를 재조회한다. | 미실행 | PASS | POST payload와 공통 refresh 흐름 확인 |
| POST-DETAIL-064 | 등록 버튼을 빠르게 여러 번 선택한다. | 요청이 한 번만 전송된다. | 미실행 | PASS | Promise ref와 pending 버튼 확인 |
| POST-DETAIL-065 | 댓글 수정 버튼을 선택한다. | 상단 폼에 기존 내용, 취소와 `댓글 수정` 버튼이 표시된다. | 미실행 | PASS | 댓글 snapshot, form key와 focus effect 확인 |
| POST-DETAIL-066 | 수정 모드에서 취소한다. | 빈 댓글 등록 모드로 돌아간다. | 미실행 | PASS | 수정 대상 초기화와 form 재마운트 확인 |
| POST-DETAIL-067 | 댓글을 수정한다. | PATCH 후 폼 초기화와 상세 재조회가 실행된다. | 미실행 | PASS | PATCH payload와 성공 흐름 확인 |
| POST-DETAIL-068 | 등록·수정 요청이 실패한다. | 입력값과 수정 모드를 유지하고 버튼을 복구한다. | 미실행 | PASS | form error catch와 finally 상태 복구 확인 |

## 삭제 모달과 삭제

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-070 | 게시글 삭제 버튼을 선택한다. | 게시글 삭제 문구의 모달이 열리고 확인에 포커스한다. | 미실행 | PASS | 대상 상태와 confirm 초기 포커스 확인 |
| POST-DETAIL-071 | 댓글 삭제 버튼을 선택한다. | 댓글 삭제 문구의 모달이 열린다. | 미실행 | PASS | 댓글 ID를 포함한 대상과 제목 분기 확인 |
| POST-DETAIL-072 | 취소·backdrop·Escape를 사용한다. | 요청 중이 아니면 모달이 닫힌다. | 미실행 | PASS | 세 닫기 경로와 요청 중 차단 확인 |
| POST-DETAIL-073 | 삭제 확인을 빠르게 여러 번 선택한다. | 삭제 요청이 한 번만 전송된다. | 미실행 | PASS | Promise ref와 버튼 disabled 확인 |
| POST-DETAIL-074 | 게시글 삭제에 성공한다. | `/posts`로 이동한다. | 미실행 | PASS | DELETE 성공 후 replace 이동 확인 |
| POST-DETAIL-075 | 댓글 삭제에 성공한다. | 모달을 닫고 상세를 다시 조회한다. | 미실행 | PASS | 대상 초기화와 refresh 흐름 확인 |
| POST-DETAIL-076 | 삭제가 실패한다. | 모달을 닫고 대상 상태를 초기화한다. | 미실행 | PASS | catch 선처리와 동작별 오류 handler 확인 |

## API 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-DETAIL-080 | 상세 401 `unauthorized_request`를 반환한다. | 로그인 필요 alert 후 `/login`으로 이동한다. | 미실행 | PASS | 오류 분기 코드와 비인증 보호 Route 이동 확인 |
| POST-DETAIL-081 | 상세 404 `post_not_found`를 반환한다. | 존재하지 않는 게시글 alert 후 `/posts`로 이동한다. | 미실행 | PASS | 오류 분기와 replace 이동 확인 |
| POST-DETAIL-082 | 상세 500을 반환한다. | 서버 오류 alert, 현재 Route 유지다. | 미실행 | PASS | 오류 분기와 이동 없음 확인 |
| POST-DETAIL-083 | 게시글 삭제 403을 반환한다. | 삭제 권한 없음 alert를 표시한다. | 미실행 | PASS | status/message 오류 분기 확인 |
| POST-DETAIL-084 | 댓글 400 `blank_comment_content`를 반환한다. | 댓글 helper가 표시된다. | 미실행 | PASS | 요청 오류를 form helper로 변환 확인 |
| POST-DETAIL-085 | 댓글 403을 반환한다. | 동작별 권한 없음 alert를 표시한다. | 미실행 | PASS | 공통 댓글 오류 분기 확인 |
| POST-DETAIL-086 | 댓글 404 `comment_not_found`를 반환한다. | alert 후 상세를 재조회한다. | 미실행 | PASS | alert와 refresh 호출 확인 |
| POST-DETAIL-087 | 좋아요 404 `post_not_found`를 반환한다. | alert 후 `/posts`로 이동한다. | 미실행 | PASS | 좋아요 오류 분기와 replace 이동 확인 |
| POST-DETAIL-088 | 각 API에 네트워크 오류를 발생시킨다. | 동작별 일반 오류를 표시하고 기존 데이터를 유지한다. | 미실행 | PASS | 조회·좋아요·댓글·삭제 일반 오류 분기 확인 |

## 반응형·접근성

- [x] 900px 초과에서 좋아요가 좌측 세로형이고 본문이 128px 들여쓰기다. (CSS 정적 확인)
- [x] 900px 이하에서 좋아요가 상단 가로형이고 들여쓰기가 제거된다. (CSS 정적 확인)
- [x] 640px 이하에서 meta·댓글 header가 세로 배치되고 갤러리가 280px다. (CSS 정적 확인)
- [x] 좋아요 버튼의 `aria-pressed`가 상태와 일치한다. (JSX 정적 확인)
- [x] 갤러리 버튼에 이전·다음 accessible name이 있다. (JSX 정적 확인)
- [x] 모달에 dialog name·description과 초기 포커스가 있다. (JSX·effect 정적 확인)
- [x] Header 메뉴와 모달의 document event가 unmount에서 cleanup된다. (effect cleanup 확인)

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| POST-DETAIL-001 | 외부 상태 의존 | 인증된 실제 상세 데이터의 시각 검증이 필요함 | 테스트 계정으로 브라우저 재검증 |
| POST-DETAIL-019 | 후속 Route 미구현 | 게시글 수정 화면이 아직 없음 | 수정 페이지 마이그레이션 후 검증 |
