# 게시글 목록 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 브라우저·코드 검증 |
| Vanilla URL |  |
| React URL | `http://localhost:5173/posts` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 브라우저/버전 | Codex In-app Browser |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## 화면과 인증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-LIST-001 | 인증 사용자가 목록에 진입한다. | Header, 피드 제목, 작성 링크와 목록 영역이 표시된다. | 미실행 | BLOCKED | 실제 테스트 계정 또는 인증 쿠키 필요 |
| POST-LIST-002 | Access Token 없이 Refresh Token 쿠키로 진입한다. | 토큰을 재발급한 뒤 목록을 조회한다. | 미실행 | BLOCKED | 유효한 Refresh Token 쿠키 필요 |
| POST-LIST-003 | 유효한 인증 수단 없이 진입한다. | 로그인 페이지로 이동한다. | 미실행 | PASS | `/posts` 직접 진입 후 `/login` 이동 확인 |
| POST-LIST-004 | Header 로고를 선택한다. | 현재 게시글 목록 Route로 이동한다. | 미실행 | BLOCKED | 인증된 화면 접근 필요 |
| POST-LIST-005 | 게시글 작성 링크를 선택한다. | 게시글 작성 Route로 이동한다. | 미실행 | BLOCKED | 인증 필요, 작성 Route도 아직 미구현 |

## 최초 목록 조회

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-LIST-010 | 목록에 처음 진입한다. | `GET /posts?size=10`을 한 번 요청한다. | 미실행 | PASS | 최초 요청 ref와 `createPostListUrl` 정적 확인 |
| POST-LIST-011 | 최초 요청을 지연한다. | 별도 로딩 UI 없이 중복 요청을 막는다. | 미실행 | PASS | 요청 Promise ref와 초기 로딩 상태 확인 |
| POST-LIST-012 | 정상 응답을 받는다. | 응답 순서대로 카드가 표시된다. | 미실행 | BLOCKED | 인증된 정상 목록 응답 필요 |
| POST-LIST-013 | 빈 `posts`를 받는다. | 오류 없이 빈 카드 영역을 유지한다. | 미실행 | PASS | 빈 배열 state와 별도 Empty UI 미렌더링 확인 |
| POST-LIST-014 | `posts`가 배열이 아닌 응답을 처리한다. | 카드를 추가하지 않는다. | 미실행 | PASS | `Array.isArray` 방어 로직 확인 |

## 카드 표시

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-LIST-020 | 일반 게시글을 표시한다. | 제목, 수치, 날짜와 작성자가 표시된다. | 미실행 | PASS | `PostCard` JSX와 formatter 연결 확인 |
| POST-LIST-021 | 26자를 초과한 제목을 표시한다. | 데이터는 26자까지만 표시되고 최대 두 줄로 보인다. | 미실행 | PASS | formatter 결과 26자 및 CSS line clamp 확인 |
| POST-LIST-022 | 수정된 게시글을 표시한다. | 제목 옆에 `수정됨` 배지가 표시된다. | 미실행 | PASS | `edited` 조건부 렌더링 확인 |
| POST-LIST-023 | 숨김 게시글을 받는다. | 해당 카드가 표시되지 않는다. | 미실행 | PASS | `PostList`의 `blinded` 필터 확인 |
| POST-LIST-024 | 1,000 이상 수치를 표시한다. | 내림한 `{n}k` 형식으로 표시한다. | 미실행 | PASS | 1000→1k, 1999→1k 실행 확인 |
| POST-LIST-025 | 유효하지 않은 수치를 표시한다. | `0`으로 표시한다. | 미실행 | PASS | 숫자 변환 fallback 확인 |
| POST-LIST-026 | 작성일을 표시한다. | `YYYY.MM.DD` 형식으로 표시한다. | 미실행 | PASS | formatter 실행 결과 확인 |
| POST-LIST-027 | 탈퇴한 작성자를 표시한다. | 닉네임이 `알 수 없음`으로 표시된다. | 미실행 | PASS | formatter 실행 결과 확인 |
| POST-LIST-028 | 프로필 경로가 없는 작성자를 표시한다. | 기본 프로필 이미지가 표시된다. | 미실행 | PASS | `ProfileImage` fallback 조건 확인 |
| POST-LIST-029 | 작성자 이미지 로드가 실패한다. | 기본 프로필 이미지로 교체된다. | 미실행 | PASS | image `onError` 처리 확인 |
| POST-LIST-030 | 게시글 카드를 선택한다. | 해당 `postId`의 상세 Route로 이동한다. | 미실행 | BLOCKED | 카드 Link는 구현됐으나 상세 Route 미구현 |
| POST-LIST-031 | 빈 목록 영역을 선택한다. | 페이지 이동이 발생하지 않는다. | 미실행 | PASS | 카드 외 영역에 이동 handler 없음 |

