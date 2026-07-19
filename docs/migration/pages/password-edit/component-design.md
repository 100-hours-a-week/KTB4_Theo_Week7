# 비밀번호 수정 React 컴포넌트 및 Props 설계

## 1. 구현 단계

1. 비밀번호 PATCH API와 페이지용 순수 검증
2. 공통 `FormField`의 guide/helper 접근성 확장
3. `PasswordEditForm`
4. 공통 `StatusToast` 승격
5. `PasswordEditPage` PATCH·timer·Header 연결
6. `/password/edit` 보호 Route
7. CSS 이전·범위 한정
8. lint/build 및 체크리스트 검증

## 2. 권장 구조

```text
ProtectedRoute
└── AppLayout
    └── PasswordEditPage
        ├── PasswordEditForm
        │   └── FormField × 2
        └── StatusToast
```

`AppLayout`, Header, ProfileMenu, `FormField`, 인증 Context와 비밀번호 정규식을 재사용한다.

## 3. `PasswordEditPage`

Route에서 직접 렌더링하므로 props는 받지 않는다.

책임:

- Header 사용자와 로그아웃 연결
- PATCH pending과 Promise ref 중복 차단
- status/message를 field helper 또는 alert로 변환
- 성공 시 form reset version 증가
- 2초 toast timer 시작·재시작·unmount cleanup

```ts
type PasswordEditPageState = {
  serverErrors: { password?: string; passwordConfirm?: string };
  isSubmitting: boolean;
  formRevision: number;
  isToastVisible: boolean;
};
```

## 4. 사용자 API

`userApi.js`에 추가한다.

```js
updatePassword({ password, passwordConfirm })
```

`PATCH /users/me/password`와 JSON 직렬화를 담당하며 성공 body는 반환하지 않는다.

## 5. 페이지용 검증

기존 `authValidation.isValidPassword()`와 길이 상수는 공유한다. helper 문구를 반환하는 함수만 페이지에 둔다.

```js
validateNewPassword(password)
validatePasswordConfirm(password, passwordConfirm)
```

회원가입 confirmation 문구와 비밀번호 수정 문구가 다르므로 helper 생성 함수까지 무리하게 공유하지 않는다.

## 6. `FormField` 확장

현재 공통 `FormField`는 guide를 렌더링할 수 있지만 guide와 helper를 동시에 `aria-describedby`에 연결하지 않고 helper class가 고정되어 있다. optional props를 추가한다.

```ts
guideId?: string;
helperClassName?: string;
```

`aria-describedby`는 항상 존재하는 guide와 오류가 있을 때의 helper ID를 함께 조합한다. 기존 로그인·회원가입 UI는 기본값으로 유지한다.

## 7. `PasswordEditForm`

```ts
type PasswordEditFormProps = {
  isSubmitting: boolean;
  serverErrors: {
    password?: string;
    passwordConfirm?: string;
  };
  onClearServerError: (field: 'password' | 'passwordConfirm') => void;
  onSubmit: (values: {
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;
};
```

책임:

- 두 controlled password state
- input 중 버튼 유효성 계산
- password blur 시 password와 값이 있는 confirm 재검증
- confirm blur와 submit 검증
- local·server helper 표시
- 성공 후 Page의 `key={formRevision}`으로 전체 초기화

두 input 모두 `autocomplete="new-password"`를 사용한다.

## 8. 공통 `StatusToast`

회원정보 수정에서 profile 경로에 만든 toast가 두 번째 사용처를 얻는다. 다음 공통 위치로 이동한다.

```text
components/feedback/StatusToast.jsx
```

```ts
type StatusToastProps = {
  isVisible: boolean;
  className: string;
  children: ReactNode;
};
```

표현만 담당하고 timer는 Page가 소유한다. profile import도 공통 경로로 변경한다.

## 9. 데이터 흐름

```text
/password/edit
→ ProtectedRoute
→ PasswordEditForm
→ 두 값 검증
→ userApi.updatePassword
→ 성공
   ├── formRevision 증가로 입력·helper reset
   ├── 현재 인증과 Route 유지
   └── 공통 StatusToast 2초 표시
→ 실패
   └── 입력 유지 + field helper 또는 alert
```

## 10. 예정 디렉터리

```text
react-app/src/features/password/edit/
├── components/
│   └── PasswordEditForm.jsx
├── utils/
│   └── passwordValidation.js
└── PasswordEditPage.jsx

react-app/src/components/feedback/
└── StatusToast.jsx

react-app/src/styles/
└── password-edit.css
```

## 11. 구현 완료 조건

- [ ] `/password/edit`가 보호 Route로 동작한다.
- [ ] 현재 비밀번호 없이 새 비밀번호·확인만 표시한다.
- [ ] 기존 정규식과 페이지 helper 문구가 일치한다.
- [ ] blur·submit 검증 시점과 confirm 재검증이 일치한다.
- [ ] 유효성과 pending이 버튼에 반영된다.
- [ ] 빠른 연속 submit에도 PATCH는 한 번이다.
- [ ] 성공 후 form을 비우고 인증·Route를 유지한다.
- [ ] 실패 후 입력을 유지한다.
- [ ] status/message별 helper, alert와 이동이 일치한다.
- [ ] toast 표시·재시작·cleanup이 동작한다.
- [ ] Header·반응형·접근성 기준을 충족한다.
- [ ] `checklist.md`에 결과를 기록한다.

## 12. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 비밀번호 수정 최초 컴포넌트와 props 설계 작성 | Vanilla DOM·요청·timer 책임을 폼과 Page로 분리 | 비밀번호 수정 구현 기준으로 사용 |
| 2026-07-19 | Route를 `/password/edit`로 확정 | 공통 ProfileMenu가 이미 해당 React 경로를 사용함 | 보호 Route에 Page를 연결하면 기존 메뉴와 즉시 연동 |
| 2026-07-19 | 기존 비밀번호 input을 새로 추가하지 않음 | Vanilla와 현재 PATCH 계약에 해당 필드가 없으며 임의 추가 시 백엔드 계약이 달라짐 | 새 비밀번호·확인 두 값만 검증·전송 |
| 2026-07-19 | profile 전용 `StatusToast`를 공통 feedback으로 승격 예정 | 회원정보와 비밀번호 수정이 같은 표시·접근성 동작을 사용함 | className으로 페이지 style만 주입하고 timer는 각 Page가 소유 |
| 2026-07-19 | 공통 `FormField`에 guide/helper 접근성 props 추가 예정 | 기존 component를 재사용하면서 비밀번호 guide와 오류 helper를 input에 모두 연결해야 함 | 기존 호출 기본 동작을 유지하고 비밀번호 수정에서만 확장 props 사용 |
