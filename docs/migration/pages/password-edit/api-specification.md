# 비밀번호 수정 API 명세

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 회원 | `PATCH` | `/users/me/password` | 로그인 사용자의 비밀번호 수정 |
| 회원 | `GET` | `/users/me` | 보호 Route와 Header 현재 사용자 |
| 인증 | `POST` | `/auth/reissue` | Access Token 복구 |
| 인증 | `POST` | `/auth/logout` | Header 로그아웃 |

PATCH는 JSON, `credentials: "include"`, Bearer Access Token과 401 재발급·1회 재시도 정책을 사용한다.

## PATCH `/users/me/password`

### Request body

```json
{
  "password": "NewPassword1!",
  "passwordConfirm": "NewPassword1!"
}
```

| 필드 | 타입 | 필수 | 프론트엔드 조건 |
|---|---|---:|---|
| `password` | string | O | 8~20자, 대·소문자·숫자·특수문자 각각 1개 이상 |
| `passwordConfirm` | string | O | `password`와 정확히 일치 |

두 값은 trim하지 않고 그대로 전송한다. 현재 비밀번호는 request에 포함하지 않는다.

### 성공 처리

- 성공 응답 body는 사용하지 않는다.
- 입력과 helper를 초기화한다.
- `수정완료` toast를 표시한다.
- Access Token, Refresh Token과 React 사용자 상태는 유지한다.

## 실제 백엔드 확인 항목

- [ ] PATCH 성공 status와 응답 body 확인
- [ ] 현재 비밀번호 없이 변경할 수 있는 정책이 의도된 것인지 확인
- [ ] 비밀번호 정규식의 프론트·서버 일치 확인
- [ ] 허용되는 특수문자 목록 확인
- [ ] 공백·Unicode 문자의 허용 여부 확인
- [ ] `same_password` 비교 기준 확인
- [ ] 변경 성공 후 기존 Access Token·Refresh Token 유지 또는 폐기 정책 확인
- [ ] 다른 세션을 무효화하는지 확인
- [ ] 비밀번호 변경 rate limit 존재 여부 확인

