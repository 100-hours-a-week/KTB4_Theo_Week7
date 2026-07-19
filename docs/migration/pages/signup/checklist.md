# 회원가입 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 브라우저 검증 |
| Vanilla URL |  |
| React URL | `http://localhost:5173/signup` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 브라우저/버전 | Codex In-app Browser |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## 화면과 이동

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| SIGNUP-001 | 회원가입 페이지에 진입한다. | 모든 필드, 프로필 영역, 버튼과 이동 링크가 표시된다. | 미실행 | PASS | `/signup` 직접 진입과 DOM 확인 |
| SIGNUP-002 | 최초 버튼 상태를 확인한다. | 회원가입 버튼이 비활성화되어 있다. | 미실행 | PASS | `disabled=true` 확인 |
| SIGNUP-003 | 뒤로가기 버튼을 선택한다. | 로그인 페이지로 이동한다. | 미실행 | PASS | `/login` 이동 확인 |
| SIGNUP-004 | 하단 로그인 링크를 선택한다. | 로그인 페이지로 이동한다. | 미실행 | PASS | `/login` 이동 확인 |
| SIGNUP-005 | 키보드로 폼을 탐색한다. | 이미지 입력과 모든 필드·버튼·링크에 논리적으로 접근한다. | 미실행 | PASS | label 연결과 DOM 순서 확인 |

## 프로필 이미지

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| SIGNUP-010 | 이미지 없이 프로필 영역을 선택한다. | 필수 helper가 표시되고 파일 선택 창이 열린다. | 미실행 | PASS | helper와 file chooser 확인 |
| SIGNUP-011 | 이미지 파일을 선택한다. | 원형 영역에 미리보기가 표시되고 helper가 사라진다. | 미실행 | PASS | blob 미리보기와 기본 아이콘 제거 확인 |
| SIGNUP-012 | 선택 이미지 영역을 다시 선택한다. | 이미지가 제거되고 기본 아이콘과 필수 helper가 표시된다. | 미실행 | PASS | 실제 클릭으로 확인 |
| SIGNUP-013 | 같은 파일을 제거 후 다시 선택한다. | change가 다시 처리되고 미리보기가 표시된다. | 미실행 | PASS | 동일 파일 재선택 후 blob 미리보기 확인 |
| SIGNUP-014 | 새 이미지로 교체한다. | 이전 Object URL이 해제되고 새 미리보기가 표시된다. | 미실행 | PASS | preview URL effect cleanup 코드 확인 |
| SIGNUP-015 | 페이지에서 이동한다. | 현재 Object URL이 cleanup된다. | 미실행 | PASS | effect unmount cleanup 코드 확인 |

## 이메일과 비밀번호

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| SIGNUP-020 | 이메일을 비운 채 blur한다. | 이메일 입력 helper가 표시된다. | 미실행 | PASS | 실제 blur 후 확인 |
| SIGNUP-021 | 잘못된 이메일 형식을 blur한다. | 이메일 형식 helper가 표시된다. | 미실행 | PASS | `user` 입력 후 확인 |
| SIGNUP-022 | 유효한 이메일을 blur한다. | 이메일 helper가 사라진다. | 미실행 | PASS | 유효 이메일로 교정 후 확인 |
| SIGNUP-023 | 비밀번호를 비운 채 blur한다. | 비밀번호와 비밀번호 확인의 빈 값 helper가 표시된다. | 미실행 | PASS | 두 helper 동시 갱신 확인 |
| SIGNUP-024 | 비밀번호 규칙 중 하나라도 누락한다. | 비밀번호 규칙 helper와 비활성 버튼이 표시된다. | 미실행 | PASS | 규칙 helper 및 순수 검증 함수 확인 |
| SIGNUP-025 | 비밀번호 확인을 비운 채 blur한다. | 비밀번호 확인 입력 helper가 표시된다. | 미실행 | PASS | 실제 blur 후 확인 |
| SIGNUP-026 | 비밀번호 확인이 일치하지 않는다. | 불일치 helper가 표시된다. | 미실행 | PASS | 서로 다른 유효 비밀번호로 확인 |
| SIGNUP-027 | 두 비밀번호를 일치시킨다. | 비밀번호 확인 helper가 사라진다. | 미실행 | PASS | 일치 값으로 교정 후 확인 |
| SIGNUP-028 | 확인 입력 후 원 비밀번호를 변경하고 blur한다. | 비밀번호 확인 helper가 다시 불일치로 갱신된다. | 미실행 | PASS | 원 비밀번호 blur 후 재검증 확인 |

