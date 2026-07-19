# 비밀번호 수정 정상 작동 시나리오

## 1. 기준 소스

- 화면: `pages/edit-password.html`
- 페이지 동작: `js/edit-password.js`
- Header 동작: `js/profile-menu.js`
- 비밀번호 검증: `js/validation.js`
- 공통 요청: `js/common.js`
- 스타일: `css/common.css`, `css/edit-password.css`

## 2. 페이지 정보

- 기존 URL: `pages/edit-password.html`
- React 예정 URL: `/password/edit`
- 진입 대상: 로그인 사용자
- 로고 이동: `/posts`
- 수정 성공: 현재 페이지 유지

## 3. 화면 구성

1. 서비스 로고와 프로필 메뉴가 있는 Header
2. `비밀번호 수정` 제목과 설명
3. 새 비밀번호 input과 형식 안내
4. 비밀번호 확인 input과 일치 안내
5. 각 필드 helper 영역
6. `수정하기` 버튼
7. 성공 후 화면 하단의 `수정완료` toast

## 4. 초기 진입

1. 보호 Route가 현재 사용자 인증을 초기화한다.
2. 인증 성공 시 빈 비밀번호 수정 form을 표시한다.
3. 두 값이 비어 있으므로 수정 버튼은 비활성화한다.
4. Header는 `AuthContext.user`의 프로필을 표시한다.

이 페이지는 별도 초기 데이터 GET이 필요하지 않다.

## 5. 비밀번호 검증

### 새 비밀번호

- 비어 있으면 `* 비밀번호를 입력해주세요.`를 표시한다.
- 8~20자여야 한다.
- 대문자, 소문자, 숫자와 특수문자를 각각 최소 1개 포함해야 한다.
- 형식이 틀리면 다음 문구를 표시한다.

```text
* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.
```

- 공백을 trim하지 않고 입력 문자열 그대로 검증·전송한다.

### 비밀번호 확인

- 비어 있으면 `* 비밀번호를 한번 더 입력해주세요.`를 표시한다.
- 새 비밀번호와 다르면 `* 비밀번호 확인과 다릅니다.`를 표시한다.
- 같으면 helper를 비운다.

### 검증 시점

- 각 input 중에는 helper를 바꾸지 않고 버튼 유효성만 갱신한다.
- 새 비밀번호 blur 시 비밀번호를 검증한다.
- 확인 값이 이미 있으면 새 비밀번호 blur에서 확인 일치도 다시 검증한다.
- 확인 input blur 시 확인 값을 검증한다.
- submit 시 새 비밀번호를 먼저 검증하고 성공한 경우에만 확인 값을 검증한다.

`validatePassword() && validatePasswordConfirm()` 단축 평가 때문에 새 비밀번호가 유효하지 않으면 submit 시 확인 helper는 새로 갱신되지 않는다. React에서도 이 사용자 노출 결과를 보존한다.

## 6. 버튼 활성 조건

- 새 비밀번호가 형식에 맞는다.
- 확인 값이 새 비밀번호와 정확히 같다.
- PATCH 요청 중이 아니다.

조건을 모두 만족할 때만 `수정하기` 버튼을 활성화한다. 요청 중에도 버튼 문구는 바뀌지 않는다.

## 7. 비밀번호 수정 요청

1. submit 기본 동작을 막는다.
2. 이미 요청 중이면 추가 submit을 무시한다.
3. 두 field를 검증하고 실패하면 요청하지 않는다.
4. `password`, `passwordConfirm`을 그대로 JSON에 넣는다.
5. 버튼을 비활성화하고 `PATCH /users/me/password`를 한 번 요청한다.
6. 성공 응답 body는 사용하지 않는다.
7. 성공하면 두 입력과 helper를 모두 비운다.
8. 버튼은 초기 비활성 상태가 된다.
9. 현재 페이지와 인증 상태를 유지한다.
10. `수정완료` toast를 2초 표시한다.

## 8. 실패 상태

- 입력값은 유지한다.
- API 오류 처리 전에 두 서버 helper를 비운다.
- status/message에 해당하는 field helper 또는 alert를 표시한다.
- 이동하지 않는 오류에서는 pending을 해제하고 폼 유효성에 따라 버튼을 복구한다.

## 9. 성공 toast

- `role="status"`의 `수정완료` 문구를 표시한다.
- 2초 후 숨긴다.
- 연속 성공이면 이전 timer를 취소하고 2초를 다시 계산한다.
- unmount에서 timer를 cleanup한다.

회원정보 수정에서도 동일한 toast 동작을 사용하므로 React에서는 공통 `StatusToast` 표현 컴포넌트를 재사용한다. timer는 각 Page가 소유한다.

## 10. 공통 Header

- 로고는 게시글 목록으로 이동한다.
- Context 사용자 프로필과 공통 메뉴를 표시한다.
- 회원정보 수정, 비밀번호 수정과 로그아웃을 제공한다.
- 로그아웃 성공 시 `/login`으로 이동한다.

## 11. React에서 보존할 동작

- 보호 Route와 별도 GET 없는 초기 화면
- 기존 비밀번호 정규식과 helper 문구
- password blur 시 confirm 재검증
- submit 단축 평가에 따른 helper 갱신 순서
- 유효성과 pending에 따른 버튼 활성화
- PATCH payload와 중복 요청 차단
- 성공 후 form reset·현재 인증과 Route 유지
- 2초 toast와 timer cleanup
- status/message별 helper, alert와 이동

