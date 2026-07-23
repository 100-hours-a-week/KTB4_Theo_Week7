# 회원가입 API 명세

이 문서는 백엔드 전체 계약이 아니라 현재 회원가입 화면이 실제 사용하는 API 계약을 기록한다.

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 회원 | `POST` | `/users/signup` | 회원가입 |

## POST `/users/signup`

### 요청 정책

| 항목 | 값 |
|---|---|
| Base URL | `http://127.0.0.1:8080` |
| Content-Type | `application/json` |
| 쿠키 정책 | `credentials: "include"` |
| Authorization | 포함하지 않음 |
| 401 자동 재발급·재시도 | 사용하지 않음 |

### Request body

```json
{
  "email": "user@example.com",
  "password": "Password1!",
  "passwordConfirm": "Password1!",
  "nickname": "nickname",
  "profileImage": "profile.png"
}
```

| 필드 | 타입 | 필수 | 프론트엔드 처리 |
|---|---|---:|---|
| `email` | string | 예 | 앞뒤 공백 제거 |
| `password` | string | 예 | 입력값 그대로 전달 |
| `passwordConfirm` | string | 예 | 입력값 그대로 전달 |
| `nickname` | string | 예 | 앞뒤 공백 제거 |
| `profileImage` | string | 현재 UI에서 예 | 선택한 `File.name` 전달 |

### 이미지 계약 주의사항

현재 요청은 `multipart/form-data`가 아니다. 이미지 binary를 서버에 업로드하지 않고 로컬 파일명만 JSON 문자열로 전달한다.

React 1차 마이그레이션에서는 동작 동등성을 위해 이 계약을 유지한다. 실제 파일 업로드 API가 추가되면 별도 설계 변경으로 기록하고 요청 형식을 변경한다.

### 성공 응답

현재 프론트엔드는 성공 응답 body의 필드를 사용하지 않는다. HTTP 성공 여부만 확인한 뒤 완료 alert와 로그인 이동을 실행한다.

### 실패 응답에서 사용하는 필드

```json
{
  "message": "email_already_exist",
  "data": null
}
```

| 필드 | 용도 |
|---|---|
| HTTP status | 400, 409, 500 및 기타 오류 분기 |
| `message` | 필드별 세부 오류 분기 |
| `data` | 공통 오류 객체에는 포함되지만 회원가입 화면에서는 사용하지 않음 |

세부 UI 동작은 `error-behaviors.md`에서 관리한다.

## 실제 백엔드 확인 항목

- [x] 성공 응답 status와 body 확인
  - LIVE-API 2026-07-23: 201 `signup_success`, `data`는 생성된 사용자 ID
- [x] `profileImage`에 파일명만 보내는 계약이 백엔드 의도와 일치하는지 확인
  - BACKEND-CODE·LIVE-API: `SignupRequest.profileImage` 문자열을 `User.profileImage` 문자열 컬럼에 그대로 저장
- [x] 400 message 목록 확인
  - LIVE-API: `invalid_request`, `invalid_email_format`, `invalid_password_format`, `invalid_nickname_format`
  - BACKEND-CODE: 비밀번호 확인 불일치는 400 `password_mismatch`
- [x] 이메일·닉네임 중복 시 409 message 확인
  - LIVE-API: `email_already_exist`, `nickname_already_exist`
- [x] 회원가입 요청에도 Refresh Token 쿠키가 불필요한지 확인
  - BACKEND-CODE·LIVE-API: 회원가입 응답에는 `Set-Cookie`가 없으며 토큰은 로그인에서만 발급

### 검증 환경과 근거

| 항목 | 값 |
|---|---|
| 검증일 | 2026-07-23 |
| BACKEND-TEST | `UserServiceTest` 21건 재실행 성공 |
| LIVE-API | localhost:8080에 폐기용 계정 생성, 201·400·409 응답 확인 |
| E2E-REACT | 이미지와 유효한 폼 제출, 성공 alert와 `/login` 이동, 중복 helper 확인 |