## 닉네임과 버튼

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| SIGNUP-030 | 닉네임을 비운 채 blur한다. | 닉네임 입력 helper가 표시된다. | 미실행 | PASS | 실제 blur 후 확인 |
| SIGNUP-031 | 닉네임 내부에 공백을 넣는다. | 공백 제거 helper가 표시된다. | 미실행 | PASS | `nick name`으로 확인 |
| SIGNUP-032 | 닉네임을 11자 이상 입력한다. | 최대 10자 helper가 표시된다. | 미실행 | PASS | 11자 입력으로 확인 |
| SIGNUP-033 | 프로필 이미지 없이 나머지만 유효하게 입력한다. | 회원가입 버튼이 비활성화되어 있다. | 미실행 | PASS | 이미지 제거 시 즉시 비활성 확인 |
| SIGNUP-034 | 한 필드만 유효하지 않게 만든다. | 회원가입 버튼이 비활성화된다. | 미실행 | PASS | 파생 유효성 조건 확인 |
| SIGNUP-035 | 모든 필수 값을 유효하게 만든다. | 버튼이 활성화되고 `active` 클래스가 적용된다. | 미실행 | PASS | `disabled=false`, `signup-button active` 확인 |
| SIGNUP-036 | 버튼을 빠르게 여러 번 선택한다. | API 요청이 한 번만 처리된다. | 미실행 | PASS | `isSubmitting` 조기 반환과 요청 중 disabled 처리 확인 |
| SIGNUP-037 | 요청을 지연시킨다. | 요청 중 버튼이 비활성화된다. | 미실행 | BLOCKED | API 지연 또는 모킹 환경 필요 |

## API 요청과 성공

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| SIGNUP-040 | 유효한 폼을 제출한다. | `POST /users/signup` 요청이 전송된다. | 미실행 | BLOCKED | 실제 회원 데이터 생성을 수행하지 않음 |
| SIGNUP-041 | 요청 헤더를 확인한다. | JSON Content-Type이며 Authorization이 없다. | 미실행 | PASS | API client와 `userApi.signup` 정적 확인 |
| SIGNUP-042 | 요청 body를 확인한다. | 다섯 필드만 포함하고 이메일·닉네임은 trim된다. | 미실행 | PASS | SignupPage payload 구성 확인 |
| SIGNUP-043 | 이미지 필드를 확인한다. | binary가 아니라 선택한 파일명이 전송된다. | 미실행 | PASS | `profileFile.name` 및 JSON 요청 확인 |
| SIGNUP-044 | 회원가입에 성공한다. | 완료 alert가 표시된다. | 미실행 | BLOCKED | 전용 테스트 계정 정보 필요 |
| SIGNUP-045 | 완료 alert를 닫는다. | 로그인 페이지로 이동한다. | 미실행 | BLOCKED | 성공 응답 재현 필요 |

## API 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| SIGNUP-050 | 400 `invalid_request`를 반환한다. | 입력값 확인 alert가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| SIGNUP-051 | 400 `invalid_email_format`을 반환한다. | 이메일 형식 helper가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| SIGNUP-052 | 400 `invalid_password_format`을 반환한다. | 비밀번호 형식 helper가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| SIGNUP-053 | 400 `invalid_nickname_format`을 반환한다. | 닉네임 형식 helper가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| SIGNUP-054 | 409 `email_already_exist`를 반환한다. | 이메일 중복 helper가 표시된다. | 미실행 | BLOCKED | 중복 테스트 계정 또는 모킹 필요 |
| SIGNUP-055 | 409 `nickname_already_exist`를 반환한다. | 닉네임 중복 helper가 표시된다. | 미실행 | BLOCKED | 중복 테스트 계정 또는 모킹 필요 |
| SIGNUP-056 | 알 수 없는 409 message를 반환한다. | 사용 중인 정보 alert가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| SIGNUP-057 | 서버가 500을 반환한다. | 서버 오류 alert가 표시된다. | 미실행 | BLOCKED | 응답 모킹 필요 |
| SIGNUP-058 | 네트워크 오류가 발생한다. | 일반 회원가입 오류 alert가 표시된다. | 미실행 | BLOCKED | 공유 백엔드 중지 또는 요청 모킹 필요 |
| SIGNUP-059 | 실패 응답 후 확인한다. | 입력값과 선택 이미지가 유지되고 버튼이 복구된다. | 미실행 | BLOCKED | 안전하게 재현 가능한 실패 응답 필요 |

## 텍스트 UI 기준선

- [x] 최초 상태가 `UI-SIGNUP-01`과 일치한다.
- [x] 프로필 이미지 상태가 `UI-SIGNUP-02`, `UI-SIGNUP-03`과 일치한다.
- [x] 필드 검증 상태가 `UI-SIGNUP-04`부터 `UI-SIGNUP-07`까지와 일치한다.
- [ ] 서버 중복 오류가 `UI-SIGNUP-10`, `UI-SIGNUP-11`과 일치한다.
- [ ] 성공 결과가 `UI-SIGNUP-12`와 일치한다.

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| SIGNUP-037 | 확인 필요 | 서버 응답 지연 상태를 브라우저에서 재현하지 않음 | API 모킹 또는 throttling 환경에서 재검증 |
| SIGNUP-040, 044~045 | 외부 상태 의존 | 실제 회원 데이터 생성과 성공 응답이 필요함 | 전용 테스트 계정 규칙 확정 후 검증 |
| SIGNUP-050~059 | 확인 필요 | 서버 오류와 중복 조건을 안전하게 재현하지 않음 | API 모킹 테스트 도입 후 검증 |
