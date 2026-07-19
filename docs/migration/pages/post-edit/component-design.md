# 게시글 수정 React 컴포넌트 및 Props 설계

## 1. 구현 단계

1. 수정 API 함수와 Route ID 검증
2. `ExistingImageList`와 수정 전용 이미지 picker
3. 초기값을 받는 `PostEditForm`
4. `PostEditPage` GET/PATCH 상태와 오류 연결
5. `/posts/:postId/edit` 보호 Route
6. `post-edit.css` 이전·범위 한정
7. lint/build 및 체크리스트 검증

## 2. 권장 구조

```text
ProtectedRoute
└── AppLayout
    └── PostEditPage
        └── PostEditForm
            ├── 제목·내용 field
            ├── ExistingImageList
            ├── EditPostImagePicker
            │   └── 새 이미지 preview list
            └── 수정하기 버튼
```

공통 `AppLayout`, Header, 인증 Context, `postValidation.js`, `useObjectUrls.js`, `resolveImageUrl()`을 재사용한다.

## 3. `PostEditPage`

Route에서 직접 렌더링하므로 props는 받지 않는다.

책임:

- `postId` Route param 양의 정수 검증
- 같은 ID의 GET 중복 요청 차단
- 초기 게시글 snapshot 소유
- GET/PATCH pending과 unmount 안전성
- PATCH payload의 기존 이미지 유지·새 이미지 교체 결정
- 조회·수정 status/message 오류와 이동
- Header와 로그아웃 연결

```ts
type EditablePost = {
  title: string;
  content: string;
  imageUrls: string[];
};

type PostEditPageState = {
  loadedPost: { postId: number; post: EditablePost } | null;
  isLoading: boolean;
  isSubmitting: boolean;
  serverErrors: { title?: string; content?: string };
};
```

이전 상세 구현처럼 `postId`별 Promise Map 또는 ref를 사용해 Strict Mode의 같은 GET을 공유한다. 현재 Route ID와 응답 ID가 일치할 때만 form을 렌더링한다.

## 4. 작성 `PostForm`을 직접 재사용하지 않는 이유

작성과 수정은 검증 규칙이 같지만 UI와 상태 계약이 다르다.

| 구분 | 작성 | 수정 |
|---|---|---|
| 초기값 | 빈 값 | GET 응답 |
| 레이아웃 | 대형 투명 editor | 중앙 card form |
| 이미지 | 새 파일만 | 기존 이미지 + 선택적 전체 교체 |
| 버튼 | 하단 고정 `완료` | card 내부 `수정하기` |
| 성공 | 응답 ID 또는 목록 | 현재 상세 |

현재 `PostForm`에 `variant`, heading, class, 기존 이미지, 버튼 위치 props를 모두 추가하면 조건 분기가 UI 대부분을 차지한다. `PostEditForm`을 별도로 두고 순수 validation과 URL hook을 공유하는 편이 책임이 명확하다. 추후 작성·수정 UI가 통합되면 공통 field 단위로 다시 추출한다.

## 5. `PostEditForm`

```ts
type PostEditFormValues = {
  title: string;
  content: string;
  imageFiles: File[];
};

type PostEditFormProps = {
  initialValues: {
    title: string;
    content: string;
    imageUrls: string[];
  };
  isSubmitting: boolean;
  serverErrors: { title?: string; content?: string };
  onClearServerError: (field: 'title' | 'content') => void;
  onSubmit: (values: PostEditFormValues) => Promise<void>;
};
```

책임:

- GET 응답을 최초 controlled state로 초기화
- 작성과 같은 blur·submit 검증
- 기존 이미지와 새 파일 선택 UI 조합
- 폼 유효성과 pending으로 버튼 disabled 계산
- 실패 시 모든 입력과 이미지 상태 유지

현재 Route ID가 바뀌면 `key={postId}`로 form을 재마운트하여 새 초기값을 정확히 반영한다. effect로 props를 input state에 복사하지 않는다.

## 6. `ExistingImageList`

```ts
type ExistingImageListProps = {
  imagePaths: string[];
};
```

- 빈 배열이면 section을 렌더링하지 않는다.
- 공통 `resolveImageUrl`로 `src`를 만든다.
- 오류가 난 이미지 index를 내부 state로 숨긴다.
- alt에 1부터 시작하는 응답 순번을 유지한다.

React에서는 DOM node를 직접 제거하지 않고 오류 index를 state로 관리해 선언적으로 미렌더링한다. 화면 결과는 동일하다.

## 7. `EditPostImagePicker`

```ts
type EditPostImagePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
};
```

작성용 `useObjectUrls`를 재사용하지만 수정 전용 class와 안내 문구를 렌더링한다.

- 미선택: 기존 이미지 유지 문구
- 선택: 파일명 목록 + 전체 교체 문구
- preview class: `new-image-preview`, `new-post-image`

