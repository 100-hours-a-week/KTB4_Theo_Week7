# 로그인 마이그레이션 전 수동 테스트 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 브라우저 검증 |
| 프론트엔드 실행 URL | `http://localhost:5173/login` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 브라우저/버전 | Codex In-app Browser |
| 테스트 계정 | 보안을 위해 이메일 전체나 비밀번호를 문서에 기록하지 않는다. |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## 최초 화면과 이동

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| LOGIN-001 | 로그인 페이지에 진입한다. | 로고, 설명, 이메일·비밀번호 필드, 로그인 버튼, 회원가입 링크가 표시된다. | 미실행 | PASS | DOM과 표시 문구 확인 |
| LOGIN-002 | 최초 화면의 로그인 버튼을 확인한다. | 버튼이 비활성화되어 있다. | 미실행 | PASS | `disabled=true` 확인 |
| LOGIN-003 | 회원가입 링크를 선택한다. | 회원가입 페이지로 이동한다. | 미실행 | BLOCKED | `/signup` URL 이동은 확인했으나 회원가입 Route 미구현 |
| LOGIN-004 | 키보드 Tab으로 폼을 탐색한다. | 이메일, 비밀번호, 버튼, 회원가입 링크에 논리적인 순서로 접근할 수 있다. | 미실행 | PASS | DOM 순서와 label 연결 확인 |

## 이메일 검증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| LOGIN-010 | 이메일을 비운 채 blur한다. | 이메일 입력 안내 helper가 표시된다. | 미실행 | PASS | 실제 blur 후 문구 확인 |
| LOGIN-011 | `user`를 입력하고 blur한다. | 이메일 형식 오류 helper가 표시된다. | 미실행 | PASS | 실제 blur 후 문구와 `aria-invalid=true` 확인 |
| LOGIN-012 | `user@example.com`을 입력하고 blur한다. | 이메일 helper가 사라진다. | 미실행 | PASS | helper 제거와 `aria-invalid=false` 확인 |
| LOGIN-013 | 이메일 앞뒤에 공백을 넣고 유효한 비밀번호와 제출한다. | 이메일의 앞뒤 공백이 제거되어 요청된다. | 미실행 | PASS | 제출 body 구성 시 `email.trim()` 적용 확인 |
| LOGIN-014 | 이메일 중간에 공백을 포함한다. | 이메일이 유효하지 않아 버튼이 비활성화된다. | 미실행 | PASS | 이메일 정규식 및 파생 버튼 상태 확인 |

## 비밀번호 검증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| LOGIN-020 | 비밀번호를 비운 채 blur한다. | 비밀번호 입력 안내 helper가 표시된다. | 미실행 | PASS | 실제 blur 후 문구 확인 |
| LOGIN-021 | 7자 이하 비밀번호를 입력하고 blur한다. | 비밀번호 규칙 helper가 표시된다. | 미실행 | PASS | 규칙 helper와 버튼 비활성 확인 |
| LOGIN-022 | 21자 이상 비밀번호를 입력하고 blur한다. | 비밀번호 규칙 helper가 표시된다. | 미실행 | PASS | 규칙 helper와 버튼 비활성 확인 |
| LOGIN-023 | 대문자가 없는 비밀번호를 입력한다. | 로그인 버튼이 비활성화되고 blur 시 규칙 helper가 표시된다. | 미실행 | PASS | 버튼 비활성 및 공통 규칙 helper 확인 |
| LOGIN-024 | 소문자가 없는 비밀번호를 입력한다. | 로그인 버튼이 비활성화되고 blur 시 규칙 helper가 표시된다. | 미실행 | PASS | 버튼 비활성 및 공통 규칙 helper 확인 |
| LOGIN-025 | 숫자가 없는 비밀번호를 입력한다. | 로그인 버튼이 비활성화되고 blur 시 규칙 helper가 표시된다. | 미실행 | PASS | 버튼 비활성 및 공통 규칙 helper 확인 |
| LOGIN-026 | 특수문자가 없는 비밀번호를 입력한다. | 로그인 버튼이 비활성화되고 blur 시 규칙 helper가 표시된다. | 미실행 | PASS | 버튼 비활성 및 공통 규칙 helper 확인 |
| LOGIN-027 | 모든 규칙을 만족하는 비밀번호를 입력한다. | 비밀번호 helper가 사라진다. | 미실행 | PASS | `Password1!` 입력으로 확인 |

