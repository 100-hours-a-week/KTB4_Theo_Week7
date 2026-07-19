# 로그인 API 명세

이 문서는 백엔드 전체 계약이 아니라 현재 로그인 화면 코드가 실제로 사용하는 요청 및 응답 필드를 기록한 마이그레이션 기준선이다.

## 공통 요청 규칙

- API Base URL: `http://127.0.0.1:8080`
- 요청 헤더: `Content-Type: application/json`
- 쿠키 정책: `credentials: "include"`
- 오류 응답은 HTTP 상태 코드와 응답의 `message`, `data` 필드로 변환된다.
- 응답 body가 비어 있으면 `null`로 처리한다.

React 마이그레이션에서는 Base URL을 환경변수로 옮길 예정이며, 현재 개발 환경 값은 위 주소를 사용한다.

## 로그인

### 요청

| 항목 | 값 |
|---|---|
| Method | `POST` |
| Endpoint | `/auth/login` |
| 인증 헤더 | 포함하지 않음 |
| 쿠키 | 포함 |
| 401 자동 재시도 | 사용하지 않음 |

```json
{
  "email": "user@example.com",
  "password": "Password1!"
}
```

### Request 필드

| 필드 | 타입 | 필수 | 프론트엔드 처리 |
|---|---|---:|---|
| `email` | string | 예 | 앞뒤 공백 제거 후 전송 |
| `password` | string | 예 | 입력값을 그대로 전송 |

### 성공 응답에서 사용하는 필드

현재 프론트엔드는 아래 필드만 사용한다.

```json
{
  "data": {
    "accessToken": "access-token"
  }
}
```

| 필드 | 타입 | 필수 | 용도 |
|---|---|---:|---|
| `data.accessToken` | string | 예 | 메모리의 Access Token으로 저장 |

성공 후 `pages/posts.html`로 이동한다.

### 실패 응답에서 사용하는 필드

```json
{
  "message": "invalid_credentials",
  "data": null
}
```

| 필드 | 용도 |
|---|---|
| HTTP status | 오류 처리 분기 |
| `message` | 세부 오류 처리 분기 |
| `data` | 공통 오류 객체에 포함되지만 로그인 화면에서는 사용하지 않음 |

상태와 메시지별 UI 동작은 `error-behaviors.md`에서 관리한다.

## 로그인 이후 인증 연계

로그인 요청 자체는 토큰 재발급을 사용하지 않는다. 로그인 성공 후 보호 API의 기본 흐름은 다음과 같다.

1. 메모리에 Access Token이 있으면 `Authorization: Bearer {token}`을 추가한다.
2. 페이지 이동 등으로 Access Token이 없으면 `POST /auth/reissue`를 먼저 호출한다.
3. 보호 API에서 401을 받으면 토큰을 재발급하고 원 요청을 한 번 재시도한다.
4. 동시 요청이 401을 받아도 공유된 `reissuePromise`를 사용해 재발급 요청을 한 번만 보낸다.

이 흐름은 로그인 화면의 성공 이후 동작과 연결되므로 React의 API client와 인증 Context 설계에서 보존해야 한다.

## 구현 확인 항목

- [ ] 실제 성공 응답이 `data.accessToken` 구조인지 확인
- [ ] 로그인 응답에서 Refresh Token 쿠키가 설정되는지 브라우저에서 확인
- [ ] 쿠키의 Path, SameSite, Secure 속성 확인
- [ ] 아래 문서에 기록된 status/message 조합이 실제 백엔드 응답과 일치하는지 확인
- [ ] Base URL의 개발·운영 환경 값을 확정