작성용 `PostImagePicker`에 다수의 문구·class props를 추가하지 않는다. 둘의 공통 핵심은 hook으로 이미 분리되어 있다.

## 8. API 경계

기존 `postApi.js`에 다음 함수를 추가한다.

```js
updatePost(postId, { title, content, imageUrls })
```

초기 조회는 기존 `getPost(postId)`를 재사용한다. API module이 endpoint, method, JSON 직렬화를 소유하고 PATCH 성공 body는 반환하지 않아도 된다.

## 9. payload 결정

```js
const imageUrls = imageFiles.length > 0
  ? imageFiles.map((file) => file.name)
  : existingImageUrls
```

제목·내용은 trim하여 전송한다. 새 파일 선택 여부만 교체 조건이며 실제 파일 내용은 업로드하지 않는다.

## 10. 데이터 흐름

```text
/posts/:postId/edit
→ ProtectedRoute
→ postId 검증
→ getPost(postId)
→ 성공한 현재 ID만 PostEditForm mount
→ initial title/content/existing images

submit
→ 순수 검증
→ 새 File[] 있음?
   ├── 예: File.name[]
   └── 아니오: 기존 imageUrls[]
→ updatePost(postId, payload)
→ 성공: /posts/:postId
→ 실패: 입력 유지 + helper/alert/오류별 이동
```

## 11. 예정 디렉터리

```text
react-app/src/features/posts/
├── edit/
│   ├── components/
│   │   ├── ExistingImageList.jsx
│   │   ├── EditPostImagePicker.jsx
│   │   └── PostEditForm.jsx
│   └── PostEditPage.jsx
└── editor/
    ├── hooks/useObjectUrls.js
    └── utils/postValidation.js

react-app/src/styles/
└── post-edit.css
```

## 12. 구현 완료 조건

- [ ] `/posts/:postId/edit`가 보호 Route로 동작한다.
- [ ] 잘못된 ID는 GET 없이 목록으로 이동한다.
- [ ] GET 완료 전 form이 노출되지 않는다.
- [ ] 초기 제목·내용·기존 이미지가 응답과 일치한다.
- [ ] 작성과 동일한 validation 규칙을 재사용한다.
- [ ] 새 파일 미선택 시 기존 이미지 배열을 보존한다.
- [ ] 새 파일 선택 시 파일명 배열로 전체 교체한다.
- [ ] 기존 이미지 오류와 새 Object URL cleanup이 동작한다.
- [ ] GET/PATCH 중복 요청이 차단된다.
- [ ] PATCH 성공 후 현재 상세로 이동한다.
- [ ] 오류별 helper, alert와 이동이 일치한다.
- [ ] 반응형 UI와 접근성 기준을 충족한다.
- [ ] `checklist.md`에 결과를 기록한다.

## 13. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 게시글 수정 최초 컴포넌트와 props 설계 작성 | Vanilla의 초기 조회·기존 이미지·PATCH 책임을 React 단위로 분리 | 수정 마이그레이션 구현 기준으로 사용 |
| 2026-07-19 | 수정 Route를 `/posts/:postId/edit`로 확정 | 상세 화면의 기존 수정 Link와 REST형 Route 설계가 이미 해당 경로를 사용함 | `useParams`로 ID 검증하고 뒤로가기는 현재 상세로 연결 |
| 2026-07-19 | 작성 `PostForm` 대신 `PostEditForm`을 별도로 설계 | 작성·수정의 레이아웃, 초기값, 이미지와 버튼 계약이 달라 variant 분기가 UI 대부분을 차지함 | validation utility와 Object URL hook만 공유하고 수정 UI 책임을 독립시킴 |
| 2026-07-19 | 기존 이미지 로드 실패를 DOM 제거 대신 오류 index state로 처리 예정 | React에서 직접 DOM을 변경하면 선언적 렌더링과 충돌할 수 있음 | 실패한 이미지만 미렌더링해 기존 화면 결과를 보존 |
| 2026-07-19 | 새 이미지 선택 시 전체 교체 계약 유지 | Vanilla가 기존 배열과 새 파일명을 병합하지 않으며 백엔드의 부분 이미지 API가 확인되지 않음 | 미선택은 기존 배열, 선택은 새 `File.name[]` 전송 |
| 2026-07-19 | 수정 폼 helper에 `aria-describedby`, 오류 입력에 `aria-invalid` 적용 | Vanilla의 시각 helper를 입력과 프로그램적으로 연결해 스크린 리더가 오류 상태를 인식하도록 개선 | 기존 레이아웃과 문구는 유지하면서 접근성 체크리스트 기준을 충족 |
| 2026-07-19 | 수정 CSS의 Header·이미지 upload 공통 class를 수정 page 아래로 한정 | Vite 전역 CSS 번들에서 작성 페이지의 같은 class와 속성이 합쳐지는 충돌을 방지해야 함 | 스타일 값은 유지하고 수정 화면 selector만 적용되도록 범위를 격리 |
