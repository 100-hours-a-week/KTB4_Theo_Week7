# 전체 페이지 중복 UI 및 로직 분석

## 1. 분석 목적

이 문서는 현재 Vanilla JS 프로젝트의 8개 페이지를 한 번 비교하여 React 마이그레이션에서 공통으로 분리할 UI, 로직, API 및 Hook 후보를 정리한다.

이 분석은 프로젝트 전체를 대상으로 한 번 수행하는 기준 문서다. 이후 페이지를 마이그레이션하면서 새로운 중복이나 예외가 발견되면 이 문서를 갱신하고 변경 이유를 기록한다.

## 2. 분석 대상

| 도메인 | 페이지 | 기존 화면 | 기존 동작 파일 |
|---|---|---|---|
| 인증 | 로그인 | `pages/login.html` | `js/login.js` |
| 인증 | 회원가입 | `pages/signup.html` | `js/signup.js` |
| 게시글 | 목록 | `pages/posts.html` | `js/posts.js` |
| 게시글 | 상세 | `pages/post.html` | `js/post.js` |
| 게시글 | 작성 | `pages/make-post.html` | `js/make-post.js` |
| 게시글 | 수정 | `pages/edit-post.html` | `js/edit-post.js` |
| 회원 | 프로필 수정 | `pages/edit-profile.html` | `js/edit-profile.js` |
| 회원 | 비밀번호 수정 | `pages/edit-password.html` | `js/edit-password.js` |

공통 파일인 `js/common.js`, `js/profile-menu.js`, `js/validation.js`도 함께 분석했다.

## 3. 중복 UI 분석

### 3.1 인증 페이지 레이아웃

| 공통 요소 | 로그인 | 회원가입 |
|---|:---:|:---:|
| `auth-page`, `auth-main`, `auth-shell` 구조 | O | O |
| 서비스 로고와 태그라인 | O | O |
| `auth-card` 폼 카드 | O | O |
| 페이지 제목과 설명 | O | O |
| 인증 페이지 전환 안내와 링크 | O | O |
| 뒤로가기 링크 | X | O |

판정: `AuthLayout` 공통 컴포넌트 후보로 분리한다. 로그인과 회원가입의 차이는 선택적인 뒤로가기 링크와 내부 폼 내용이다.

### 3.2 로그인 이후 공통 Header와 프로필 메뉴

다음 6개 페이지에 거의 같은 Header와 프로필 메뉴 마크업이 반복된다.

- 게시글 목록
- 게시글 상세
- 게시글 작성
- 게시글 수정
- 프로필 수정
- 비밀번호 수정

반복되는 요소:

- 게시글 목록으로 이동하는 서비스 로고
- 사용자 프로필 이미지 버튼
- 회원정보 수정 링크
- 비밀번호 수정 링크
- 로그아웃 버튼
- 메뉴 열림·닫힘 상태
- 외부 클릭 시 닫기
- Escape 키로 닫고 프로필 버튼에 포커스 복원
- 현재 사용자 조회와 프로필 이미지 fallback

차이점:

- 게시글 상세·작성·수정 페이지에는 뒤로가기 링크가 있다.
- 목록·회원정보·비밀번호 페이지에는 뒤로가기 링크가 없다.
- 페이지별 Header CSS 클래스가 별도로 존재한다.

판정: `AppLayout`, `Header`, `ProfileMenu`의 확정 공통화 후보다. Header는 선택적인 뒤로가기 설정을 받는다.

### 3.3 폼 필드

다음 형태가 여러 화면에서 반복된다.

```text
label
input 또는 textarea
helper/error message
```

| 필드 종류 | 사용 페이지 |
|---|---|
| 이메일 | 로그인, 회원가입, 프로필 수정의 읽기 전용 표시 |
| 비밀번호 | 로그인, 회원가입, 비밀번호 수정 |
| 비밀번호 확인 | 회원가입, 비밀번호 수정 |
| 닉네임 | 회원가입, 프로필 수정 |
| 게시글 제목 | 게시글 작성, 게시글 수정 |
| 게시글 본문 | 게시글 작성, 게시글 수정 |
| 댓글 본문 | 게시글 상세 |

판정: `FormField`는 유력 공통 후보지만 모든 종류를 하나의 거대한 컴포넌트로 합치지 않는다.

- 1차 범위: label, input, helper를 출력하는 일반 입력 필드
- textarea, 파일 입력, 읽기 전용 값은 필요할 때 별도 컴포넌트로 검토
- 검증 규칙과 API 오류 해석은 `FormField`에 넣지 않는다.

