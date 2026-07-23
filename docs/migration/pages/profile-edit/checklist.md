# 회원정보 수정 Vanilla·React 비교 체크리스트

## 테스트 정보

| 항목 | 기록 |
|---|---|
| 테스트 날짜 | 2026-07-19 |
| 테스트 담당자 | Codex 코드·빌드 검증 |
| Vanilla URL | `pages/edit-profile.html` |
| React URL | `http://localhost:5173/profile/edit` |
| 백엔드 Base URL | `http://127.0.0.1:8080` |
| 테스트 계정 | 보안을 위해 식별 가능한 정보는 기록하지 않는다. |
| 브라우저/버전 | 정적 검증 단계로 브라우저 실증 미실행 |
| 관련 커밋 |  |

결과는 `PASS`, `FAIL`, `BLOCKED`, `N/A` 중 하나로 기록한다.

## Route, 초기 조회와 Header

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-001 | 인증 사용자가 `/profile/edit`에 진입한다. | 사용자 값이 채워진 form이 표시된다. | 미실행 | BLOCKED | 실제 테스트 계정으로 시각·상호작용 검증 필요 |
| PROFILE-EDIT-002 | 비인증 사용자가 진입한다. | 인증 초기화 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| PROFILE-EDIT-003 | 인증 초기화를 지연한다. | 완료 전 form 대신 코드 한입 테마 `LoadingView`가 표시된다. | 미실행 | PASS | CSS spinner와 로딩 문구 적용 |
| PROFILE-EDIT-004 | 초기 사용자 값을 표시한다. | email·nickname·profileImage가 일치한다. | 미실행 | PASS |  |
| PROFILE-EDIT-005 | 초기 상태를 확인한다. | 저장 버튼이 비활성화된다. | 미실행 | PASS |  |
| PROFILE-EDIT-006 | 로고와 프로필 메뉴를 사용한다. | 목록 이동과 공통 메뉴 동작이 일치한다. | 미실행 | PASS |  |
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
| PROFILE-EDIT-016 | 이메일을 확인한다. | text로 표시되고 수정할 수 없다. | 미실행 | PASS |  |

## 닉네임 검증과 변경 감지

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-020 | 닉네임을 비우거나 공백만 입력한다. | 빈 값 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PROFILE-EDIT-021 | 닉네임 중간에 공백을 넣는다. | 공백 helper와 비활성 버튼이 표시된다. | 미실행 | PASS |  |
| PROFILE-EDIT-022 | 닉네임 10자를 입력한다. | 유효한 경계값이다. | 미실행 | PASS |  |
| PROFILE-EDIT-023 | 닉네임 11자 입력을 시도한다. | maxlength와 검증이 최대 10자를 보장한다. | 미실행 | PASS |  |
| PROFILE-EDIT-024 | 닉네임만 유효하게 변경한다. | 저장 버튼이 활성화된다. | 미실행 | PASS |  |
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
| PROFILE-EDIT-034 | PATCH에 성공한다. | form 원본과 preview가 응답 값으로 갱신된다. | 미실행 | PASS |  |
| PROFILE-EDIT-035 | 성공 후 상태를 확인한다. | 새 변경이 없으므로 버튼이 비활성화된다. | 미실행 | PASS |  |
| PROFILE-EDIT-036 | PATCH에 실패한다. | 입력·선택 이미지 상태를 유지하고 버튼을 복구한다. | 미실행 | PASS |  |
| PROFILE-EDIT-037 | PATCH에 성공한다. | `수정완료` toast가 2초 표시된다. | 미실행 | PASS |  |
| PROFILE-EDIT-038 | 연속 성공 또는 unmount가 발생한다. | 이전 toast timer를 취소하거나 cleanup한다. | 미실행 | PASS |  |

## PATCH 오류

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-040 | 400 `blank_nickname`을 반환한다. | 빈 닉네임 helper를 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-041 | 400 `invalid_nickname_format`을 반환한다. | 형식 helper를 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-042 | 401 `unauthorized_request`를 반환한다. | alert 후 `/login`으로 이동한다. | 미실행 | PASS |  |
| PROFILE-EDIT-043 | 409 `same_nickname`을 반환한다. | 현재 닉네임과 같다는 helper를 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-044 | 409 `nickname_already_exist`를 반환한다. | 중복 닉네임 helper를 표시한다. | 미실행 | PASS |  |
| PROFILE-EDIT-045 | 500 `internal_server_error`를 반환한다. | 서버 오류 alert, 현재 화면 유지다. | 미실행 | PASS |  |
| PROFILE-EDIT-046 | 기타·네트워크 오류를 발생시킨다. | 일반 수정 오류 alert, 현재 화면 유지다. | 미실행 | PASS |  |

## 회원 탈퇴

| ID | 테스트 | 기대 결과 | Vanilla 결과 | React 결과 | 비고 |
|---|---|---|---|---|---|
| PROFILE-EDIT-050 | 회원 탈퇴 버튼을 선택한다. | modal이 열리고 확인 버튼에 focus한다. | 미실행 | PASS |  |
| PROFILE-EDIT-051 | 취소·backdrop·Escape를 사용한다. | 요청 중이 아니면 modal이 닫힌다. | 미실행 | PASS |  |
| PROFILE-EDIT-052 | 확인을 빠르게 여러 번 선택한다. | DELETE 요청은 한 번이다. | 미실행 | PASS |  |
| PROFILE-EDIT-053 | DELETE를 지연한다. | modal을 닫지 못하고 두 버튼이 비활성화된다. | 미실행 | PASS |  |
| PROFILE-EDIT-054 | DELETE에 성공한다. | 인증 상태를 지우고 `/login`으로 이동한다. | 미실행 | PASS |  |
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
| PROFILE-EDIT-001 | 외부 상태 의존 | 인증 계정의 실제 프로필 조회·수정·Header 동기화와 탈퇴 흐름 검증이 필요함 | 테스트 계정과 실행 중인 백엔드로 브라우저 재검증 |
| PROFILE-EDIT-API | 실제 계약 확인 | PATCH 응답 필드, 이미지 파일명 계약과 탈퇴 시 Refresh Token 만료는 프론트 코드만으로 확정할 수 없음 | 실제 백엔드 응답·쿠키와 API 명세 대조 |
