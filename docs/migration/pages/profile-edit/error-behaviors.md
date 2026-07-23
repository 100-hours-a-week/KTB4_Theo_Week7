# 회원정보 수정 오류 상태별 UI 동작

## 1. 클라이언트 검증

| 조건 | API 요청 | UI 동작 |
|---|---|---|
| 닉네임이 비어 있거나 공백뿐이다 | PATCH 안 함 | `* 닉네임을 입력해주세요.` helper |
| trim 닉네임에 ASCII 공백이 있다 | PATCH 안 함 | `* 띄어쓰기를 없애주세요.` helper |
| 닉네임이 10자를 초과한다 | PATCH 안 함 | 최대 10자 helper |
| 닉네임·이미지가 원본과 같다 | PATCH 안 함 | 저장 버튼 비활성화 |
| 사용자 조회·수정 중 재실행한다 | 추가 요청 안 함 | 저장 버튼 비활성화 유지 |
| 탈퇴 요청 중 닫기·재확인한다 | 추가 동작 안 함 | modal과 disabled 버튼 유지 |

## 2. GET `/users/me` 오류

| Status | message | UI 동작 | 이동 |
|---:|---|---|---|
| 조회 중 | 해당 없음 | 코드 한입 테마 로딩 문구와 CSS spinner, form 숨김 | 없음 |
| 401 | `unauthorized_request` | 인증 상태 제거, form 숨김 | `/login` |
| 기타·500·네트워크 오류 | 기타 | 공통 오류 문구와 `다시 시도하기` 버튼, form 숨김 | 없음 |
| 비401 오류 후 재시도 중 | 기타 | 오류 카드 유지, 버튼 비활성화와 `다시 불러오는 중...` 표시 | 없음 |
| 비401 오류 후 재시도 성공 | 해당 없음 | 오류 카드를 닫고 사용자 값이 채워진 form 표시 | 없음 |

Vanilla GET 오류는 500 전용 문구를 구분하지 않는다. React도 비401 오류 문구를 세분화하지 않지만 alert 대신 복구 가능한 공통 오류 화면을 제공한다. Access Token은 유지하되 `user`가 없는 Outlet은 렌더링하지 않는다.

## 3. PATCH `/users/me` 오류

처리 전에 기존 서버 nickname helper를 비운다.

| Status | message | UI 동작 | 입력 상태 | 이동 |
|---:|---|---|---|---|
| 400 | `blank_nickname` | `* 닉네임을 입력해주세요.` | 유지 | 없음 |
| 400 | `invalid_nickname_format` | `* 닉네임은 띄어쓰기 없이 최대 10자까지 작성 가능합니다.` | 유지 | 없음 |
| 401 | `unauthorized_request` | 로그인 필요 alert | 페이지 이탈 | `/login` |
| 409 | `same_nickname` | `* 현재 사용 중인 닉네임과 같습니다.` | 유지 | 없음 |
| 409 | `nickname_already_exist` | `* 중복된 닉네임입니다.` | 유지 | 없음 |
| 500 | `internal_server_error` | 서버 오류 alert | 유지 | 없음 |
| 기타·네트워크 오류 | 기타 | `회원정보 수정 중 오류가 발생했습니다.` alert | 유지 | 없음 |

서버 오류 문구는 `서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`다. 이동하지 않으면 pending을 해제하고 변경 여부에 따라 버튼을 복구한다.

## 4. DELETE `/users/me` 오류

| Status | message | UI 동작 | modal | 이동 |
|---:|---|---|---|---|
| 401 | `unauthorized_request` | 로그인 필요 alert | 페이지 이탈 | `/login` |
| 500 | `internal_server_error` | 서버 오류 alert | 유지 | 없음 |
| 기타·네트워크 오류 | 기타 | `회원 탈퇴 중 오류가 발생했습니다.` alert | 유지 | 없음 |

실패 후 modal은 열린 상태를 유지하고 취소·확인 버튼을 다시 활성화한다.

## 5. 이미지·toast 자원 오류

- 기존 프로필 경로 없음: CSS 기본 프로필 아이콘 표시
- 기존 또는 새 미리보기 로드 실패: Vanilla에는 별도 helper/fallback 없음
- 파일 형식·크기·용량: 별도 프론트 검증 없음
- Object URL 생성 실패: 별도 처리 없음
- unmount: Object URL과 toast timer를 반드시 cleanup

## 6. 실제 백엔드 확인 기록

| 검증 항목 | 기대 status·message | 실제 결과 | 근거 | 결과 |
|---|---|---|---|---|
| GET `/users/me` 성공 | 200 `get_user_success` | email·nickname·profileImage 반환 | LIVE-API 2026-07-23 | PASS |
| PATCH 성공 | 200 `user_update_success` | nickname·profileImage 반환, email 없음 | LIVE-API 2026-07-23 | PASS, 명세 보정 |
| 빈 닉네임 | 400 `blank_nickname` | 기대와 일치 | LIVE-API 2026-07-23 | PASS |
| 공백 포함 닉네임 | 400 `invalid_nickname_format` | 기대와 일치 | LIVE-API 2026-07-23 | PASS |
| 현재 닉네임과 동일 | 409 `same_nickname` | 이미지가 달라도 기대 오류 반환 | LIVE-API·BACKEND-TEST | PASS |
| 다른 사용자의 닉네임 | 409 `nickname_already_exist` | 기대와 일치 | LIVE-API 2026-07-23 | PASS |
| 인증 토큰 없음·오류 | 401 계열 | Security filter가 `access_token_required`·`access_token_expired`·`invalid_access_token`을 구분 | BACKEND-CODE | PASS (CODE) |
| 예상하지 못한 서버 오류 | 500 `internal_server_error` | 전역 예외 처리 계약 확인, 강제 실행 장치 없음 | BACKEND-CODE | PASS (CODE), LIVE 미실행 |
| DELETE 성공 | 200 `user_delete_success` | 사용자 비식별화와 Refresh Token DB 폐기 | LIVE-API·BACKEND-TEST | PASS |
| 탈퇴 후 토큰 재발급 | 401 `invalid_refresh_token` | 기대와 일치 | LIVE-API 2026-07-23 | PASS |
| 탈퇴 응답의 쿠키 만료 | 만료 `Set-Cookie` 필요 여부 확인 | DELETE 응답에 `Set-Cookie` 없음 | LIVE-API·BACKEND-CODE | 확인 완료, 정책 검토 필요 |

실제 500과 네트워크 단절은 정상 백엔드만으로 재현하지 않았다. 프론트의 화면 분기는 모의 응답으로 검증하고, 이 표의 LIVE 결과와 혼합하지 않는다.