### 3.4 제출 버튼

모든 폼에서 다음 동작이 반복된다.

- 입력값이 유효할 때만 활성화
- 요청 중 비활성화
- 빠른 연속 제출 방지
- 활성 상태에 따라 CSS 클래스 또는 스타일 변경

판정: 공통 로직은 공유하되, 버튼 컴포넌트는 보류한다. 현재 페이지별 클래스와 레이아웃 차이가 커서 처음부터 `SubmitButton`으로 추상화할 이점이 작다. 우선 기본 `<button>`과 공통 상태 계산을 사용하고, React 구현 2개 이상에서 동일한 props가 확인되면 공통화한다.

### 3.5 이미지 선택 및 미리보기

| 기능 | 회원가입 | 게시글 작성 | 게시글 수정 | 프로필 수정 |
|---|:---:|:---:|:---:|:---:|
| 파일 선택 | O | O | O | O |
| `URL.createObjectURL()` | O | O | O | O |
| 이전 Object URL 해제 | O | O | O | O |
| 단일 이미지 | O | X | X | O |
| 복수 이미지 | X | O | O | X |
| 이미지 제거 | O | X | 교체 방식 | X |
| 기존 서버 이미지 유지 | X | X | O | O |

판정:

- Object URL 생성·해제 생명주기는 `useImagePreview` Hook 후보로 분리한다.
- UI는 단일 이미지와 복수 이미지 요구가 달라 하나의 공통 컴포넌트로 즉시 합치지 않는다.
- 복수 미리보기 UI는 게시글 작성·수정 구현 시 `ImagePreviewList`로 검토한다.

### 3.6 확인 모달

| 사용처 | 대상 | 공통 동작 |
|---|---|---|
| 게시글 상세 | 게시글 삭제 | 열기, 취소, 확인, backdrop 클릭, Escape, 요청 중 버튼 비활성 |
| 게시글 상세 | 댓글 삭제 | 같은 모달을 대상만 바꾸어 사용 | 
| 프로필 수정 | 회원 탈퇴 | 열기, 취소, 확인, backdrop 클릭, Escape, 요청 중 버튼 비활성 |

판정: `ConfirmModal` 확정 공통화 후보다. 제목, 설명, 열림 상태, 확인·취소 콜백, 처리 중 상태를 props로 받는다.

### 3.7 Toast

프로필 수정과 비밀번호 수정에서 같은 패턴이 반복된다.

- 완료 시 표시
- 기존 timer가 있으면 제거
- 2초 후 숨김

판정: `Toast`와 `useToast` 후보로 분리할 수 있다. 실제 표시 위치와 스타일 차이를 props 또는 className으로 수용한다.

### 3.8 프로필 이미지

다음 화면에서 사용자 또는 작성자 프로필 이미지를 표시한다.

- 공통 Header
- 게시글 목록 카드
- 게시글 상세 작성자
- 댓글 작성자
- 프로필 수정

반복 동작:

- 서버 이미지 파일명을 표시 가능한 URL로 변환
- 이미지 경로가 없으면 기본 프로필 이미지 사용
- 이미지 로드 오류 시 기본 이미지로 교체
- 탈퇴한 작성자는 `알 수 없음`으로 표시

판정: URL 및 fallback 로직은 공통 유틸리티로 확정한다. UI 컴포넌트는 크기·스타일 요구가 다르므로 `ProfileImage` 도입 여부를 게시글 화면 구현 시 재검토한다.

## 4. 중복 로직 분석

### 4.1 API 요청과 인증

`js/common.js`가 이미 다음 공통 책임을 가지고 있다.

- Base URL 결합
- JSON 요청·응답 처리
- 쿠키 포함
- Access Token 메모리 저장
- Authorization 헤더 추가
- Refresh Token 쿠키를 이용한 Access Token 재발급
- 동시 재발급 요청 중복 방지
- 401 이후 원 요청 한 번 재시도
- 공통 오류 객체 생성

판정: React의 `api/client.js`로 이전할 확정 공통 로직이다. 컴포넌트가 직접 `fetch()`를 호출하지 않게 한다.

### 4.2 폼 상태와 검증 시점

로그인, 회원가입, 게시글 작성·수정, 프로필 수정, 비밀번호 수정에서 공통 패턴이 반복된다.

