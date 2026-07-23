# 회원정보 수정 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-23 |
| 테스트 담당자 | Codex 정적·백엔드·React 브라우저 검증 |
| Vanilla URL | `pages/edit-profile.html` |
| React URL | `http://localhost:5173/profile/edit` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 테스트 계정 | H2 in-memory에 폐기용 계정을 생성하고 검증 후 탈퇴 처리 |
| 브라우저/버전 | Codex in-app Browser |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

### 검증 근거 구분

| 표기 | 의미 |
|---|---|
| `STATIC` | JSX·CSS·Hook·상태 분기를 코드로 확인 |
| `BACKEND-CODE` | 백엔드 Controller·DTO·Service·Entity 계약 확인 |
| `BACKEND-TEST` | `./gradlew test --rerun-tasks` 실행 |
| `LIVE-API` | 실행 중인 localhost 백엔드에 실제 HTTP 요청 |
| `E2E-REACT` | 실제 계정과 백엔드를 사용해 React 화면을 브라우저에서 조작 |
| `E2E-VANILLA` | Vanilla 화면을 브라우저에서 조작 |
| `MOCK` | 지연·500·네트워크 단절을 모의 응답으로 검증 |

코드 판독만으로 확인한 항목은 실행 검증 PASS와 구분한다.

### 실행 전 분류와 환경 계획

| 범위 | ID | 검증 방법 | 선행 환경 |
|---|---|---|---|
| 공통 Route·초기 조회 | 001~009 | E2E-REACT, MOCK | 백엔드·React 서버, 폐기용 계정, `/users/me` 지연·오류 모의 장치 |
| 이미지·이메일 | 010~016 | STATIC 후 E2E-REACT·E2E-VANILLA | 프로필 이미지가 있는 계정과 이미지가 없는 계정, 테스트 이미지 2개 |
| 닉네임 클라이언트 검증 | 020~027 | STATIC 후 E2E-REACT·E2E-VANILLA | 로그인 계정 |
| 수정 성공·pending·toast | 030~038 | LIVE-API, E2E-REACT·E2E-VANILLA | 수정 후 원복 가능한 폐기용 계정, 요청 지연 모의 장치 |
| PATCH 오류 | 040~046 | LIVE-API, MOCK, E2E-REACT·E2E-VANILLA | 중복 닉네임 계정, 401·500·네트워크 오류 모의 장치 |
| 탈퇴 | 050~056 | BACKEND-TEST, LIVE-API, E2E-REACT·E2E-VANILLA | 탈퇴 전용 폐기 계정, 요청 지연·오류 모의 장치 |
| 반응형·접근성 | 하단 점검표 | STATIC 후 viewport별 브라우저 확인 | 760px·520px viewport |

백엔드는 H2 in-memory DB를 사용하고 고정 seed가 없다. 실행 검증 때 `/users/signup`으로 용도별 폐기 계정을 만들고, 각 시나리오가 끝나면 DELETE `/users/me`로 정리한다. 서버를 재시작하면 DB 전체가 초기화된다. 실제 500과 지연은 정상 endpoint에서 만들 수 없으므로 MOCK 결과와 LIVE-API 결과를 구분한다.

## Route, 초기 조회와 Header

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-001 | 인증 사용자가 `/profile/edit`에 진입한다. | 사용자 값이 채워진 form이 표시된다. | 미실행 | PASS | E2E-REACT |
| PROFILE-EDIT-002 | 비인증 사용자가 진입한다. | 인증 초기화 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| PROFILE-EDIT-003 | 인증 초기화를 지연한다. | 완료 전 form 대신 코드 한입 테마 `LoadingView`가 표시된다. | 미실행 | PASS | E2E-REACT, 직접 URL 진입 시 로딩 상태 관찰 |
| PROFILE-EDIT-004 | 초기 사용자 값을 표시한다. | email·nickname·profileImage가 일치한다. | 미실행 | PASS | E2E-REACT |
| PROFILE-EDIT-005 | 초기 상태를 확인한다. | 저장 버튼이 비활성화된다. | 미실행 | PASS | E2E-REACT |
| PROFILE-EDIT-006 | 로고와 프로필 메뉴를 사용한다. | 목록 이동과 공통 메뉴 동작이 일치한다. | 미실행 | PASS | E2E-REACT·STATIC |
| PROFILE-EDIT-007 | 수정에 성공한다. | Header와 Context 사용자도 즉시 갱신된다. | 미실행 | PASS |  |
| PROFILE-EDIT-008 | 초기 사용자 조회가 500·기타·네트워크 오류로 실패한다. | 로그인 이동이나 빈 Outlet 대신 오류 문구와 재시도 버튼이 표시된다. | 미실행 | PASS | Access Token 유지 |
| PROFILE-EDIT-009 | 초기 사용자 조회 실패 후 재시도한다. | 요청 중 버튼이 비활성화되고 성공 시 form, 재실패 시 오류 화면이 표시된다. | 미실행 | PASS | 401 재시도 실패 시 `/login` |

