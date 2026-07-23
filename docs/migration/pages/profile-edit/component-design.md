# 회원정보 수정 React 컴포넌트 및 Props 설계

## 1. 구현 단계

1. 사용자 PATCH/DELETE API와 닉네임 순수 검증
2. `AuthContext` 사용자 갱신·탈퇴 후 인증 초기화 API
3. 프로필 이미지 field와 Object URL 관리
4. `ProfileEditForm`과 변경 감지
5. 성공 toast
6. 공통 `ConfirmModal` 회원 탈퇴 연결
7. `ProfileEditPage` 오류와 `/profile/edit` 보호 Route
8. CSS 이전·범위 한정
9. lint/build 및 체크리스트 검증

## 2. 권장 구조

```text
ProtectedRoute
└── AppLayout
    └── ProfileEditPage
        ├── ProfileEditForm
        │   ├── ProfileEditImageField
        │   ├── ReadOnlyEmailField
        │   └── NicknameField
        ├── WithdrawalPanel
        ├── ConfirmModal
        └── StatusToast
```

`AppLayout`, Header, ProfileMenu, `ConfirmModal`, 이미지 URL utility와 인증 Context를 재사용한다.

## 3. `ProfileEditPage`

Route에서 직접 렌더링하므로 props는 받지 않는다.

책임:

- `AuthContext.user`를 form 초기값으로 제공
- PATCH·DELETE pending과 Promise ref 중복 차단
- 서버 nickname helper와 status/message 오류 처리
- PATCH 성공 사용자 snapshot과 Context 동기화
- toast 표시 시간 관리
- 탈퇴 modal 대상과 성공 후 인증 초기화·이동
- Header와 로그아웃 연결

```ts
type ProfileEditPageState = {
  serverNicknameError: string;
  isUpdating: boolean;
  isWithdrawalOpen: boolean;
  isDeleting: boolean;
  isToastVisible: boolean;
};
```

`user`가 없으면 form을 렌더링하지 않는다. 보호 Route 인증 실패 처리는 기존 정책에 맡긴다.

## 4. `AuthContext` 확장

현재 Context는 `user`를 읽을 수 있지만 외부에서 갱신할 함수가 없다. 다음 API를 추가한다.

```ts
updateCurrentUser: (user: User) => void;
```

PATCH 성공 응답을 정규화한 뒤 호출해 Header, 이후 페이지와 form이 같은 사용자를 보게 한다. `setUser` 자체를 노출하지 않고 의미가 있는 도메인 함수만 제공한다.

회원 탈퇴 성공 시에는 기존 `clearAuth()`를 호출해 메모리 Access Token과 Context 사용자를 함께 제거한다.

## 5. 사용자 API

`userApi.js`에 추가한다.

```js
updateCurrentUser({ nickname, profileImage })
deleteCurrentUser()
```

PATCH 함수는 `result?.data`를 반환하고 DELETE는 body를 사용하지 않는다.

## 6. 닉네임 검증

회원가입과 같은 최대 길이 상수를 공유하되, 페이지 helper 문구를 반환하는 순수 함수를 만든다.

```js
export function validateNickname(nickname) {
  // 빈 값, ASCII 공백, 10자 초과, 유효하면 빈 문자열
}
```

기존 `authValidation.isValidNickname()`은 boolean 버튼 계산에 재사용할 수 있다. helper 생성 함수는 DOM을 받지 않는다.

## 7. `ProfileEditForm`

```ts
type ProfileEditFormValues = {
  nickname: string;
  profileFile: File | null;
};

type ProfileEditFormProps = {
  user: User;
  isSubmitting: boolean;
  serverNicknameError: string;
  onClearServerError: () => void;
  onSubmit: (values: ProfileEditFormValues) => Promise<void>;
  onWithdrawalRequest: () => void;
};
```

책임:

