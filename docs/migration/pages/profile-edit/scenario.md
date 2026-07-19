# 회원정보 수정 정상 작동 시나리오

## 1. 기준 소스

- 화면: `pages/edit-profile.html`
- 페이지 동작: `js/edit-profile.js`
- Header 동작: `js/profile-menu.js`
- 닉네임 상수: `js/validation.js`
- 공통 요청·이미지 URL: `js/common.js`
- 스타일: `css/common.css`, `css/edit-profile.css`

## 2. 페이지 정보

- 기존 URL: `pages/edit-profile.html`
- React 예정 URL: `/profile/edit`
- 진입 대상: 로그인 사용자
- 로고 이동: `/posts`
- 수정 성공: 현재 페이지 유지
- 탈퇴 성공: `/login`

## 3. 화면 구성

1. 서비스 로고와 프로필 메뉴가 있는 Header
2. `회원정보 수정` 제목과 설명
3. GET 완료 전 숨겨진 수정 form
4. 프로필 이미지 선택·미리보기
5. 변경 불가능한 이메일 표시
6. 닉네임 input, helper와 안내 문구
7. `변경사항 저장` 버튼
8. 회원 탈퇴 panel과 확인 modal
9. 수정 성공 후 2초 동안 표시되는 `수정완료` toast

## 4. 초기 사용자 조회

1. 보호 Route가 인증을 초기화한다.
2. `GET /users/me` 중복 요청을 차단한다.
3. 요청 중에는 제목·설명만 보이고 form은 표시하지 않는다.
4. 성공하면 원본 닉네임과 프로필 이미지 snapshot을 저장한다.
5. 이메일, 닉네임과 프로필 이미지를 form에 채운다.
6. form을 표시하고 버튼 활성 조건을 계산한다.
7. 초기에는 변경 사항이 없으므로 저장 버튼은 비활성화한다.

React에서는 `ProtectedRoute` 초기화가 이미 `/users/me`를 호출해 `AuthContext.user`를 보유한다. 동일 화면에서 다시 GET하면 중복이므로 우선 Context 사용자 값을 초기 form 데이터로 사용한다. 값이 없을 때만 기존 `initializeAuth()` 결과를 기다리거나 조회한다. 이는 화면 데이터 원천을 Context로 통합하는 구조적 변경이며 구현 시 기록한다.

## 5. 프로필 이미지

### 기존 이미지

- 기존 경로가 있으면 `resolveImageUrl()`로 미리보기를 표시한다.
- 경로가 없으면 `<img>` src를 두지 않고 CSS 기본 프로필 아이콘을 표시한다.
- label 전체를 선택해 숨겨진 `accept="image/*"` file input을 연다.

### 새 이미지 선택

1. 이전 미리보기 Object URL을 반환한다.
2. 첫 번째 파일만 선택 상태로 저장한다.
3. `URL.createObjectURL(file)`을 미리보기로 표시한다.
4. 닉네임이 같아도 파일이 선택되면 저장 버튼을 활성화할 수 있다.

파일 선택을 비우면 새 파일과 Object URL을 제거하고 기존 프로필 이미지를 다시 표시한다. unmount 시 남은 URL을 반환한다.

현재 Vanilla에는 새 이미지 삭제 버튼, 이미지 fallback, 크기·형식·용량 오류가 없다.

## 6. 이메일

- 응답의 `email || ''`를 text로 표시한다.
- input이 아니므로 변경할 수 없다.
- `이메일은 변경할 수 없습니다.` 안내를 표시한다.
- PATCH payload에는 이메일을 포함하지 않는다.

## 7. 닉네임 검증과 변경 감지

### 검증

- trim 후 비어 있으면 `* 닉네임을 입력해주세요.`
- trim한 값에 ASCII 공백이 있으면 `* 띄어쓰기를 없애주세요.`
- trim 후 10자를 초과하면 `* 닉네임은 최대 10자까지 작성 가능합니다.`
- 유효하면 helper를 비운다.
- input 중에는 버튼 상태만 갱신하고 blur와 submit에서 helper를 갱신한다.

### 버튼 활성 조건

- trim 닉네임이 유효하다.
- trim 닉네임이 원본과 다르거나 새 이미지 파일이 있다.
- 사용자 조회·수정 요청 중이 아니다.

닉네임을 원본과 다르게 바꿨다가 다시 원본으로 돌리고 새 파일이 없으면 버튼은 다시 비활성화된다.

## 8. 회원정보 수정

1. submit 기본 동작을 막는다.
2. 요청 중이거나 닉네임 검증 실패이면 요청하지 않는다.
3. 새 파일이 있으면 `file.name`, 없으면 기존 프로필 이미지 경로를 사용한다.
4. trim 닉네임과 `profileImage`로 `PATCH /users/me`를 한 번 요청한다.
5. 성공 응답의 사용자 데이터로 원본 snapshot과 form을 갱신한다.
6. 새 파일·file input·Object URL을 초기화한다.
7. Header 프로필 이미지와 React 인증 사용자 상태를 같은 응답으로 동기화한다.
8. `수정완료` toast를 2초 표시한다.
9. 변경 사항이 다시 없어지므로 저장 버튼을 비활성화한다.

서버가 응답 필드를 누락하면 Vanilla는 닉네임은 현재 input, 이미지는 기존 값을 fallback으로 사용한다. React도 해당 fallback 정책을 보존한다.

## 9. 수정 완료 toast

- 성공 직후 `role="status"`인 `수정완료` 문구를 표시한다.
- 2초 뒤 숨긴다.
- 연속 성공이면 기존 timer를 취소하고 2초를 다시 계산한다.
- unmount에서 timer를 cleanup한다.

## 10. 회원 탈퇴 modal

1. `회원 탈퇴`를 선택하면 modal을 열고 확인 버튼에 focus한다.
2. 제목은 `회원탈퇴 하시겠습니까?`다.
3. 설명은 `작성된 게시글과 댓글은 삭제됩니다.`다.
4. 취소, backdrop 또는 Escape로 닫는다.
5. DELETE 요청 중에는 닫기를 차단하고 두 버튼을 비활성화한다.
6. 확인 연속 실행을 차단하고 `DELETE /users/me`를 한 번 요청한다.
7. 성공하면 인증 상태를 지우고 `/login`으로 이동한다.
8. 실패하면 alert를 표시하고 modal을 유지한 채 버튼을 복구한다.

React 공통 `ConfirmModal`은 초기 focus, backdrop, Escape, pending 차단과 trigger focus 복원을 이미 제공한다. 회원 탈퇴 문구와 profile 전용 style을 받을 수 있도록 최소한의 variant/class props가 필요하면 확장한다.

## 11. 공통 Header

- Context 사용자 프로필 이미지를 표시한다.
- 회원정보 PATCH 성공 시 Header 이미지가 즉시 변경된다.
- 프로필 메뉴의 비밀번호 수정과 로그아웃을 그대로 제공한다.
- 로그아웃 성공 시 `/login`으로 이동한다.

## 12. React에서 보존할 동작

- 인증 사용자 초기값과 GET 완료 전 form 미표시
- 변경 불가 이메일
- 닉네임 validation 문구·시점·변경 감지
- 기존 이미지 유지와 새 파일명 교체
- Object URL·toast timer·document event cleanup
- PATCH 성공 응답으로 form·Header·Context 동기화
- 2초 완료 toast
- 회원 탈퇴 modal과 pending 중 닫기·중복 요청 차단
- status/message별 helper, alert와 이동

