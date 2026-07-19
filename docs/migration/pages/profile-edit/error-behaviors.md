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
| 401 | `unauthorized_request` | `로그인이 필요합니다.` alert, form 숨김 | `/login` |
| 기타·500·네트워크 오류 | 기타 | `회원정보를 불러오는 중 오류가 발생했습니다.` alert, form 숨김 | 없음 |

Vanilla GET 오류는 500 전용 문구를 구분하지 않는다.

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