- 원본 nickname·profileImage snapshot
- controlled nickname과 선택 File
- blur·submit validation
- 원본 대비 변경 감지
- email 읽기 전용 표시
- 프로필 image field와 탈퇴 panel 조합
- 실패 시 입력과 미리보기 유지

PATCH 성공 후 응답 user가 바뀌면 `key` 또는 명시적 성공 snapshot 갱신으로 원본을 교체한다. 단순 effect 복사로 사용자의 입력을 덮어쓰지 않는다.

## 8. `ProfileEditImageField`

회원가입 `ProfileImageField`는 이미지가 필수이고 선택 이미지를 다시 선택하면 제거하는 UX라 수정 화면과 계약이 다르다. 수정 전용 컴포넌트를 사용한다.

```ts
type ProfileEditImageFieldProps = {
  originalImagePath: string;
  selectedFile: File | null;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
};
```

- 파일 미선택 시 원본 URL 또는 CSS 기본 아이콘
- 선택 시 Object URL
- 숨겨진 단일 file input
- 선택 변경·unmount 시 URL 반환

Object URL 생명주기는 기존 `useObjectUrls`를 단일 파일에도 재사용하거나 `useObjectUrl`로 얇게 분리한다. 구현 시 더 단순한 방식을 선택하고 기록한다.

## 9. 완료 toast

```ts
type StatusToastProps = {
  isVisible: boolean;
  children: ReactNode;
};
```

`role="status"`와 profile style class를 제공한다. Page가 2초 timer를 소유하고 연속 성공·unmount에서 `clearTimeout`한다. 다른 페이지에서 toast 수요가 확인되면 공통 component로 승격한다.

## 10. 회원 탈퇴

`WithdrawalPanel`은 문구와 modal open trigger만 담당한다.

```ts
type WithdrawalPanelProps = {
  onRequest: () => void;
};
```

기존 `ConfirmModal`에 회원 탈퇴 문구를 전달한다. 정확한 profile modal style을 위해 필요하면 다음 optional props만 추가한다.

```ts
backdropClassName?: string;
className?: string;
```

modal의 focus, backdrop, Escape, pending 차단과 trigger focus 복원은 공통 구현을 그대로 재사용한다.

## 11. 데이터 흐름

```text
/profile/edit
→ ProtectedRoute initializeAuth
├─ 조회 중 → LoadingView
├─ 성공 → AuthContext.user → ProfileEditForm 초기값
├─ 401·토큰 없음 → clearAuth → /login
└─ 500·기타·네트워크 오류
   → AuthInitializationError
   → 다시 시도
      ├─ 성공 → AuthContext.user → ProfileEditForm 초기값
      ├─ 401·토큰 없음 → clearAuth → /login
      └─ 재실패 → 오류 화면 유지

PATCH
→ trim nickname
→ profileFile ? file.name : originalProfileImage
→ userApi.updateCurrentUser
→ 성공 user 정규화
→ AuthContext.updateCurrentUser
→ form snapshot·Header 갱신
→ Object URL 정리 + 2초 toast

DELETE
→ ConfirmModal
→ userApi.deleteCurrentUser
→ clearAuth
→ /login
```

## 12. 예정 디렉터리

```text
react-app/src/features/profile/
├── edit/
│   ├── components/
│   │   ├── ProfileEditForm.jsx
│   │   ├── ProfileEditImageField.jsx
│   │   ├── WithdrawalPanel.jsx
│   │   └── StatusToast.jsx
│   ├── utils/
│   │   └── profileValidation.js
│   └── ProfileEditPage.jsx

react-app/src/styles/
└── profile-edit.css
```

## 13. 구현 완료 조건