```text
input → 제출 버튼 활성 여부 계산
blur → 해당 필드의 구체적인 helper 표시
submit → 전체 검증 후 API 요청
request pending → 중복 제출 방지 및 버튼 비활성
request error → 서버 message를 필드 오류 또는 alert로 변환
```

판정:

- 이메일, 비밀번호, 닉네임, 게시글 검증 규칙은 DOM을 받지 않는 순수 함수로 관리한다.
- 오류 문구 결정은 도메인 검증 함수 또는 페이지 로직이 담당한다.
- 처음부터 범용 `useForm` Hook을 만들지 않는다. 로그인과 회원가입 구현 후 실제 중복 인터페이스가 확인되면 도입을 검토한다.

### 4.3 로딩 및 mutation 중복 방지

대부분의 페이지가 `is...Loading`, `is...Submitting`, `is...Updating`, `is...Deleting` boolean을 사용한다.

공통 원칙:

- 요청 전 `true`
- 같은 동작이 진행 중이면 조기 반환
- 관련 버튼 비활성
- `finally`에서 `false`

판정: 모든 요청을 하나의 전역 loading으로 합치지 않는다. 요청별 상태를 해당 페이지 또는 기능 컴포넌트가 소유한다.

### 4.4 인증 실패 이동

보호 페이지 대부분에서 다음 동작이 반복된다.

```text
401 + unauthorized_request
→ 로그인이 필요하다는 alert
→ 로그인 페이지 이동
```

판정: 인증 초기화와 미인증 접근은 `ProtectedRoute`가 담당한다. 이미 렌더링된 화면의 요청 중 인증이 만료되는 경우는 API client/AuthContext의 공통 처리와 페이지 UX의 경계를 구현 단계에서 확정한다. 로그인 API의 401은 잘못된 자격 증명이므로 전역 인증 만료 처리에서 제외한다.

### 4.5 라우팅

현재 `location.href`와 `<a href>`로 전체 문서를 이동한다.

판정:

- 화면 내부 이동은 React Router의 `Link`, `NavLink`, `useNavigate`로 이전한다.
- 게시글 식별자는 `?postId=` 대신 `/posts/:postId` 경로 파라미터를 사용한다.
- 외부 URL이나 브라우저 전체 이동이 필요한 예외가 없다면 `location.href`를 사용하지 않는다.

### 4.6 이미지 URL과 표시 형식

다음 순수 로직이 여러 화면에서 사용된다.

- `resolveImageUrl()`
- `formatPostDate()`
- `formatPostCount()`
- `getDisplayNickname()`

판정: React 의존성이 없는 `utils/image.js`, `utils/format.js`로 이전한다.

### 4.7 DOM 렌더링

게시글 목록, 댓글 목록, 프로필 이미지, 이미지 갤러리에서 `createElement`, `replaceChildren`, `textContent`, `hidden`을 직접 조작한다.

판정: 서버 응답과 로컬 상태를 기반으로 JSX를 선언적으로 렌더링한다.

- 배열 → `map()`과 안정적인 key
- `hidden` 변경 → 조건부 렌더링 또는 속성 계산
- `textContent` 변경 → state/props 표현식
- class 토글 → state/props에 따른 `className`

### 4.8 브라우저 이벤트 및 cleanup

반복되는 브라우저 자원:

- document click과 keydown
- `IntersectionObserver`
- Object URL
- Toast timer

판정: `useEffect`에서 등록하고 cleanup 함수에서 반드시 해제한다. Object URL, observer, timer의 해제 여부는 마이그레이션 완료 체크리스트에 포함한다.

## 5. 공통화 우선순위

### 5.1 확정 공통화 후보

| 후보 | 근거 | 도입 시점 |
|---|---|---|
| API client | 모든 API 요청과 인증 재발급에서 사용 | 공통 기반 이전 |
| 도메인 API 모듈 | 컴포넌트에서 endpoint 분리 | 공통 기반 및 각 도메인 구현 |
| validation 순수 함수 | 여러 폼에 동일 규칙 반복 | 공통 기반 이전 |
| `AuthContext` | 토큰·현재 사용자·로그아웃 공유 | 공통 기반 이전 |
| `ProtectedRoute` | 보호 페이지 공통 접근 제어 | 공통 기반 이전 |
| `LoadingView` | 보호 Route 인증 초기화 중 빈 화면 방지 | 인증 초기화 UX 보완 |
| `AuthInitializationError` | 비401 사용자 조회 실패 안내와 재시도 제공 | 인증 초기화 UX 보완 |
| `AppLayout` | 로그인 이후 6개 페이지 공통 틀 | 공통 기반 이전 |
| `Header` | 로그인 이후 6개 페이지에서 반복 | 공통 기반 이전 |
| `ProfileMenu` | 동일 마크업과 동작 반복 | 공통 기반 이전 |
| `ConfirmModal` | 게시글 삭제·댓글 삭제·회원 탈퇴 반복 | 첫 삭제 기능 구현 전 |
| format/image 유틸리티 | 여러 목록과 상세 표시에서 반복 | 공통 기반 이전 |