## 무한 스크롤

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-LIST-040 | sentinel이 viewport 아래 200px 안에 들어온다. | 다음 페이지를 미리 요청한다. | 미실행 | PASS | observer `rootMargin`과 교차 조건 확인 |
| POST-LIST-041 | 다음 페이지를 요청한다. | 이전 응답의 `lastPostId`와 `size=10`을 전달한다. | 미실행 | PASS | cursor ref와 API URL 생성 확인 |
| POST-LIST-042 | 추가 응답을 받는다. | 기존 카드 뒤에 새 카드를 추가한다. | 미실행 | PASS | functional state append 확인 |
| POST-LIST-043 | 요청 중 sentinel이 반복 교차한다. | 같은 커서 요청을 한 번만 보낸다. | 미실행 | PASS | 진행 Promise 재사용 확인 |
| POST-LIST-044 | 짧은 목록에서 sentinel이 계속 보인다. | 다음 페이지가 있으면 관찰을 갱신하여 이어서 조회한다. | 미실행 | PASS | `refreshKey=posts.length` 확인 |
| POST-LIST-045 | `hasNext=false`를 받는다. | 이후 추가 요청을 보내지 않는다. | 미실행 | PASS | 페이지와 Hook 양쪽 종료 조건 확인 |
| POST-LIST-046 | 추가 조회가 실패한다. | 기존 카드와 커서를 유지하고 요청 잠금을 해제한다. | 미실행 | PASS | catch에서 목록·커서 미변경, finally 잠금 해제 확인 |
| POST-LIST-047 | React Strict Mode에서 진입한다. | 최초 데이터가 중복 누적되지 않는다. | N/A | PASS | 최초 요청 ref와 Promise ref 확인 |

## 프로필 메뉴와 로그아웃

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-LIST-050 | 사용자 프로필 이미지가 존재한다. | Header에 서버 이미지가 표시된다. | 미실행 | BLOCKED | 인증 사용자 응답 필요 |
| POST-LIST-051 | 사용자 프로필 이미지가 없거나 로드 실패한다. | 기본 프로필 이미지가 표시된다. | 미실행 | BLOCKED | 인증 화면에서 실제 이미지 상태 확인 필요 |
| POST-LIST-052 | 프로필 버튼을 선택한다. | 메뉴가 열리고 `aria-expanded=true`가 된다. | 미실행 | PASS | controlled toggle과 ARIA 속성 확인 |
| POST-LIST-053 | 열린 메뉴 밖을 선택한다. | 메뉴가 닫힌다. | 미실행 | PASS | container 외부 document click 처리 확인 |
| POST-LIST-054 | 열린 메뉴에서 Escape를 누른다. | 메뉴가 닫히고 프로필 버튼으로 포커스가 돌아간다. | 미실행 | PASS | keydown cleanup과 trigger focus 확인 |
| POST-LIST-055 | 회원정보 수정 링크를 선택한다. | 프로필 수정 Route로 이동한다. | 미실행 | BLOCKED | 링크는 구현됐으나 프로필 수정 Route 미구현 |
| POST-LIST-056 | 비밀번호 수정 링크를 선택한다. | 비밀번호 수정 Route로 이동한다. | 미실행 | BLOCKED | 링크는 구현됐으나 비밀번호 수정 Route 미구현 |
| POST-LIST-057 | 로그아웃을 빠르게 여러 번 선택한다. | 로그아웃 요청을 한 번만 보낸다. | 미실행 | PASS | AuthContext logout Promise ref 확인 |
| POST-LIST-058 | 로그아웃에 성공한다. | 토큰을 제거하고 로그인 페이지로 이동한다. | 미실행 | BLOCKED | 인증 세션에서 실제 logout 응답 필요 |
| POST-LIST-059 | 로그아웃에 실패한다. | 오류 alert 후 현재 화면과 인증 상태를 유지한다. | 미실행 | PASS | 성공 전에는 `clearAuth`를 호출하지 않는 흐름 확인 |

## 오류 처리

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| POST-LIST-060 | 400 `invalid_request`를 반환한다. | 요청값 확인 alert를 표시한다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| POST-LIST-061 | 401 `unauthorized_request`를 반환한다. | 로그인 필요 alert 후 로그인으로 이동한다. | 미실행 | BLOCKED | 인증된 목록 요청의 응답 모킹 필요 |
| POST-LIST-062 | 500 `internal_server_error`를 반환한다. | 서버 오류 alert를 표시한다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| POST-LIST-063 | 알 수 없는 상태나 message를 반환한다. | 일반 목록 오류 alert를 표시한다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| POST-LIST-064 | 네트워크 오류가 발생한다. | 일반 목록 오류 alert를 표시하고 기존 카드를 유지한다. | 미실행 | BLOCKED | 인증된 화면의 네트워크 차단 재현 필요 |

## 반응형 UI 기준선

- [x] 1240px 초과에서 카드가 4열이다. (CSS 정적 확인)
- [x] 1240px 이하에서 카드가 3열이다. (CSS 정적 확인)
- [x] 760px 이하에서 카드가 2열이고 인사말과 작성 버튼 배치가 변경된다. (CSS 정적 확인)
- [x] 520px 이하에서 카드가 1열이고 메타 정보가 자연스럽게 줄바꿈된다. (CSS 정적 확인)
- [x] 카드 hover, Header, 프로필 메뉴가 텍스트 UI 기준선과 일치한다. 

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| POST-LIST-001~002, 004~005 | 인증 의존 | 유효한 테스트 계정 또는 Refresh Token 쿠키가 없어 인증 화면을 열 수 없음 | 테스트 계정으로 브라우저 재검증 | -> 검증 완료
| POST-LIST-012, 050~051, 058 | 외부 상태 의존 | 실제 목록·사용자·로그아웃 성공 응답 필요 | 전용 테스트 데이터로 검증 |
| POST-LIST-030, 055~056 | 후속 페이지 미구현 | 링크는 생성됐지만 도착 Route의 페이지가 아직 없음 | 상세·회원 관리 마이그레이션 후 재검증 |
| POST-LIST-060~064 | 오류 재현 필요 | status/message별 오류를 안전하게 만들 수 없음 | API 모킹 환경에서 재검증 |
