# 게시글 수정 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 코드·빌드 검증 |
| Vanilla URL | `pages/edit-post.html?postId={id}` |
| React URL | `http://localhost:5173/posts/{postId}/edit` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 테스트 계정·게시글 | 보안을 위해 식별 가능한 정보는 기록하지 않는다. |
| 브라우저/버전 | 정적 검증 단계로 브라우저 실증 미실행 |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## Route, 초기 조회와 Header

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-EDIT-001 | 인증 작성자가 유효한 수정 URL에 진입한다. | 조회 후 기존 값이 채워진 form이 표시된다. | 미실행 | BLOCKED | 실제 수정 가능한 계정·게시글로 시각 검증 필요 |
| POST-EDIT-002 | 비인증 사용자가 진입한다. | 인증 초기화 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-003 | 숫자가 아닌 ID로 진입한다. | alert 후 API 요청 없이 `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-004 | 0·음수·소수 ID로 진입한다. | alert 후 API 요청 없이 `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-005 | 유효한 ID로 진입한다. | GET 요청이 한 번만 전송된다. | 미실행 | PASS |  |
| POST-EDIT-006 | GET을 지연한다. | heading만 표시되고 form은 숨겨진다. | 미실행 | PASS |  |
| POST-EDIT-007 | 뒤로가기를 선택한다. | 현재 `/posts/{postId}`로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-008 | 로고를 선택한다. | `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-009 | 프로필 메뉴와 로그아웃을 사용한다. | 공통 Header 동작과 일치한다. | 미실행 | PASS |  |

## 초기값과 폼 검증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-EDIT-010 | 조회에 성공한다. | 응답 제목·내용이 입력 초기값이 된다. | 미실행 | PASS |  |
| POST-EDIT-011 | 유효한 기존 값을 표시한다. | 수정 버튼이 활성화된다. | 미실행 | PASS |  |
| POST-EDIT-012 | 제목을 비우거나 공백만 입력한다. | 제목 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| POST-EDIT-013 | 제목 26자를 입력한다. | 유효한 경계값이다. | 미실행 | PASS |  |
| POST-EDIT-014 | 제목 27자 입력을 시도한다. | 최대 26자를 보장한다. | 미실행 | PASS |  |
| POST-EDIT-015 | 내용을 비우거나 공백만 입력한다. | 내용 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| POST-EDIT-016 | 한 필드만 유효하다. | 수정 버튼이 비활성화된다. | 미실행 | PASS |  |
| POST-EDIT-017 | 유효하지 않은 폼을 강제 submit한다. | helper를 표시하고 PATCH하지 않는다. | 미실행 | PASS |  |
| POST-EDIT-018 | 앞뒤 공백이 있는 유효한 값을 제출한다. | trim한 값을 PATCH한다. | 미실행 | PASS |  |

## 기존 이미지와 새 이미지

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-EDIT-020 | 기존 이미지가 없다. | 기존 이미지 section을 숨긴다. | 미실행 | PASS |  |
| POST-EDIT-021 | 기존 이미지가 여러 개다. | 응답 순서대로 이미지와 순번 alt를 표시한다. | 미실행 | PASS |  |
| POST-EDIT-022 | 기존 이미지 하나가 실패한다. | 실패한 이미지만 제거한다. | 미실행 | PASS |  |
| POST-EDIT-023 | 새 이미지를 선택하지 않는다. | 기존 이미지 유지 안내 문구를 표시한다. | 미실행 | PASS |  |
| POST-EDIT-024 | 새 이미지 없이 제출한다. | 기존 `imageUrls` 배열을 PATCH한다. | 미실행 | PASS |  |
| POST-EDIT-025 | 새 이미지 여러 개를 선택한다. | 파일명과 미리보기를 순서대로 표시한다. | 미실행 | PASS |  |
| POST-EDIT-026 | 새 이미지가 선택된 안내를 확인한다. | 기존 이미지 전체 교체 문구를 표시한다. | 미실행 | PASS |  |
| POST-EDIT-027 | 새 이미지와 함께 제출한다. | 새 `File.name[]`만 PATCH한다. | 미실행 | PASS | 기존 배열과 합치지 않음 |
| POST-EDIT-028 | 파일 선택을 변경하거나 비운다. | 이전 URL을 반환하고 새 상태만 표시한다. | 미실행 | PASS |  |
| POST-EDIT-029 | 새 이미지 선택 후 페이지를 떠난다. | 모든 Object URL을 반환한다. | 미실행 | PASS |  |

## 수정 요청

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-EDIT-030 | 유효한 폼을 제출한다. | PATCH 요청이 한 번 전송된다. | 미실행 | PASS |  |
| POST-EDIT-031 | 수정 버튼을 빠르게 여러 번 선택한다. | 추가 요청을 차단한다. | 미실행 | PASS |  |
| POST-EDIT-032 | PATCH를 지연한다. | 버튼이 비활성화되고 문구는 유지된다. | 미실행 | PASS |  |
| POST-EDIT-033 | PATCH에 성공한다. | 현재 게시글 상세로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-034 | PATCH에 실패한다. | 입력과 이미지 상태를 유지하고 버튼을 복구한다. | 미실행 | PASS |  |

## API 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-EDIT-040 | GET 401 `unauthorized_request`를 반환한다. | alert 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-041 | GET 404 `post_not_found`를 반환한다. | alert 후 `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-042 | GET 500 또는 일반 오류를 반환한다. | 오류 alert, form은 숨겨진 상태다. | 미실행 | PASS |  |
| POST-EDIT-043 | PATCH 400 `blank_title`을 반환한다. | 제목 빈 값 helper를 표시한다. | 미실행 | PASS |  |
| POST-EDIT-044 | PATCH 400 `blank_content`를 반환한다. | 내용 빈 값 helper를 표시한다. | 미실행 | PASS |  |
| POST-EDIT-045 | PATCH 400 `invalid_post_title`을 반환한다. | 제목 길이 helper를 표시한다. | 미실행 | PASS |  |
| POST-EDIT-046 | PATCH 401 `unauthorized_request`를 반환한다. | alert 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-047 | PATCH 403 `post_modify_forbidden`을 반환한다. | 권한 alert 후 현재 상세로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-048 | PATCH 404 `post_not_found`를 반환한다. | alert 후 `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-EDIT-049 | PATCH 500 또는 일반 오류를 반환한다. | 동작별 alert 후 현재 입력을 유지한다. | 미실행 | PASS |  |

## 반응형·접근성

- [x] 640px 초과에서 이미지 grid가 3열이다. (CSS 정적 확인)
- [x] 640px 이하에서 이미지 grid가 2열이고 Header·card가 축소된다. (CSS 정적 확인)
- [x] GET 완료 전 form의 interactive control이 노출되지 않는다. (조건부 JSX 확인)
- [x] 제목·내용 label과 helper가 입력에 연결된다. (JSX 정적 확인)
- [x] 오류 입력에 `aria-invalid=true`가 적용된다. (JSX 정적 확인)
- [x] 뒤로가기와 프로필 버튼에 accessible name이 있다. (공통 Header JSX 확인)
- [x] 키보드만으로 폼과 메뉴를 사용할 수 있다. (native control과 공통 메뉴 구조 확인)
- [x] Object URL과 공통 document event가 unmount에서 cleanup된다. (hook과 공통 메뉴 effect cleanup 확인)

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| POST-EDIT-001 | 외부 상태 의존 | 인증된 작성자와 실제 수정 가능한 게시글의 시각·상호작용 검증이 필요함 | 테스트 계정과 실행 중인 백엔드로 브라우저 재검증 |
| POST-EDIT-API | 실제 계약 확인 | PATCH 성공 status, 이미지 배열 전체 교체와 파일명 임시 계약은 프론트 코드만으로 확정할 수 없음 | 실제 백엔드 응답과 API 명세 대조 |
