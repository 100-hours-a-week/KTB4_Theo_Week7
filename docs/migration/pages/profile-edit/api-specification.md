# 회원정보 수정 API 명세

## API 요약

| 도메인 명 | Method | Endpoint | 사용 화면 |
|---|---|---|---|
| 회원 | `GET` | `/users/me` | 현재 이메일·닉네임·프로필 초기값 |
| 회원 | `PATCH` | `/users/me` | 닉네임·프로필 이미지 수정 |
| 회원 | `DELETE` | `/users/me` | 회원 탈퇴 |
| 인증 | `POST` | `/auth/reissue` | Access Token 복구 |
| 인증 | `POST` | `/auth/logout` | Header 로그아웃 |

모든 회원 API는 `credentials: "include"`, Bearer Access Token과 401 재발급·1회 재시도 정책을 사용한다. PATCH body는 JSON이다.

## GET `/users/me`

```json
{
  "data": {
    "email": "user@example.com",
    "nickname": "개발한입",
    "profileImage": "profile.png"
  }
}
```

| 필드 | 용도 |
|---|---|
| `email` | 변경 불가 text 표시 |
| `nickname` | 원본 snapshot과 input 초기값 |
| `profileImage` | 원본 snapshot, 미리보기와 Header |

React에서는 보호 Route가 이미 조회한 `AuthContext.user`를 초기값으로 재사용해 같은 API의 페이지 중복 호출을 피한다.

## PATCH `/users/me`

### 기존 이미지 유지

```json
{
  "nickname": "새닉네임",
  "profileImage": "profile.png"
}
```

### 새 이미지 선택

```json
{
  "nickname": "새닉네임",
  "profileImage": "new-profile.png"
}
```

| 필드 | 타입 | 필수 | 프론트엔드 조건 |
|---|---|---:|---|
| `nickname` | string | O | trim 후 1~10자, ASCII 공백 금지 |
| `profileImage` | string | O | 새 파일의 `name` 또는 기존 경로, 없으면 빈 문자열 |

이름과 달리 현재 `profileImage`는 파일 데이터가 아닌 문자열이다. 실제 업로드 계약을 확인하기 전 multipart로 변경하지 않는다.

### 프론트엔드 사용 성공 응답

```json
{
  "data": {
    "email": "user@example.com",
    "nickname": "새닉네임",
    "profileImage": "new-profile.png"
  }
}
```

응답 사용자로 form 원본과 `AuthContext.user`를 갱신한다. `nickname` 누락 시 제출 닉네임, `profileImage` 누락 시 기존 이미지를 fallback으로 사용한다.

## DELETE `/users/me`

- request body 없음
- 성공 응답 body는 사용하지 않음
- 성공 후 Access Token과 React 사용자 상태를 초기화하고 `/login` 이동

Refresh Token 쿠키를 서버가 함께 만료시키는지 확인이 필요하다. DELETE 성공 후 프론트 메모리 인증 상태는 반드시 제거한다.

## 실제 백엔드 확인 항목

- [x] GET/PATCH/DELETE 성공 status와 응답 body 확인
  - 2026-07-23 LIVE-API: GET 200 `get_user_success`, PATCH 200 `user_update_success`, DELETE 200 `user_delete_success`
- [x] PATCH 응답에 email·nickname·profileImage가 항상 포함되는지 확인
  - BACKEND-CODE·LIVE-API: PATCH 응답은 `nickname`, `profileImage`만 포함하며 `email`은 포함하지 않는다.
- [x] `profileImage` 빈 문자열의 의미 확인
  - BACKEND-CODE: 별도 정규화 없이 nullable 문자열 컬럼에 그대로 저장한다. `null`과 빈 문자열을 서버에서 같은 값으로 변환하지 않는다.
- [x] 이미지 파일명 문자열이 임시 계약인지 확인
  - BACKEND-CODE: 현재 `UserUpdateRequest.profileImage`는 문자열이며 `User.profileImage` 문자열 컬럼에 저장하는 실제 계약이다.
- [x] 실제 이미지 업로드 endpoint·multipart 계약 확인
  - BACKEND-CODE: 사용자 프로필 이미지 업로드 endpoint와 multipart 처리는 구현되어 있지 않다. `/images/**`는 정적 파일 조회만 허용한다.
- [x] 닉네임 공백 정의와 Unicode 길이 계산 방식 확인
  - BACKEND-CODE: `@Size(max = 10)`과 Java `String.length()` 기준이며 UTF-16 code unit으로 계산한다. 공백은 별도 Unicode 옵션이 없는 `^\S+$` 정규식으로 검사한다.
- [x] `same_nickname`이 이미지 변경과 함께 전송되어도 발생하는지 확인
  - BACKEND-TEST·LIVE-API: 이미지 값이 달라도 닉네임이 현재 값과 같으면 먼저 409 `same_nickname`을 반환하고 이미지는 변경하지 않는다.
- [x] 탈퇴 시 게시글·댓글 삭제 또는 비식별화 정책 확인
  - BACKEND-CODE·BACKEND-TEST: 사용자를 hard delete하지 않고 email·password·nickname·profileImage를 비식별화한다. 게시글·댓글의 사용자 FK는 유지되므로 관련 데이터는 삭제되지 않는다.
- [x] 탈퇴 시 Refresh Token 쿠키 만료 여부 확인
  - BACKEND-CODE·LIVE-API: DB의 해당 사용자 Refresh Token은 모두 폐기되어 재발급이 401이 되지만, DELETE `/users/me` 응답에는 만료 `Set-Cookie`가 없어 브라우저 쿠키 자체는 남는다.

### 검증 환경과 근거

| 항목 | 값 |
|---|---|
| 검증일 | 2026-07-23 |
| 백엔드 | `/Users/kimminjae_fs/Desktop/springbootProjects/community-api` |
| 데이터베이스 | H2 in-memory `jdbc:h2:mem:testdb` |
| BACKEND-TEST | `./gradlew test --rerun-tasks`, 전체 36건 성공 |
| LIVE-API | `http://localhost:8080`에 폐기용 계정을 생성해 GET/PATCH/DELETE 후 탈퇴 처리 |

`BACKEND-CODE`는 Controller·DTO·Service·Entity를 읽어 확인한 결과, `BACKEND-TEST`는 자동 테스트 실행 결과, `LIVE-API`는 실제 실행 중인 백엔드 응답 확인 결과다.
