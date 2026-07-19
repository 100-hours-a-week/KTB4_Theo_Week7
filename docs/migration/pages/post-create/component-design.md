# 게시글 작성 React 컴포넌트 및 Props 설계

## 1. 목표와 구현 단계

1. 작성 검증 utility와 API 함수
2. 이미지 Object URL 관리 hook
3. 작성 폼과 이미지 선택 UI
4. `PostCreatePage` 상태·오류·이동 연결
5. `/posts/new` 보호 Route와 CSS 연결
6. lint/build 및 체크리스트 검증

## 2. 권장 구조

```text
ProtectedRoute
└── AppLayout
    └── PostCreatePage
        └── PostForm
            ├── PostTitleField
            ├── PostContentField
            ├── PostImagePicker
            │   └── ImagePreviewList
            └── PostSubmitBar
```

`AppLayout`, `Header`, `ProfileMenu`과 `ProfileImage`는 목록·상세 구현을 재사용한다.

작은 제목·내용 field를 처음부터 반드시 별도 파일로 나눌 필요는 없다. 상태와 markup이 단순한 동안 `PostForm` 내부에 유지하고, 게시글 수정 화면에서 같은 UI를 재사용할 때 공통 `PostEditorForm`으로 추출한다. 이는 파일 수를 늘리는 것보다 실제 재사용 계약이 확인된 뒤 공통화하기 위한 선택이다.

## 3. `PostCreatePage`

책임:

- 공통 `AppLayout`과 작성 폼 조합
- 현재 사용자, 프로필 메뉴와 로그아웃 연결
- `POST /posts` 실행
- status/message별 서버 오류를 field error 또는 alert로 변환
- 성공 응답의 `postId` 유무에 따른 이동
- 같은 event loop의 연속 제출까지 차단

Route에서 직접 렌더링하므로 props는 받지 않는다.

```ts
type PostCreatePageState = {
  serverErrors: {
    title?: string;
    content?: string;
  };
  isSubmitting: boolean;
};
```

중복 요청 차단은 화면 표시용 `isSubmitting`과 즉시 실행 차단용 Promise ref를 함께 사용한다. React state 반영 전 연속 submit에서도 요청이 겹치지 않아야 한다.

## 4. `PostForm`

폼 입력과 클라이언트 helper의 소유자다.

```ts
type PostFormValues = {
  title: string;
  content: string;
  imageFiles: File[];
};

type PostFieldErrors = {
  title?: string;
  content?: string;
};

type PostFormProps = {
  isSubmitting: boolean;
  serverErrors: PostFieldErrors;
  onSubmit: (values: PostFormValues) => Promise<void>;
};
```

책임:

- controlled 제목·내용 state
- blur와 submit 시 순수 검증 실행
- 입력 시 폼 유효성 및 버튼 상태 계산
- 서버 field error 표시
- 실패 시 모든 입력 상태 유지
- 성공 후에는 Route가 이동하므로 별도 초기화하지 않음

서버 오류와 로컬 오류가 동시에 존재하면 최근 사용자 입력/blur 검증을 우선한다. 사용자가 해당 field를 다시 입력하면 그 field의 서버 오류를 지울 수 있도록 Page에 callback을 추가하거나 오류 state를 Form으로 통합할 수 있다. 실제 구현에서 한 방식을 선택하고 변경 기록에 남긴다.

## 5. `PostImagePicker`

```ts
type PostImagePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};
```

책임:

- `accept="image/*"`, `multiple` file input
- FileList를 배열로 변환
- 파일명 목록과 미리보기 렌더링
- 이미지가 없을 때 초기 문구 표시

파일 input은 보안상 value를 완전한 controlled state로 만들지 않고, 선택 결과인 `File[]`만 부모 폼 state에 전달한다.

## 6. `useObjectUrls`와 `ImagePreviewList`

```ts
type ImagePreview = {
  file: File;
  url: string;
};

function useObjectUrls(): {
  previews: ImagePreview[];
  replaceFiles: (files: File[]) => void;
};

type ImagePreviewListProps = {
  previews: ImagePreview[];
};
```

hook 책임:

- 파일 선택 event에서 `replaceFiles(files)`로 새 Object URL 생성
- 다음 `replaceFiles` 호출 전 이전 URL 반환
- unmount 시 남은 URL 반환

`ImagePreviewList`는 순서대로 `<img>`를 렌더링하고 `${file.name} 미리보기`를 alt로 사용한다. 현재 Vanilla와 동일하게 별도 삭제 버튼이나 fallback은 제공하지 않는다.

## 7. `PostSubmitBar`

```ts
type PostSubmitBarProps = {
  disabled: boolean;
};
```

폼 내부 submit 버튼을 화면 하단 고정 bar로 표현한다. 문구는 요청 중에도 `완료`로 유지한다. 단순 markup이면 `PostForm` 내부에 두고 별도 컴포넌트 파일을 만들지 않아도 된다.

## 8. 검증 utility

DOM 요소를 받는 Vanilla 검증 함수를 React용 순수 함수로 옮긴다.

```js
export const POST_TITLE_MAX_LENGTH = 26

export function validatePostTitle(title) {
  // 빈 문자열 또는 길이 오류 문구, 유효하면 빈 문자열
}

export function validatePostContent(content) {
  // 빈 문자열 오류 문구, 유효하면 빈 문자열
}

export function isPostFormValid({ title, content }) {
  // 두 field가 모두 유효한지 반환
}
```

게시글 수정 화면도 같은 규칙을 사용하므로 `features/posts/editor/utils/postValidation.js`처럼 작성·수정 공통 영역에 둔다.

## 9. API 경계