- [ ] `/profile/edit`가 보호 Route로 동작한다.
- [ ] Context 사용자로 form을 한 번 초기화한다.
- [ ] 이메일은 변경할 수 없다.
- [ ] 닉네임 검증과 원본 대비 변경 감지가 일치한다.
- [ ] 기존 이미지 유지·새 파일명 교체가 일치한다.
- [ ] Object URL을 변경·성공·unmount에서 반환한다.
- [ ] PATCH 연속 요청이 차단된다.
- [ ] 성공 응답으로 form·Header·Context를 동기화한다.
- [ ] toast 표시·재시작·cleanup이 동작한다.
- [ ] 탈퇴 modal과 DELETE 중복·닫기 차단이 동작한다.
- [ ] 탈퇴 성공 후 인증 상태를 제거한다.
- [ ] 오류별 helper, alert와 이동이 일치한다.
- [ ] CSS·접근성 기준을 충족한다.
- [ ] `checklist.md`에 결과를 기록한다.

## 14. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 회원정보 수정 최초 컴포넌트와 props 설계 작성 | 조회·PATCH·Context 동기화·탈퇴 책임을 React 단위로 분리 | 회원정보 수정 구현 기준으로 사용 |
| 2026-07-19 | React 초기 데이터 원천을 `AuthContext.user`로 설계 | 보호 Route가 이미 `/users/me`를 호출하므로 페이지에서 같은 GET을 반복할 필요가 없음 | 인증 초기화 완료 전 form 미표시, 완료 후 Context user로 한 번 초기화 |
| 2026-07-19 | Context에 도메인 함수 `updateCurrentUser` 추가 예정 | PATCH 성공 후 Header와 다른 화면의 사용자 정보를 즉시 동기화해야 하며 raw `setUser` 노출은 피해야 함 | 성공 응답 한 번으로 form과 전역 인증 사용자 갱신 |
| 2026-07-19 | 회원가입 `ProfileImageField`를 직접 재사용하지 않음 | 회원가입은 이미지 필수·선택 제거 UX이고 수정은 기존 이미지 fallback·선택 교체 UX임 | 수정 전용 image field를 두고 URL utility만 재사용 |
| 2026-07-19 | 회원 탈퇴에 공통 `ConfirmModal` 재사용 | 초기 focus, Escape, backdrop, pending 닫기 차단과 focus 복원이 이미 구현됨 | 정확한 UI 격리가 필요하면 className props만 최소 확장 |
| 2026-07-19 | 게시글 전용 `useObjectUrls`를 `src/hooks` 공통 경로로 이동 | 게시글 다중 이미지와 프로필 단일 이미지가 같은 Object URL 생성·교체·unmount cleanup을 필요로 함 | 게시글 import를 공통 hook으로 변경하고 프로필 수정도 동일한 자원 관리 로직을 재사용 |
| 2026-07-19 | 닉네임 input에 helper·안내 `aria-describedby`와 오류 `aria-invalid` 적용 | Vanilla의 시각 문구를 입력과 프로그램적으로 연결해 오류와 입력 규칙을 스크린 리더에 전달 | 기존 화면 문구와 배치는 유지하면서 접근성을 개선 |
| 2026-07-19 | 회원 탈퇴 CSS의 action·button selector를 공통 `ConfirmModal` class에 맞게 변경 | 공통 modal 재사용 시 Vanilla 전용 button class가 렌더링되지 않으며 전용 props를 추가하면 API가 불필요하게 복잡해짐 | 색상·크기·간격 값은 유지하고 `.withdrawal-modal` 아래에서 공통 modal 요소에 적용 |
| 2026-07-23 | 인증 초기화 상태를 `LoadingView`·`AuthInitializationError`·Outlet으로 분리 | 사용자 조회 지연에는 흰 화면이, 비401 실패에는 `user` 없는 회원정보 화면이 노출됨 | 조회 중에는 로딩 화면, 성공 시에만 form, 비401 실패에는 재시도 화면을 표시 |
| 2026-07-23 | 인증 상태 화면에 코드 한입 테마와 접근성 상태를 적용 | 로그인 직후의 전환 화면도 기존 인증 화면과 시각적으로 연결하고 상태 변화를 보조기기에 전달하기 위함 | 로딩은 `role="status"`·`aria-live="polite"`, 오류는 `role="alert"`·`aria-live="assertive"` 사용 |
