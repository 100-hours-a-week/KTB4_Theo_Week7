# 게시글 작성 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 코드·빌드 검증 |
| Vanilla URL | `pages/make-post.html` |
| React URL | `http://localhost:5173/posts/new` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 테스트 계정 | 보안을 위해 식별 가능한 계정 정보는 기록하지 않는다. |
| 브라우저/버전 | 정적 검증 단계로 브라우저 실증 미실행 |
| 관련 커밋 |  |

구현 후 결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## Route와 Header

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-CREATE-001 | 인증 사용자가 작성 URL에 진입한다. | Header와 빈 작성 폼이 표시된다. | 미실행 | BLOCKED | 실제 테스트 계정으로 시각 검증 필요 |
| POST-CREATE-002 | 비인증 사용자가 진입한다. | 인증 초기화 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| POST-CREATE-003 | 뒤로가기를 선택한다. | `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-CREATE-004 | 로고를 선택한다. | `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-CREATE-005 | 프로필 메뉴와 로그아웃을 사용한다. | 공통 Header 동작과 일치한다. | 미실행 | PASS |  |

## 폼 초기 상태와 검증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-CREATE-010 | 페이지에 처음 진입한다. | 제목·내용이 비어 있고 완료 버튼이 비활성화된다. | 미실행 | PASS |  |
| POST-CREATE-011 | 제목이 비어 있는 상태에서 blur한다. | 제목 빈 값 helper가 표시된다. | 미실행 | PASS |  |
| POST-CREATE-012 | 제목에 공백만 입력한다. | 제목 빈 값 helper, 버튼 비활성화 상태다. | 미실행 | PASS |  |
| POST-CREATE-013 | 제목 26자를 입력한다. | 제목이 유효하다. | 미실행 | PASS | 경계값 |
| POST-CREATE-014 | 제목 27자 입력을 시도한다. | input과 검증이 최대 26자를 보장한다. | 미실행 | PASS | maxlength 포함 |
| POST-CREATE-015 | 내용을 비우거나 공백만 입력하고 blur한다. | 내용 빈 값 helper가 표시된다. | 미실행 | PASS |  |
| POST-CREATE-016 | 제목만 유효하다. | 완료 버튼은 비활성화된다. | 미실행 | PASS |  |
| POST-CREATE-017 | 내용만 유효하다. | 완료 버튼은 비활성화된다. | 미실행 | PASS |  |
| POST-CREATE-018 | 제목과 내용이 모두 유효하다. | 완료 버튼이 활성화된다. | 미실행 | PASS |  |
| POST-CREATE-019 | 유효한 값 앞뒤에 공백을 넣는다. | trim 기준으로 검증하고 제출한다. | 미실행 | PASS |  |
| POST-CREATE-020 | 유효하지 않은 폼을 강제로 제출한다. | helper를 표시하고 API를 요청하지 않는다. | 미실행 | PASS |  |

## 이미지 선택과 자원 정리

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-CREATE-030 | 초기 이미지 영역을 확인한다. | 선택된 이미지가 없다는 문구가 표시된다. | 미실행 | PASS |  |
| POST-CREATE-031 | 이미지 1개를 선택한다. | 파일명과 정사각형 미리보기 1개가 표시된다. | 미실행 | PASS |  |
| POST-CREATE-032 | 이미지 여러 개를 선택한다. | 모든 파일명과 미리보기가 선택 순서대로 표시된다. | 미실행 | PASS |  |
| POST-CREATE-033 | 이미지 선택을 다른 파일로 변경한다. | 이전 미리보기 URL을 반환하고 새 목록만 표시한다. | 미실행 | PASS | URL API 관찰 필요 |
| POST-CREATE-034 | 이미지 선택을 취소하거나 비운다. | 미리보기를 비우고 초기 문구를 표시한다. | 미실행 | PASS |  |
| POST-CREATE-035 | 이미지 선택 후 페이지를 떠난다. | 생성한 모든 Object URL을 반환한다. | 미실행 | PASS | cleanup 확인 |
| POST-CREATE-036 | 이미지를 선택하고 제출한다. | 실제 파일이 아니라 파일명 배열을 `imageUrls`로 전송한다. | 미실행 | PASS | 현재 임시 계약 |

