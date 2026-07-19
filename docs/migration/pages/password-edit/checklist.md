# 비밀번호 수정 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 코드·빌드 검증 |
| Vanilla URL | `pages/edit-password.html` |
| React URL | `http://localhost:5173/password/edit` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 테스트 계정 | 보안을 위해 식별 가능한 정보는 기록하지 않는다. |
| 브라우저/버전 | 정적 검증 단계로 브라우저 실증 미실행 |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## Route와 Header

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PASSWORD-EDIT-001 | 인증 사용자가 `/password/edit`에 진입한다. | 빈 수정 form과 Header가 표시된다. | 미실행 | BLOCKED | 실제 테스트 계정으로 시각·상호작용 검증 필요 |
| PASSWORD-EDIT-002 | 비인증 사용자가 진입한다. | 인증 초기화 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| PASSWORD-EDIT-003 | 초기 화면을 확인한다. | 별도 GET 없이 두 input이 비고 버튼이 비활성화된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-004 | 로고와 프로필 메뉴를 사용한다. | 목록 이동과 공통 메뉴 동작이 일치한다. | 미실행 | PASS |  |

## 새 비밀번호 검증

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PASSWORD-EDIT-010 | 새 비밀번호를 비우고 blur한다. | 빈 값 helper가 표시된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-011 | 7자 비밀번호를 입력한다. | 형식 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-012 | 8자이며 모든 조합을 만족한다. | 유효한 최소 경계값이다. | 미실행 | PASS |  |
| PASSWORD-EDIT-013 | 20자이며 모든 조합을 만족한다. | 유효한 최대 경계값이다. | 미실행 | PASS |  |
| PASSWORD-EDIT-014 | 21자 비밀번호를 입력한다. | 형식 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-015 | 대문자·소문자·숫자·특수문자 하나를 각각 누락한다. | 각 경우 모두 형식 오류다. | 미실행 | PASS |  |
| PASSWORD-EDIT-016 | 비밀번호를 변경한 뒤 blur한다. | 확인 값이 있으면 확인 일치 helper도 갱신된다. | 미실행 | PASS |  |

## 비밀번호 확인과 버튼

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PASSWORD-EDIT-020 | 확인 값을 비우고 blur한다. | 확인 빈 값 helper가 표시된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-021 | 두 값이 다르다. | 확인 불일치 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-022 | 두 값이 정확히 같다. | 수정 버튼이 활성화된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-023 | 새 비밀번호가 틀린 상태로 강제 submit한다. | 비밀번호 helper를 표시하고 PATCH하지 않는다. | 미실행 | PASS |  |
| PASSWORD-EDIT-024 | 확인만 틀린 상태로 강제 submit한다. | 확인 helper를 표시하고 PATCH하지 않는다. | 미실행 | PASS |  |

## 비밀번호 수정

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PASSWORD-EDIT-030 | 유효한 두 값을 제출한다. | 두 문자열을 그대로 PATCH한다. | 미실행 | PASS |  |
| PASSWORD-EDIT-031 | 수정 버튼을 빠르게 여러 번 선택한다. | PATCH 요청은 한 번이다. | 미실행 | PASS | Promise ref 정적 확인 |
| PASSWORD-EDIT-032 | PATCH를 지연한다. | 버튼이 비활성화되고 문구는 유지된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-033 | PATCH에 성공한다. | 현재 Route·인증을 유지하고 form을 비운다. | 미실행 | PASS |  |
| PASSWORD-EDIT-034 | 성공 후 상태를 확인한다. | 두 helper가 비고 버튼이 비활성화된다. | 미실행 | PASS | form key 초기화 확인 |
| PASSWORD-EDIT-035 | PATCH에 실패한다. | 두 입력을 유지하고 버튼을 복구한다. | 미실행 | PASS |  |
| PASSWORD-EDIT-036 | PATCH에 성공한다. | `수정완료` toast가 2초 표시된다. | 미실행 | PASS |  |
| PASSWORD-EDIT-037 | 연속 성공 또는 unmount가 발생한다. | 이전 timer를 취소하거나 cleanup한다. | 미실행 | PASS |  |

## API 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PASSWORD-EDIT-040 | 400 `blank_password`를 반환한다. | 빈 비밀번호 helper를 표시한다. | 미실행 | PASS | 오류 분기 정적 확인 |
| PASSWORD-EDIT-041 | 400 `invalid_password_format`을 반환한다. | 형식 helper를 표시한다. | 미실행 | PASS | 오류 분기 정적 확인 |
| PASSWORD-EDIT-042 | 400 `password_mismatch`를 반환한다. | 확인 불일치 helper를 표시한다. | 미실행 | PASS | 오류 분기 정적 확인 |
| PASSWORD-EDIT-043 | 401 `unauthorized_request`를 반환한다. | alert 후 `/login`으로 이동한다. | 미실행 | PASS | 오류 분기 정적 확인 |
| PASSWORD-EDIT-044 | 409 `same_password`를 반환한다. | 기존과 다른 비밀번호 helper를 표시한다. | 미실행 | PASS | 오류 분기 정적 확인 |
| PASSWORD-EDIT-045 | 500 `internal_server_error`를 반환한다. | 서버 오류 alert, 현재 화면 유지다. | 미실행 | PASS | 오류 분기 정적 확인 |
| PASSWORD-EDIT-046 | 기타·네트워크 오류를 발생시킨다. | 일반 수정 오류 alert, 현재 화면 유지다. | 미실행 | PASS | 오류 분기 정적 확인 |

## 반응형·접근성

- [x] 760px 이하에서 Header·main·card가 축소된다. (CSS 정적 확인)
- [x] 520px 이하에서 로고가 축소된다. (CSS 정적 확인)
- [x] 두 label·guide·helper가 대응 input에 연결된다. (JSX 정적 확인)
- [x] 오류 입력에 `aria-invalid=true`가 적용된다. (공통 FormField 확인)
- [x] 두 input의 `autocomplete`이 `new-password`다. (JSX 정적 확인)
- [x] toast가 `role=status`로 전달된다. (공통 StatusToast 확인)
- [x] 키보드만으로 폼과 프로필 메뉴를 사용할 수 있다. (native control·공통 ProfileMenu 확인)
- [x] toast timer와 공통 document event가 unmount에서 cleanup된다. (Page·공통 ProfileMenu effect 확인)

## 테스트 중 발견 사항

| ID | 구분 | 내용 | 후속 작업 |
|---|---|---|---|
| PASSWORD-EDIT-001 | 외부 상태 의존 | 인증 계정의 실제 화면 진입과 PATCH 성공 흐름은 정적 검사만으로 실증할 수 없음 | 테스트 계정과 실행 중인 백엔드로 브라우저 재검증 |
| PASSWORD-EDIT-API | 실제 계약 확인 | PATCH 응답 status/message와 Refresh Token 유지 여부는 프론트 코드만으로 확정할 수 없음 | 실제 백엔드 응답·쿠키와 API 명세 대조 |