## 버튼과 제출

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| LOGIN-030 | 이메일만 유효하게 입력한다. | 로그인 버튼이 비활성화되어 있다. | 미실행 | PASS | 파생 상태 확인 |
| LOGIN-031 | 비밀번호만 유효하게 입력한다. | 로그인 버튼이 비활성화되어 있다. | 미실행 | PASS | 파생 상태 확인 |
| LOGIN-032 | 두 입력값을 모두 유효하게 입력한다. | 로그인 버튼이 활성화되고 `active` 스타일이 적용된다. | 미실행 | PASS | `disabled=false`, `primary-button active` 확인 |
| LOGIN-033 | 유효한 상태에서 Enter를 누른다. | 로그인 요청이 전송된다. | 미실행 | PASS | form `onSubmit` 연결 및 실제 POST 응답 처리 확인 |
| LOGIN-034 | 로그인 버튼을 빠르게 여러 번 선택한다. | 로그인 요청은 한 번만 처리된다. | 미실행 | PASS | `isSubmitting` 조기 반환과 요청 중 disabled 처리 확인 |
| LOGIN-035 | 요청을 지연시킨 상태를 확인한다. | 처리 중 버튼이 비활성화된다. | 미실행 | BLOCKED | 현재 서버 응답이 빨라 pending 상태를 브라우저에서 관찰하지 못함 |

## API 성공과 인증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| LOGIN-040 | 올바른 계정으로 로그인한다. | `POST /auth/login` 요청이 전송된다. | 미실행 | BLOCKED | 실제 테스트 계정이 필요함 |
| LOGIN-041 | 로그인 요청 헤더를 확인한다. | `Content-Type: application/json`이며 Authorization 헤더가 없다. | 미실행 | PASS | API client와 로그인 요청 옵션 정적 확인 |
| LOGIN-042 | 로그인 요청 옵션을 확인한다. | 쿠키가 포함될 수 있는 credentials 정책으로 요청된다. | 미실행 | PASS | `credentials: 'include'` 정적 확인 |
| LOGIN-043 | 로그인 요청 body를 확인한다. | `email`, `password`만 포함된다. | 미실행 | PASS | `authApi.login(credentials)` 호출 경계 확인 |
| LOGIN-044 | 로그인 성공 응답을 확인한다. | `data.accessToken`이 존재한다. | 미실행 | BLOCKED | 실제 로그인 성공 응답이 필요함 |
| LOGIN-045 | 로그인에 성공한다. | 게시글 목록 페이지로 이동한다. | 미실행 | BLOCKED | 실제 테스트 계정과 `/posts` Route가 필요함 |
| LOGIN-046 | 로그인 성공 후 보호 API를 확인한다. | 인증된 상태로 게시글 목록을 불러온다. | 미실행 | BLOCKED | 게시글 목록 및 ProtectedRoute 미구현 |

