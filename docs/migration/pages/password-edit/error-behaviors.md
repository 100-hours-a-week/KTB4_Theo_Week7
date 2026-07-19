# 비밀번호 수정 오류 상태별 UI 동작

## 1. 클라이언트 검증

| 조건 | API 요청 | UI 동작 |
|---|---|---|
| 새 비밀번호가 비어 있다 | PATCH 안 함 | 비밀번호 빈 값 helper |
| 새 비밀번호 형식이 틀리다 | PATCH 안 함 | 8~20자·조합 형식 helper |
| 확인 값이 비어 있다 | PATCH 안 함 | 확인 빈 값 helper |
| 두 값이 다르다 | PATCH 안 함 | `* 비밀번호 확인과 다릅니다.` |
| PATCH 요청 중 재제출한다 | 추가 요청 안 함 | 버튼 비활성화 유지 |

## 2. PATCH `/users/me/password` 오류

처리 전에 비밀번호와 확인의 기존 서버 helper를 모두 비운다.

| Status | message | UI 동작 | 입력 상태 | 이동 |
|---:|---|---|---|---|
| 400 | `blank_password` | `* 비밀번호를 입력해주세요.` | 유지 | 없음 |
| 400 | `invalid_password_format` | 8~20자·대소문자·숫자·특수문자 형식 helper | 유지 | 없음 |
| 400 | `password_mismatch` | `* 비밀번호 확인과 다릅니다.` | 유지 | 없음 |
| 401 | `unauthorized_request` | `로그인이 필요합니다.` alert | 페이지 이탈 | `/login` |
| 409 | `same_password` | `* 기존 비밀번호와 다른 비밀번호를 입력해주세요.` | 유지 | 없음 |
| 500 | `internal_server_error` | 서버 오류 alert | 유지 | 없음 |
| 기타·네트워크 오류 | 기타 | `비밀번호 수정 중 오류가 발생했습니다.` alert | 유지 | 없음 |

서버 오류 문구는 `서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`다.

## 3. 성공 후 자원 처리

- form reset: 비밀번호·확인·두 helper 초기화
- 버튼: 비활성화
- toast: 2초 표시
- 연속 성공: 이전 timer 취소 후 재시작
- unmount: timer cleanup