## 프로필 이미지와 이메일

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-010 | 기존 이미지가 있다. | 서버 이미지 URL로 미리보기를 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-011 | 기존 이미지가 없다. | CSS 기본 프로필 아이콘을 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-012 | 새 이미지 하나를 선택한다. | Object URL 미리보기와 활성 버튼이 표시된다. | 미실행 | PASS |  |
| PROFILE-EDIT-013 | 다른 이미지로 변경한다. | 이전 Object URL을 반환하고 새 이미지만 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-014 | 파일 선택을 비운다. | 기존 이미지로 복원되고 변경 여부를 재계산한다. | 미실행 | PASS |  |
| PROFILE-EDIT-015 | 이미지 선택 후 페이지를 떠난다. | Object URL을 반환한다. | 미실행 | PASS |  |
| PROFILE-EDIT-016 | 이메일을 확인한다. | text로 표시되고 수정할 수 없다. | 미실행 | PASS | E2E-REACT |

## 닉네임 검증과 변경 감지

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-020 | 닉네임을 비우거나 공백만 입력한다. | 빈 값 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PROFILE-EDIT-021 | 닉네임 중간에 공백을 넣는다. | 공백 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PROFILE-EDIT-022 | 닉네임 10자를 입력한다. | 유효한 경계값이다. | 미실행 | PASS |  |
| PROFILE-EDIT-023 | 닉네임 11자 입력을 시도한다. | maxlength와 검증이 최대 10자를 보장한다. | 미실행 | PASS |  |
| PROFILE-EDIT-024 | 닉네임만 유효하게 변경한다. | 저장 버튼이 활성화된다. | 미실행 | PASS | E2E-REACT |
| PROFILE-EDIT-025 | 닉네임을 원본으로 되돌린다. | 새 이미지가 없으면 버튼이 비활성화된다. | 미실행 | PASS |  |
| PROFILE-EDIT-026 | 유효하지 않은 폼을 강제 submit한다. | helper를 표시하고 PATCH하지 않는다. | 미실행 | PASS |  |
| PROFILE-EDIT-027 | 앞뒤 공백이 있는 닉네임을 제출한다. | trim한 값을 PATCH한다. | 미실행 | PASS |  |

## 회원정보 수정

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-030 | 이미지 없이 닉네임만 수정한다. | 기존 profileImage를 PATCH한다. | 미실행 | PASS |  |
| PROFILE-EDIT-031 | 새 이미지와 함께 수정한다. | File.name을 profileImage로 PATCH한다. | 미실행 | PASS | 임시 계약 |
| PROFILE-EDIT-032 | 저장 버튼을 빠르게 여러 번 선택한다. | PATCH 요청은 한 번이다. | 미실행 | PASS |  |
| PROFILE-EDIT-033 | PATCH를 지연한다. | 저장 버튼이 비활성화되고 문구는 유지된다. | 미실행 | PASS |  |
| PROFILE-EDIT-034 | PATCH에 성공한다. | form 원본과 preview가 응답 값으로 갱신된다. | 미실행 | PASS | E2E-REACT·LIVE-API |
| PROFILE-EDIT-035 | 성공 후 상태를 확인한다. | 새 변경이 없으므로 버튼이 비활성화된다. | 미실행 | PASS | E2E-REACT |
| PROFILE-EDIT-036 | PATCH에 실패한다. | 입력·선택 이미지 상태를 유지하고 버튼을 복구한다. | 미실행 | PASS |  |
| PROFILE-EDIT-037 | PATCH에 성공한다. | `수정완료` toast가 2초 표시된다. | 미실행 | PASS | E2E-REACT에서 toast 표시 관찰, timer는 STATIC |
| PROFILE-EDIT-038 | 연속 성공 또는 unmount가 발생한다. | 이전 toast timer를 취소하거나 cleanup한다. | 미실행 | PASS |  |

