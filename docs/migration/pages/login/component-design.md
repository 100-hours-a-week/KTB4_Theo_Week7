# 로그인 React 컴포넌트 및 Props 설계

## 1. 목적과 범위

이 문서는 기존 `pages/login.html`, `js/login.js`의 동작을 React로 이전하기 위한 컴포넌트 후보, 책임, props, 상태 및 이벤트 흐름을 정의한다.

목표는 기존 기능과 UI의 동등성을 우선 보장하는 것이다. 로그인 화면 하나에서만 사용하는 로직을 성급하게 범용화하지 않는다.

## 2. 컴포넌트 구조

```text
LoginPage
└── AuthLayout
    ├── AuthBrand
    ├── Login heading/description
    ├── Login form
    │   ├── FormField: email
    │   ├── FormField: password
    │   └── button: submit
    └── AuthSwitchLink
```

### 1차 구현 권장 구조

```jsx
function LoginPage() {
  // 로그인 폼 상태, 검증, 제출, API 오류 처리를 소유한다.

  return (
    <AuthLayout
      title="로그인"
      description="이메일로 로그인하고 오늘의 개발 이야기를 이어가세요."
      footerText="아직 회원이 아니신가요?"
      footerLinkLabel="회원가입"
      footerTo="/signup"
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField {...emailFieldProps} />
        <FormField {...passwordFieldProps} />
        <button type="submit" disabled={!canSubmit}>
          로그인
        </button>
      </form>
    </AuthLayout>
  );
}
```

`LoginForm`을 별도 컴포넌트로 분리하는 것은 선택 사항이다. 현재 LoginPage가 라우팅 외 다른 책임을 갖지 않으므로, 1차 구현에서는 폼을 LoginPage 내부에 두는 편이 데이터 전달이 단순하다. 폼 단위 테스트 또는 페이지 레이아웃과 로직 분리가 필요해지면 `LoginForm`으로 추출한다.

## 3. 컴포넌트별 역할

### 3.1 `LoginPage`

페이지 전용 컨테이너이자 로그인 동작의 소유자다.

책임:

- 이메일과 비밀번호 입력 상태 관리
- blur 여부 또는 필드 오류 상태 관리
- 클라이언트 유효성 검증 실행
- 제출 가능 상태 계산
- 로그인 중 중복 제출 방지
- `authApi.login()` 호출
- 성공 시 인증 상태에 Access Token 반영
- 성공 시 `/posts`로 이동
- 서버 status/message를 helper 또는 alert로 변환

props: 라우터에서 직접 렌더링하므로 기본적으로 받지 않는다.

의존성:

- `useAuth()`의 `login()` 또는 인증 상태 갱신 함수
- `useNavigate()`
- `authApi.login()`을 AuthContext가 감싸지 않는 설계라면 직접 사용
- 이메일·비밀번호 순수 검증 함수

### 3.2 `AuthLayout`

로그인과 회원가입의 공통 시각 구조를 담당하는 표현 컴포넌트다.

책임:

- `auth-page`, `auth-main`, `auth-shell` 구조 제공
- 서비스 로고와 태그라인 출력
- 인증 카드, 제목, 설명 출력
- 페이지별 폼을 `children`으로 출력
- 하단 안내와 전환 링크 출력
- 필요한 페이지에서만 뒤로가기 링크 출력

권장 props:

```ts
type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerTo: string;
  backTo?: string;
  backLabel?: string;
  className?: string;
  mainClassName?: string;
  cardClassName?: string;
};
```

로그인 사용 예:

```jsx
<AuthLayout
  title="로그인"
  description="이메일로 로그인하고 오늘의 개발 이야기를 이어가세요."
  footerText="아직 회원이 아니신가요?"
  footerLinkLabel="회원가입"
  footerTo="/signup"
  mainClassName="login-main"
>
  {/* login form */}
</AuthLayout>
```

설계 판단:

- 로고와 태그라인은 현재 두 인증 페이지에서 동일하므로 props로 받지 않고 내부 상수로 둔다.
- 향후 브랜드 문구가 페이지별로 달라질 때만 props로 확장한다.
- `backTo`가 없으면 로그인처럼 뒤로가기 링크를 렌더링하지 않는다.
- `className`은 기존 `signup-shell`처럼 shell에 추가할 페이지 클래스를 받는다.
- `mainClassName`은 기존 `login-main`, `signup-main`처럼 main에 추가할 페이지 클래스를 받는다.
- `cardClassName`은 기존 `signup-container`처럼 인증 카드에 추가할 페이지 클래스를 받는다.

### 3.3 `FormField`

일반적인 label, input, helper를 연결하는 표현 컴포넌트다. 검증 규칙이나 로그인 API를 알지 않는다.