기존 `postApi.js`에 다음 함수를 추가한다.

```js
createPost({ title, content, imageUrls })
```

API 함수가 `POST /posts`, JSON 직렬화와 `result?.data` 반환을 담당한다. Page와 Form은 endpoint 문자열과 공통 request 옵션을 알지 않는다.

## 10. 데이터 흐름

```text
/posts/new
→ ProtectedRoute 인증 초기화
→ PostCreatePage
→ PostForm이 title/content/files 소유
→ 순수 검증 결과로 helper와 disabled 계산
→ submit
   → trim title/content
   → files.map(file.name)
   → postApi.createPost(payload)
   → 성공: /posts/:postId 또는 /posts
   → 실패: 입력 유지 + field helper 또는 alert

files 변경 또는 unmount
→ 이전 Object URL 전부 revoke
```

## 11. 예정 디렉터리

```text
react-app/src/features/posts/
├── editor/
│   ├── components/
│   │   ├── PostForm.jsx
│   │   ├── PostImagePicker.jsx
│   │   └── ImagePreviewList.jsx
│   ├── hooks/
│   │   └── useObjectUrls.js
│   └── utils/
│       └── postValidation.js
└── create/
    └── PostCreatePage.jsx

react-app/src/styles/
└── post-create.css
```

작성·수정 공통 editor는 지금부터 공통 위치에 두되, 수정 페이지 요구가 확인되기 전 과도한 props나 기능을 미리 넣지 않는다.

## 12. 구현 완료 조건

- [ ] `/posts/new`가 보호 Route로 동작한다.
- [ ] 제목·내용 validation 문구와 시점이 기존과 일치한다.
- [ ] 폼 유효성과 pending 상태가 완료 버튼에 반영된다.
- [ ] 이미지 파일명과 미리보기 순서가 일치한다.
- [ ] 파일 변경과 unmount에서 모든 Object URL을 반환한다.
- [ ] 요청 payload가 trim 문자열과 파일명 배열을 사용한다.
- [ ] 빠른 연속 제출에도 POST 요청은 한 번이다.
- [ ] 성공 응답의 ID 유무에 따라 올바르게 이동한다.
- [ ] 오류별 helper, alert와 이동이 일치한다.
- [ ] 입력 실패 상태가 보존된다.
- [ ] 공통 Header와 반응형 UI가 기존 기준선과 일치한다.
- [ ] `checklist.md`에 결과를 기록한다.

## 13. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 게시글 작성 최초 컴포넌트와 props 설계 작성 | Vanilla의 DOM·전역 상태·API 책임을 React 폼과 Page 책임으로 분리 | 작성 마이그레이션 구현 기준으로 사용 |
| 2026-07-19 | 작성 Route를 `/posts/new`로 제안 | REST 형태의 목록·상세 Route와 자연스럽게 연결하고 query string이 필요하지 않음 | Router에서 상세 `:postId`와 충돌하지 않도록 정적 Route로 등록 |
| 2026-07-19 | 이미지 업로드를 multipart로 변경하지 않고 파일명 JSON 계약 유지 | Vanilla와 백엔드의 현재 계약 외에 실제 업로드 API가 확인되지 않음 | 미리보기만 Object URL을 사용하고 요청은 `imageUrls: string[]` 유지 |
| 2026-07-19 | 작성·수정 공통 editor 디렉터리를 사용하되 작은 field는 우선 Form 내부에 유지 | 게시글 수정에서도 검증·폼·이미지 UI 재사용 가능성이 높지만 아직 구체 계약이 확정되지 않음 | 재사용 가능한 로직만 공통화하고 과도한 컴포넌트 분리는 보류 |
| 2026-07-19 | helper의 `aria-describedby`, 오류의 `aria-invalid`를 React 개선 후보로 기록 | Vanilla의 시각 helper는 입력과 프로그램적으로 연결되지 않음 | 구현 시 기존 UI를 바꾸지 않고 접근성을 개선하며 적용 사실을 변경 기록에 추가 |
| 2026-07-19 | `useObjectUrls(files)` 대신 `replaceFiles(files)` 명령형 갱신 API 사용 | React 19 lint가 effect 내부의 동기적 파생 state 갱신을 금지하며, Object URL은 파일 선택 event에서 생성하는 편이 자원 생명주기가 명확함 | 파일 선택 시 이전 URL을 즉시 반환하고 새 preview state를 한 번 갱신하며 unmount cleanup은 effect가 담당. 이후 프로필 수정에서도 재사용되어 `src/hooks`로 이동 |
| 2026-07-19 | 제목·내용 helper에 `aria-describedby`, 오류 상태에 `aria-invalid` 적용 | 시각적 UI는 유지하면서 스크린 리더가 입력과 오류 문구의 관계를 인식하도록 개선 | Vanilla에는 없는 접근성 보강이며 체크리스트의 접근성 기대 조건으로 검증 |
| 2026-07-19 | 작성 CSS의 `.header-back-link` selector를 `.make-post-header` 아래로 한정 | Vite가 페이지별 CSS를 하나의 전역 번들로 묶으므로 상세 페이지의 같은 class selector와 서로 덮어쓸 수 있음 | 스타일 값은 유지하면서 작성 Header에만 적용되어 페이지 간 CSS 회귀를 방지 |
| 2026-07-19 | 작성 CSS의 이미지 upload 공통 class도 `.make-post-page` 아래로 한정 | 수정 페이지가 `.post-image-upload-area`, `.post-image-label`을 함께 사용해 두 페이지 속성이 합쳐질 수 있음 | 작성·수정 이미지 선택 영역의 레이아웃과 card 스타일을 서로 격리 |