### 5.2 유력하지만 구현으로 검증할 후보

| 후보 | 확인할 사항 |
|---|---|
| `AuthLayout` | 로그인과 회원가입의 카드 크기·뒤로가기 차이 수용 방식 |
| `FormField` | input 중심으로 유지할지 textarea까지 지원할지 |
| `useImagePreview` | 단일·복수 파일을 한 Hook으로 표현해도 단순한지 |
| `ImagePreviewList` | 작성·수정 이미지 교체 정책 차이 수용 방식 |
| `Toast`/`useToast` | 위치·스타일 차이와 timer 책임 |
| `ProfileImage` | 화면별 크기와 fallback class 차이 |

### 5.3 현재는 공통화하지 않을 항목

| 항목 | 이유 |
|---|---|
| 범용 `useForm` | 폼별 검증 시점과 서버 오류가 달라 현재 추상화 근거가 부족함 |
| 범용 SubmitButton | 페이지별 CSS와 레이아웃 차이가 크고 동작은 기본 button으로 충분함 |
| 모든 오류를 처리하는 전역 ErrorView | 현재 오류의 대부분이 필드 helper 또는 alert이며 페이지별 의미가 다름 |
| 모든 요청의 전역 loading | 동시에 발생할 수 있는 요청을 서로 막을 위험이 있음 |
| 하나의 만능 이미지 입력 컴포넌트 | 단일·복수·삭제·유지·교체 정책이 서로 다름 |

## 6. 잠정 공통 컴포넌트 구조

```text
App
├── Public routes
│   └── AuthLayout
│       ├── LoginPage
│       └── SignupPage
│
└── ProtectedRoute
    ├── LoadingView
    ├── AuthInitializationError
    └── AppLayout
        ├── Header
        │   └── ProfileMenu
        └── Page Outlet

Shared UI
├── FormField              후보, 인증 페이지로 먼저 검증
├── ConfirmModal           확정
├── LoadingView            확정, 인증 초기화 전용
├── AuthInitializationError 확정, 인증 초기화 실패 전용
├── Toast                  후보
└── ImagePreviewList       후보
```

## 7. 변경 기록

| 날짜 | 변경 내용 | 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 전체 페이지 최초 중복 분석 작성 | React 공통화 경계를 구현 전에 설정하기 위함 | 로그인 컴포넌트 설계 및 공통 기반 이전의 기준으로 사용 |
| 2026-07-19 | Access Token 모듈 저장소에 구독 API를 추가하고 `AuthContext`가 `useSyncExternalStore`로 사용하도록 변경 | 로그인 외에 자동 재발급·재발급 실패에서도 API client 토큰과 React 인증 상태가 즉시 일치해야 함 | 토큰의 실제 저장 위치는 유지하면서 이중 state 불일치 제거 |
| 2026-07-19 | 인증 페이지 공통 Header 동작을 `useHeaderControls`로 분리 | 로그인 이후 여섯 페이지에서 프로필 메뉴 상태와 로그아웃 처리 코드가 반복됨 | 페이지는 사용자별 Header props만 전달하고 공통 메뉴·로그아웃 동작을 한 곳에서 관리 |
| 2026-07-23 | 인증 초기화 전용 `LoadingView`와 `AuthInitializationError`를 공통 feedback 컴포넌트로 추가 | 초기화 지연 시 빈 화면이 보이고 비401 조회 실패 시 `user` 없이 페이지가 렌더링되는 문제를 막기 위함 | `ProtectedRoute`가 초기화 중에는 로딩 화면, 토큰이 남은 실패에는 재시도 화면, 성공 시에만 Outlet을 렌더링 |
| 2026-07-23 | 두 인증 상태 화면에 로그인 화면의 코드 한입 테마를 재사용 | 보호 화면 진입 전 상태도 서비스의 시각 언어와 일관되어야 함 | 배경·브랜드·민트 포인트를 유지하고 로딩 상태에는 CSS spinner와 `role="status"`, 오류 상태에는 `role="alert"` 적용 |