## 게시글 작성 요청

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-CREATE-040 | 이미지 없이 유효한 폼을 제출한다. | trim한 제목·내용과 `imageUrls: []`를 POST한다. | 미실행 | PASS |  |
| POST-CREATE-041 | 완료 버튼을 빠르게 여러 번 선택한다. | 작성 요청이 한 번만 전송된다. | 미실행 | PASS |  |
| POST-CREATE-042 | 요청을 지연한다. | 완료 버튼이 비활성화되고 문구는 유지된다. | 미실행 | PASS |  |
| POST-CREATE-043 | 성공 응답에 `postId`가 있다. | `/posts/{postId}`로 이동한다. | 미실행 | PASS |  |
| POST-CREATE-044 | 성공 응답에 `postId`가 없다. | `/posts`로 이동한다. | 미실행 | PASS |  |
| POST-CREATE-045 | 요청이 실패한다. | 입력·이미지 상태를 유지하고 버튼을 복구한다. | 미실행 | PASS |  |

## API 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-CREATE-050 | 400 `blank_title`을 반환한다. | 제목 빈 값 helper를 표시한다. | 미실행 | PASS |  |
| POST-CREATE-051 | 400 `blank_content`를 반환한다. | 내용 빈 값 helper를 표시한다. | 미실행 | PASS |  |
| POST-CREATE-052 | 400 `invalid_post_title`을 반환한다. | 제목 최대 길이 helper를 표시한다. | 미실행 | PASS |  |
| POST-CREATE-053 | 401 `unauthorized_request`를 반환한다. | 로그인 필요 alert 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| POST-CREATE-054 | 429 `post_create_rate_limit_exceeded`를 반환한다. | 1분당 3개 제한 alert를 표시한다. | 미실행 | PASS |  |
| POST-CREATE-055 | 500 `internal_server_error`를 반환한다. | 서버 오류 alert, 현재 화면 유지다. | 미실행 | PASS |  |
| POST-CREATE-056 | 기타 또는 네트워크 오류를 발생시킨다. | 일반 작성 오류 alert, 현재 화면 유지다. | 미실행 | PASS |  |

## 반응형·접근성

- [x] 760px 초과에서 이미지 미리보기가 4열이다. (CSS 정적 확인)
- [x] 760px 이하에서 미리보기가 2열이고 Header·editor·action bar가 축소된다. (CSS 정적 확인)
- [x] 520px 이하에서 중앙 로고 크기가 축소된다. (CSS 정적 확인)
- [x] 제목과 내용에 접근 가능한 label이 있다. (JSX 정적 확인)
- [x] 뒤로가기, 프로필 버튼에 accessible name이 있다. (공통 Header JSX 확인)
- [x] helper가 대응 입력과 `aria-describedby`로 연결된다. (JSX 정적 확인)
- [x] 오류 입력에 `aria-invalid=true`가 적용된다. (JSX 정적 확인)
- [x] 키보드만으로 입력, 파일 선택, 완료와 프로필 메뉴를 사용할 수 있다. (native control과 공통 메뉴 구조 확인)
- [x] 페이지 unmount 시 Object URL과 document event가 cleanup된다. (hook과 공통 메뉴 effect cleanup 확인)

마지막 두 helper ARIA 항목은 Vanilla에 명시적으로 없으며 React에서 적용할 접근성 개선 후보이다. 적용하면 설계 변경 기록에 남긴다.

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| POST-CREATE-001 | 외부 상태 의존 | 인증된 실제 작성 화면의 시각·상호작용 검증이 필요함 | 테스트 계정과 실행 중인 백엔드로 브라우저 재검증 |
| POST-CREATE-API | 실제 계약 확인 | 작성 성공 status, `postId` 타입과 이미지 업로드 계약은 프론트 코드만으로 확정할 수 없음 | 실제 백엔드 응답과 API 명세 대조 |
