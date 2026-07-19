# 회원가입 React 컴포넌트 및 Props 설계

## 1. 목표

기존 회원가입의 이미지 미리보기, 필드 검증, API 오류 및 성공 이동을 React의 state와 JSX로 이전한다. 로그인에서 구현한 `AuthLayout`, `FormField`, API client를 재사용하되 회원가입만의 요구에 필요한 만큼만 확장한다.

## 2. 권장 구조

```text
SignupPage
└── AuthLayout
    └── signup form
        ├── ProfileImageField
        ├── FormField: email
        ├── FormField: password + guide
        ├── FormField: passwordConfirm
        ├── FormField: nickname + guide
        └── button: submit
```

1차 구현에서는 `SignupForm`을 별도 파일로 분리하지 않는다. SignupPage가 라우팅 외 별도 책임을 갖게 되어 테스트나 가독성 문제가 생길 때 추출한다.

## 3. `SignupPage`

책임:

- 모든 입력값과 오류 상태 관리
- 선택 프로필 파일과 Object URL 관리
- input/blur/submit 검증 시점 유지
- 제출 가능 상태 계산
- `userApi.signup()` 호출
- status/message별 helper와 alert 처리
- 성공 alert 후 `/login` 이동

props: Route에서 직접 렌더링하므로 받지 않는다.

## 4. `AuthLayout` 재사용 및 변경 제안

사용 예:

```jsx
<AuthLayout
  title="회원가입"
  description="코드 한입에서 지식을 나누고 성장 기록을 쌓아보세요."
  footerText="이미 계정이 있으신가요?"
  footerLinkLabel="로그인"
  footerTo="/login"
  backTo="/login"
  backLabel="로그인으로 돌아가기"
  mainClassName="signup-main"
  className="signup-shell"
  cardClassName="signup-container"
>
  {/* signup form */}
</AuthLayout>
```

현재 `AuthLayout`의 뒤로가기는 텍스트 화살표를 렌더링하지만 기존 회원가입은 `back-button.png`를 사용한다. UI 동등성을 위해 다음 중 하나로 보완한다.

권장안:

```ts
type AuthLayoutProps = {
  // 기존 props
  backIconSrc?: string;
};
```

`backIconSrc`가 있으면 빈 alt와 `aria-hidden`을 가진 `<img>`를 렌더링하고, 링크의 접근 가능한 이름은 `backLabel`로 유지한다.

## 5. `FormField` 재사용 및 변경 제안

회원가입의 비밀번호와 닉네임은 label과 input 사이에 안내 문구가 있다.

기존 구조:

```text
label
guide
input
helper
```

따라서 선택적 `guide` props를 추가한다.

```ts
type FormFieldProps = {
  // 기존 props
  guide?: string;
  guideClassName?: string;
};
```

사용 예:

```jsx
<FormField
  id="password"
  name="password"
  type="password"
  label="비밀번호*"
  guide="8~20자, 대문자·소문자·숫자·특수문자를 각각 1개 이상 포함해주세요."
  guideClassName="signup-field-guide"
  autoComplete="new-password"
  value={password}
  error={errors.password}
  onChange={handlePasswordChange}
  onBlur={handlePasswordBlur}
/>
```

FormField는 안내를 표시할 뿐 검증 규칙을 알지 않는다.

## 6. `ProfileImageField`

회원가입 전용 표현 컴포넌트 후보이며 실제 File과 Object URL 생명주기는 SignupPage 또는 Hook이 소유한다.

권장 props:

```ts
type ProfileImageFieldProps = {
  inputId: string;
  label: string;
  file: File | null;
  previewUrl: string | null;
  error?: string;
  defaultImageSrc: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onEmptyClick?: () => void;
};
```

동작:

- `file === null`: label 클릭으로 파일 선택 창을 열고 필요 시 helper 표시
- `file !== null`: 미리보기 클릭 시 파일 선택 대신 `onRemove()` 실행
- file input은 `accept="image/*"`, `hidden` 유지
- 미리보기 alt는 `프로필 미리보기`

컴포넌트 내부에서 `URL.createObjectURL()`을 만들지 않는 이유는 URL 생성·해제 시점을 상태 소유자에서 명확히 관리하기 위해서다.

`onEmptyClick`은 이미지가 없는 선택 영역을 눌렀을 때 기존처럼 필수 helper를 즉시 표시하기 위해 추가한다. 파일 선택 창은 label 기본 동작으로 계속 열린다.

## 7. 상태 설계

```ts
type SignupState = {
  profileFile: File | null;
  profilePreviewUrl: string | null;
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  errors: {
    profileImage?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    nickname?: string;
  };
  isSubmitting: boolean;
};
```

`isFormValid`과 `canSubmit`은 별도 state가 아니라 입력 상태에서 계산한다.