권장 props:

```ts
type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  className?: string;
};
```

렌더링 규칙:

- `<label htmlFor={id}>`와 `<input id={id}>`를 연결한다.
- helper 영역은 문구가 없어도 기존 레이아웃 보존이 필요하면 빈 요소로 유지한다.
- helper에 안정적인 ID를 부여하고 오류가 있으면 input의 `aria-describedby`와 연결한다.
- 오류가 있을 때 `aria-invalid="true"`를 설정한다.
- `onChange`, `onBlur`는 호출만 하고 검증 판단을 하지 않는다.

로그인 이메일 사용 예:

```jsx
<FormField
  id="email"
  name="email"
  type="email"
  label="이메일"
  placeholder="이메일을 입력하세요"
  autoComplete="email"
  value={email}
  error={errors.email}
  onChange={handleEmailChange}
  onBlur={handleEmailBlur}
/>
```

로그인 비밀번호 사용 예:

```jsx
<FormField
  id="password"
  name="password"
  type="password"
  label="비밀번호"
  placeholder="비밀번호를 입력하세요"
  autoComplete="current-password"
  value={password}
  error={errors.password}
  onChange={handlePasswordChange}
  onBlur={handlePasswordBlur}
/>
```

설계 판단:

- error 문자열을 직접 받으면 클라이언트 오류와 서버 오류를 같은 위치에 표시할 수 있다.
- `isValid`, `validator`, `setValue` 같은 폼 로직 props는 넣지 않는다.
- textarea와 file input은 현재 인터페이스에 포함하지 않는다.

### 3.4 제출 버튼

1차 구현에서는 공통 컴포넌트가 아니라 기본 `<button>`을 사용한다.

```jsx
<button
  type="submit"
  className={`primary-button${canSubmit ? " active" : ""}`}
  disabled={!canSubmit}
>
  로그인
</button>
```

이유:

- 기존 활성 스타일은 `active` 클래스에 의존한다.
- 로그인 버튼만을 위해 `SubmitButton`을 만들면 props 전달만 늘어난다.
- 회원가입 구현 후 동일한 인터페이스가 확인되면 아래 후보로 추출한다.

```ts
type SubmitButtonProps = {
  children: ReactNode;
  disabled: boolean;
  className?: string;
};
```

### 3.5 `AuthSwitchLink`

로그인과 회원가입의 하단 전환 UI는 반복되지만, 내용이 짧고 `AuthLayout` 안에서만 사용된다. 1차 구현에서는 별도 공개 컴포넌트로 만들지 않고 `AuthLayout` 내부 마크업으로 둔다.

## 4. 상태 설계

### 4.1 LoginPage 로컬 상태

```ts
type LoginFormState = {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
  };
  isSubmitting: boolean;
};
```

React 구현에서는 개별 `useState` 또는 하나의 객체 상태 중 어느 쪽도 가능하다. 로그인 필드가 두 개뿐이므로 개별 상태가 더 명시적이다.

```jsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 4.2 파생 상태

아래 값은 별도 state로 저장하지 않고 입력값과 제출 상태에서 계산한다.

```jsx
const isFormValid = isValidEmail(email.trim()) && isValidPassword(password);
const canSubmit = isFormValid && !isSubmitting;
```

별도 state로 저장하지 않는 이유는 입력값과 버튼 상태가 서로 어긋나는 것을 막기 위해서다.

### 4.3 전역 인증 상태

LoginPage가 직접 Access Token 모듈 변수를 변경하지 않도록 AuthContext의 로그인 동작을 사용한다.

권장 인터페이스:

```ts
type AuthContextValue = {
  accessToken: string | null;
  currentUser: User | null;
  isAuthInitializing: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};