## API 실패

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| LOGIN-050 | 존재하지 않는 계정 또는 잘못된 비밀번호로 로그인한다. | 비밀번호 아래에 아이디 또는 비밀번호 확인 helper가 표시된다. | 미실행 | PASS | 합성 계정으로 실제 401 `invalid_credentials` 확인 |
| LOGIN-051 | 서버가 400 `invalid_request`를 반환한다. | 입력값 확인 alert가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| LOGIN-052 | 서버가 400 `invalid_email_format`을 반환한다. | 이메일 형식 helper가 표시된다. | 미실행 | BLOCKED | 클라이언트 검증을 통과하며 해당 응답을 만드는 서버 조건 또는 모킹 필요 |
| LOGIN-053 | 로그인 제한을 발생시킨다. | 잠시 후 재시도하라는 alert가 표시된다. | 미실행 | BLOCKED | 의도적인 rate limit 발생을 수행하지 않음 |
| LOGIN-054 | 서버가 500을 반환한다. | 서버 오류 alert가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| LOGIN-055 | 백엔드 서버를 중지한 상태에서 제출한다. | 일반 로그인 오류 alert가 표시된다. | 미실행 | BLOCKED | 공유 백엔드 서버를 중지하지 않음 |
| LOGIN-056 | 실패 응답 후 입력값을 확인한다. | 이메일과 비밀번호 입력값이 유지된다. | 미실행 | PASS | 실제 401 후 두 입력값 유지 확인 |
| LOGIN-057 | 실패 요청이 종료된 뒤 확인한다. | 유효한 값이 유지되면 로그인 버튼이 다시 활성화된다. | 미실행 | PASS | 실제 401 후 `disabled=false` 확인 |

## 텍스트 UI 기준선

화면 캡처는 필수 완료 조건이 아니다. 화면의 구조, 문구, 입력값, helper, 버튼 상태, alert 및 이동 결과는 `ui-baseline.md`와 비교한다.

- [x] 최초 진입 상태가 `UI-LOGIN-01`과 일치한다.
- [x] 클라이언트 검증 상태가 `UI-LOGIN-02`부터 `UI-LOGIN-05`까지와 일치한다.
- [ ] 유효한 폼과 요청 중 상태가 `UI-LOGIN-06`, `UI-LOGIN-07`과 일치한다.
- [ ] API 오류 상태가 `UI-LOGIN-08`부터 `UI-LOGIN-13`까지와 일치한다.
- [ ] 성공 결과가 `UI-LOGIN-14`와 일치한다.

## 선택적 캡처 체크리스트

레이아웃이나 스타일 차이를 시각적으로 비교할 필요가 있을 때만 캡처한다. 파일은 같은 디렉터리의 `screenshots/`에 저장하며 개인정보, 비밀번호, Access Token, 쿠키 값이 보이지 않도록 주의한다.

| 파일명 | 촬영 상태 | 완료 |
|---|---|---:|
| `01-initial.png` | 로그인 페이지 최초 진입, 버튼 비활성 | 선택 |
| `02-email-validation-error.png` | 잘못된 이메일 형식 helper 표시 | 선택 |
| `03-password-validation-error.png` | 비밀번호 규칙 helper 표시 | 선택 |
| `04-valid-form.png` | 두 입력값 유효, 버튼 활성 | 선택 |
| `05-invalid-credentials.png` | 인증 실패 helper 표시 | 선택 |
| `06-server-error.png` | 서버 오류 alert 표시 | 선택 |
| `07-request-pending.png` | 요청 처리 중 버튼 비활성 | 선택 |

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| LOGIN-003 | 미구현 의존성 | 링크는 `/signup`으로 이동하지만 회원가입 Route가 없어 빈 화면이 표시됨 | 회원가입 마이그레이션에서 Route 구현 |
| LOGIN-035 | 확인 필요 | 서버 응답이 빨라 요청 중 화면 상태를 브라우저에서 관찰하지 못함 | 네트워크 지연 또는 API 모킹 환경에서 재검증 |
| LOGIN-040~046 | 미구현 의존성 | 로그인 성공 및 보호 API 흐름은 실제 테스트 계정과 게시글 Route가 필요함 | 게시글 목록 기반 구현 후 재검증 |
| LOGIN-051~055 | 확인 필요 | 특정 서버 오류는 안전하게 재현하기 어려움 | API 모킹 테스트 도입 후 검증 |