```jsx
const isFormValid =
  profileFile !== null &&
  isValidEmail(email.trim()) &&
  isValidPassword(password) &&
  password === passwordConfirm &&
  isValidNickname(nickname.trim())

const canSubmit = isFormValid && !isSubmitting
```

## 8. 이미지 URL 생명주기

```text
새 파일 선택
→ 이전 preview URL revoke
→ 새 Object URL 생성
→ state 반영

이미지 제거
→ preview URL revoke
→ file/preview state 초기화
→ 동일 파일 재선택 가능하도록 input value 초기화

컴포넌트 unmount
→ 현재 preview URL revoke
```

React에서는 effect cleanup 또는 이미지 미리보기 전용 Hook을 사용해 unmount cleanup을 반드시 처리한다. 기존 Vanilla 페이지보다 생명주기를 명시적으로 보강하는 부분이며 사용자 화면 동작은 바뀌지 않는다.

## 9. 검증 함수

로그인의 `isValidEmail`, `isValidPassword`, 길이 상수는 그대로 재사용한다. 닉네임과 비밀번호 확인은 순수 함수로 추가한다.

```js
export const NICKNAME_MAX_LENGTH = 10

export function isValidNickname(nickname) {
  return (
    nickname.length > 0 &&
    !nickname.includes(' ') &&
    nickname.length <= NICKNAME_MAX_LENGTH
  )
}

export function isPasswordConfirmed(password, passwordConfirm) {
  return passwordConfirm.length > 0 && password === passwordConfirm
}
```

구체적인 helper 문구 결정은 SignupPage의 필드 검증 함수가 담당한다.

## 10. API 경계

`userApi.js`에 회원가입 함수를 추가한다.

```ts
type SignupRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  profileImage: string;
};

function signup(payload: SignupRequest): Promise<void>;
```

```js
export async function signup(payload) {
  await request('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    includeAccessToken: false,
    retryOnUnauthorized: false,
  })
}
```

## 11. 제출 흐름

```text
submit
→ preventDefault
→ isSubmitting이면 종료
→ 프로필부터 닉네임까지 기존 순서로 검증
→ 실패하면 errors 반영 후 종료
→ isSubmitting = true
→ userApi.signup(payload)
→ 성공 alert
→ /login 이동
→ 실패 status/message를 errors 또는 alert로 변환
→ finally isSubmitting = false
```

## 12. 파일 배치 제안

```text
src/
├── api/
│   └── userApi.js
├── components/
│   └── form/
│       ├── FormField.jsx
│       └── ProfileImageField.jsx
├── features/
│   └── auth/
│       ├── SignupPage.jsx
│       └── authValidation.js
├── assets/
│   └── images/
│       ├── back-button.png
│       └── basic-profile-icon.png
└── styles/
    └── signup.css
```

## 13. 구현 완료 조건

- [ ] `/signup` Route가 직접 진입과 새로고침에서 동작한다.
- [ ] 기존 AuthLayout과 FormField를 필요한 범위만 확장해 사용한다.
- [ ] 프로필 이미지 선택·미리보기·제거가 동일하게 동작한다.
- [ ] Object URL이 교체·제거·unmount 때 해제된다.
- [ ] 모든 입력이 controlled input으로 동작한다.
- [ ] 기존 input/blur/submit 검증 시점과 helper 문구가 유지된다.
- [ ] 유효한 폼과 요청 중 상태에 따라 버튼 상태가 계산된다.
- [ ] 요청 중 중복 제출이 차단된다.
- [ ] 요청에 Access Token과 401 재발급을 적용하지 않는다.
- [ ] 성공 alert 후 `/login`으로 이동한다.
- [ ] API status/message별 helper와 alert가 기존과 일치한다.
- [ ] `checklist.md`의 React 결과를 기록한다.

## 14. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 회원가입 최초 컴포넌트 및 props 설계 작성 | 기존 동작과 로그인 공통 UI를 기반으로 구현 경계를 정의 | 회원가입 React 구현의 기준으로 사용 |
| 2026-07-19 | `ProfileImageField`에 `onEmptyClick` 추가 | 기존 UI는 이미지가 없는 영역을 클릭하는 즉시 helper를 표시하며, 파일 선택 취소 시 change 이벤트가 발생하지 않음 | 파일 선택 창 동작을 유지하면서 기존 helper 표시 시점을 보존 |
| 2026-07-19 | hidden file input의 `value`를 빈 문자열로 유지 | 선택 파일을 제거한 뒤 같은 파일을 다시 선택해도 change 이벤트가 발생해야 하며 별도 DOM ref 조작을 피하기 위함 | File은 change 이벤트에서 state로 보관하고 브라우저 input 값은 즉시 초기화 |