```

`login()`은 다음 책임을 갖는다.

1. `POST /auth/login` 호출
2. 응답의 Access Token 검증
3. 토큰을 인증 상태와 API client에 반영

페이지 이동과 필드 오류 표시는 LoginPage가 담당한다.

## 5. 이벤트 및 데이터 흐름

### 5.1 입력 변경

```text
사용자 입력
→ onChange
→ email/password state 갱신
→ isFormValid와 canSubmit 재계산
→ 버튼 활성 상태 렌더링
```

기존 동작과 동일하게 input 중에는 버튼 상태를 갱신한다. 기존 helper를 언제 제거할지는 다음 중 한 방식을 선택할 수 있다.

- 기존과 가장 동일: input 중 helper를 유지하고 blur 또는 제출 때 갱신
- UX 개선: 사용자가 유효한 값으로 고치면 즉시 helper 제거

1차 마이그레이션에서는 첫 번째 방식을 사용한다. UX 개선은 동등성 검증 후 별도 변경으로 처리한다.

### 5.2 Blur 검증

```text
email/password blur
→ 해당 필드 검증
→ errors의 해당 필드만 갱신
→ FormField helper 재렌더링
```

### 5.3 제출

```text
form submit
→ preventDefault
→ isSubmitting이면 종료
→ 전체 필드 검증
→ 실패하면 errors 반영 후 종료
→ isSubmitting = true
→ AuthContext.login({ email: email.trim(), password })
→ 성공: /posts 이동
→ 실패: status/message를 errors 또는 alert로 변환
→ finally: isSubmitting = false
```

### 5.4 오류 흐름

```text
API error
→ 기존 email/password errors 초기화
→ 400 invalid_email_format: errors.email
→ 401 invalid_credentials: errors.password
→ 그 외 기존 명세에 따라 alert
```

로그인 API의 401은 전역 `ProtectedRoute`나 자동 로그아웃으로 처리하지 않는다.

## 6. API 경계

권장 API 함수:

```ts
type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

function login(credentials: LoginRequest): Promise<LoginResponse>;
```

`authApi.login()` 내부에서 서버 envelope인 `result.data.accessToken`을 꺼내 반환하면, LoginPage와 AuthContext는 서버 응답 포맷 전체에 의존하지 않는다.

```jsx
const { accessToken } = await authApi.login(credentials);
```

## 7. 파일 배치 제안

```text
src/
├── api/
│   ├── client.js
│   └── authApi.js
├── components/
│   ├── layout/
│   │   └── AuthLayout.jsx
│   └── form/
│       └── FormField.jsx
├── features/
│   └── auth/
│       ├── LoginPage.jsx
│       ├── AuthContext.jsx
│       └── authValidation.js
└── app/
    └── router.jsx
```

LoginPage 전용 Hook과 LoginForm 파일은 1차 구현에서 만들지 않는다.

## 8. 기존 DOM과 React 대응표

| 기존 요소/동작 | React 대응 |
|---|---|
| `auth-main`, `auth-shell`, `auth-brand`, `auth-card` | `AuthLayout` |
| `#login-form` | `LoginPage` 내부 `<form>` |
| `.form-group` | `FormField` |
| `#email-helper`, `#password-helper` | `FormField`의 `error` props |
| `#login-button.disabled` | `canSubmit` 파생 상태 |
| `classList.toggle("active")` | 조건부 `className` |
| `isLoginSubmitting` | `isSubmitting` state |
| `addEventListener("input")` | `onChange` |
| `addEventListener("blur")` | `onBlur` |
| `addEventListener("submit")` | `onSubmit` |
| `saveAccessToken()` | `AuthContext.login()` 내부 인증 상태 갱신 |
| `location.href = "posts.html"` | `navigate("/posts", { replace: true })` |

## 9. 구현 완료 조건

- [ ] `LoginPage`가 DOM API를 직접 사용하지 않는다.
- [ ] 이메일과 비밀번호가 controlled input으로 동작한다.
- [ ] 기존 input/blur/submit 검증 시점이 유지된다.
- [ ] 모든 유효 조건과 요청 중 상태에 따라 버튼이 계산된다.
- [ ] 요청 중 중복 제출이 차단된다.
- [ ] 로그인 API에 Access Token과 401 재발급을 적용하지 않는다.
- [ ] 성공 시 Access Token을 인증 상태에 저장한다.
- [ ] 성공 시 `/posts`로 이동한다.
- [ ] 서버 status/message별 helper와 alert 동작이 기존 문서와 일치한다.
- [ ] label, autocomplete, helper 접근성 연결이 유지된다.
- [ ] `checklist.md`의 React 결과를 기록한다.

## 10. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 최초 로그인 컴포넌트 및 props 설계 작성 | 전체 중복 분석을 기반으로 로그인 구현 경계를 확정하기 위함 | React 공통 기반과 로그인 구현에서 사용 |
| 2026-07-19 | `useAuth`를 `features/auth/`에 배치 | 현재는 인증 전용 Hook이므로 Context와 가까이 두는 편이 응집도가 높고, 하나의 파일을 위해 전역 `hooks/` 디렉터리를 만들 필요가 없음 | 향후 여러 도메인에서 공유되는 Hook이 되면 `hooks/`로 이동 가능 |
| 2026-07-19 | `AuthLayout`에 `mainClassName`, `cardClassName` 추가 | 기존 CSS의 로그인·회원가입 전용 클래스가 main, shell, card의 서로 다른 위치에 적용됨 | 기존 CSS를 변경하지 않고 페이지별 레이아웃 차이를 보존 가능 |