## PATCH 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-040 | 400 `blank_nickname`을 반환한다. | 빈 닉네임 helper를 표시한다. | 미실행 | PASS | LIVE-API·STATIC |
| PROFILE-EDIT-041 | 400 `invalid_nickname_format`을 반환한다. | 형식 helper를 표시한다. | 미실행 | PASS | LIVE-API·STATIC |
| PROFILE-EDIT-042 | 401 `unauthorized_request`를 반환한다. | alert 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| PROFILE-EDIT-043 | 409 `same_nickname`을 반환한다. | 현재 닉네임과 같다는 helper를 표시한다. | 미실행 | PASS | LIVE-API·BACKEND-TEST·STATIC |
| PROFILE-EDIT-044 | 409 `nickname_already_exist`를 반환한다. | 중복 닉네임 helper를 표시한다. | 미실행 | PASS | LIVE-API·STATIC |
| PROFILE-EDIT-045 | 500 `internal_server_error`를 반환한다. | 서버 오류 alert, 현재 화면 유지다. | 미실행 | PASS |  |
| PROFILE-EDIT-046 | 기타·네트워크 오류를 발생시킨다. | 일반 수정 오류 alert, 현재 화면 유지다. | 미실행 | PASS |  |

## 회원 탈퇴

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-050 | 회원 탈퇴 버튼을 선택한다. | modal이 열리고 확인 버튼에 focus한다. | 미실행 | PASS | E2E-REACT |
| PROFILE-EDIT-051 | 취소·backdrop·Escape를 사용한다. | 요청 중이 아니면 modal이 닫힌다. | 미실행 | PASS | E2E-REACT에서 Escape 확인, 취소·backdrop은 STATIC |
| PROFILE-EDIT-052 | 확인을 빠르게 여러 번 선택한다. | DELETE 요청은 한 번이다. | 미실행 | PASS |  |
| PROFILE-EDIT-053 | DELETE를 지연한다. | modal을 닫지 못하고 두 버튼이 비활성화된다. | 미실행 | PASS |  |
| PROFILE-EDIT-054 | DELETE에 성공한다. | 인증 상태를 지우고 `/login`으로 이동한다. | 미실행 | PASS | E2E-REACT·LIVE-API |
| PROFILE-EDIT-055 | DELETE 401을 반환한다. | 로그인 필요 alert 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| PROFILE-EDIT-056 | DELETE 500 또는 일반 오류를 반환한다. | 오류 alert, modal 유지와 버튼 복구다. | 미실행 | PASS |  |

## 반응형·접근성

- [x] 760px 이하에서 Header·card·프로필 이미지·modal이 축소된다. (CSS 정적 확인)
- [x] 520px 이하에서 로고가 축소된다. (CSS 정적 확인)
- [x] 프로필 선택 label이 file input에 연결된다. (JSX 정적 확인)
- [x] 닉네임 label·helper와 오류 상태가 입력에 연결된다. (JSX 정적 확인)
- [x] 이메일이 입력 control로 노출되지 않는다. (JSX 정적 확인)
- [x] toast가 `role=status`로 전달된다. (JSX 정적 확인)
- [x] modal의 name·초기 focus·Escape·backdrop이 동작한다. (공통 ConfirmModal 확인)
- [x] modal 종료 후 trigger focus가 복원된다. (공통 ConfirmModal effect 확인)
- [x] Object URL, toast timer와 document event가 unmount에서 cleanup된다. (hook·Page·공통 menu/modal effect 확인)

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| PROFILE-EDIT-001 | 실행 검증 완료 | 폐기용 계정으로 조회·수정·toast·탈퇴 후 로그인 이동을 확인함 | E2E-REACT 결과를 해당 체크리스트 행에 반영 |
| PROFILE-EDIT-API | 백엔드 계약 확인 완료 | PATCH 응답 필드, 이미지 문자열 계약, 탈퇴 비식별화와 Refresh Token 무효화를 확인함 | `api-specification.md`와 `error-behaviors.md`에 근거별 결과 기록 |
| PROFILE-EDIT-CONTRACT-001 | 문서·백엔드 불일치 | 탈퇴 modal은 게시글·댓글 삭제를 안내하지만 백엔드는 사용자를 비식별화하고 연관 데이터는 유지함 | 제품 정책을 확정한 뒤 UI 문구 또는 백엔드 처리 수정 |
| PROFILE-EDIT-CONTRACT-002 | PATCH 응답 계약 | PATCH 응답에는 email이 없고 nickname·profileImage만 포함됨 | 프론트 fallback 유지, API 명세를 실제 응답에 맞게 기록 |
| PROFILE-EDIT-CONTRACT-003 | 탈퇴 쿠키 | Refresh Token DB 레코드는 폐기되지만 DELETE 응답이 쿠키를 만료시키지 않음 | 보안·UX 정책에 따라 DELETE 응답에도 만료 Set-Cookie 적용 검토 |
| PROFILE-EDIT-VANILLA | 실행 검증 미완료 | Vanilla 로그인 실행 중 alert가 발생해 비교 시나리오를 완료하지 못함 | alert 원인 확인 후 E2E-VANILLA 재실행 |
