# 게시글 상세 React 컴포넌트 및 Props 설계

## 1. 목표와 단계

기존 한 파일의 조회와 mutation을 한 번에 이전하지 않는다.

1. 상세·이미지·댓글 조회
2. 좋아요
3. 댓글 작성·수정·삭제
4. 게시글 수정 이동·삭제

각 단계가 끝날 때 관련 체크리스트를 검증한다.

## 2. 권장 구조

```text
ProtectedRoute
└── AppLayout
    └── PostDetailPage
        ├── PostDetailArticle
        │   ├── LikeButton
        │   ├── PostDetailHeader
        │   ├── PostImageGallery
        │   └── PostContent
        ├── CommentSection
        │   ├── CommentForm
        │   └── CommentList
        │       └── CommentCard × N
        └── ConfirmModal
```

`AppLayout`, `Header`, `ProfileMenu`, `ProfileImage`와 표시 utility는 목록 구현을 재사용한다.

## 3. `PostDetailPage`

책임:

- `postId` Route param 검증
- 상세 조회와 오류 이동
- post 데이터의 단일 소유
- mutation 성공 후 재조회
- 댓글 수정 대상과 삭제 대상 상태 관리
- 하위 컴포넌트 조합

Route에서 직접 렌더링하므로 props는 받지 않는다.

```ts
type PostDetailPageState = {
  post: PostDetail | null;
  isLoading: boolean;
  editingCommentId: number | null;
  deleteTarget: { type: 'post' | 'comment'; commentId?: number } | null;
  isLikeSubmitting: boolean;
  isCommentCreating: boolean;
  isCommentUpdating: boolean;
  isDeleteSubmitting: boolean;
};
```

## 4. 조회 표현 컴포넌트

### `PostDetailArticle`

```ts
type PostDetailArticleProps = {
  post: PostDetail;
  onLike: () => void;
  isLikeSubmitting: boolean;
  onDeletePost: () => void;
};
```

숨김 여부에 따른 제목·본문·하위 영역 제한을 조합한다.

### `PostDetailHeader`

```ts
type PostDetailHeaderProps = {
  post: PostDetail;
  onDelete: () => void;
};
```

작성자, 날짜, 수정 라벨, 통계와 작성자 전용 버튼을 표시한다.

### `PostImageGallery`

```ts
type PostImageGalleryProps = {
  imagePaths: string[];
  fallbackSrc: string;
};
```

현재 index는 갤러리 내부 state로 관리한다. `imagePaths`가 바뀌면 index를 0으로 되돌리고 범위를 보정한다. navigation과 이미지 오류 fallback을 담당한다.

## 5. 댓글 컴포넌트

### `CommentSection`

```ts
type CommentSectionProps = {
  comments: Comment[];
  editingComment: Comment | null;
  isSubmitting: boolean;
  onCreate: (content: string) => Promise<void>;
  onUpdate: (commentId: number, content: string) => Promise<void>;
  onEditStart: (commentId: number) => void;
  onEditCancel: () => void;
  onDeleteRequest: (commentId: number) => void;
};
```

### `CommentForm`

입력값과 helper는 폼이 소유한다. 수정 대상이 바뀌면 기존 댓글 내용으로 동기화한다.

```ts
type CommentFormProps = {
  editingComment: Comment | null;
  isSubmitting: boolean;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
};
```

### `CommentList`, `CommentCard`

```ts
type CommentListProps = {
  comments: Comment[];
  onEdit: (commentId: number) => void;
  onDelete: (commentId: number) => void;
};

type CommentCardProps = {
  comment: Comment;
  onEdit: () => void;
  onDelete: () => void;
};
```

## 6. 공통 `ConfirmModal`

```ts
type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  isSubmitting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  initialFocus?: 'confirm' | 'cancel';
};
```

게시글 삭제, 댓글 삭제, 회원 탈퇴가 재사용한다. backdrop, Escape, 요청 중 닫기 차단, document listener cleanup을 공통으로 담당한다. focus trap과 trigger 포커스 복원은 기존에 없는 접근성 개선이므로 도입 시 변경 기록에 남긴다.

## 7. API 경계

기존 `postApi.js`에 상세 도메인 함수를 추가한다.

```ts
getPost(postId)
togglePostLike(postId)
deletePost(postId)
createComment(postId, content)
updateComment(postId, commentId, content)
deleteComment(postId, commentId)
```

컴포넌트는 endpoint 문자열과 공통 request 옵션을 알지 않는다.

## 8. utility

목록에서 만든 `formatPostCount`, 작성자 표시와 이미지 URL 처리를 재사용한다. 상세 날짜는 목록 날짜와 형식이 다르므로 별도 함수로 추가한다.

```js
formatPostDate('2026-07-19T12:34:56.000')
// '2026-07-19 12:34:56'
```

댓글 검증은 DOM을 받지 않는 순수 함수로 만든다.

```js
export const COMMENT_MAX_LENGTH = 50
export function validateComment(content) { /* error string */ }
```

## 9. 데이터 흐름

```text
/posts/:postId
→ ProtectedRoute
→ postId 검증
→ postApi.getPost(postId)
→ post state 저장
→ 상세·갤러리·댓글 선언적 렌더링

mutation
→ 요청별 pending 상태
→ 성공
   ├── 좋아요: 응답으로 post.like 상태만 갱신
   ├── 댓글: 상세 재조회
   └── 게시글 삭제: /posts 이동
→ 실패: 기존 state 유지 + 오류 UI
```

## 10. 구현 순서 및 AI 작업 리스팅

1. 상세 API와 날짜·댓글 검증 utility
2. `/posts/:postId` 보호 Route와 ID 검증
3. `PostDetailHeader`, `PostDetailArticle`
4. `PostImageGallery`
5. 읽기 전용 `CommentList`, `CommentCard`
6. 상세 조회 오류와 텍스트 UI 검증
7. `LikeButton` mutation
8. `CommentForm`과 댓글 작성·수정
9. `ConfirmModal`과 댓글·게시글 삭제
10. CSS 이전, lint/build, 체크리스트 브라우저 검증
11. 설계 변경과 이유 기록

## 11. 구현 완료 조건

- [ ] 잘못된 Route ID가 API 호출 없이 목록으로 이동한다.
- [ ] 상세 요청 중복이 차단되고 unmount 후 state를 갱신하지 않는다.
- [ ] 일반·숨김·탈퇴·작성자 게시글 표시가 일치한다.
- [ ] 이미지 0·1·여러 개와 오류 fallback이 일치한다.
- [ ] 댓글 일반·삭제·탈퇴·작성자 상태가 일치한다.
- [ ] 좋아요 상태와 수치가 응답으로 갱신된다.
- [ ] 댓글 등록·수정 모드와 검증 시점이 일치한다.
- [ ] 삭제 모달과 요청 중 차단이 일치한다.
- [ ] status/message별 alert와 이동이 일치한다.
- [ ] observer, document event 등 브라우저 자원이 cleanup된다.
- [ ] `checklist.md`에 결과를 기록한다.

## 12. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 게시글 상세 최초 컴포넌트와 props 설계 작성 | 조회와 mutation이 혼합된 Vanilla 파일을 단계별 React 책임으로 분리 | 상세 마이그레이션 구현 기준으로 사용 |
| 2026-07-19 | 상세 URL을 `/posts/:postId`로 확정 | 목록 카드가 이미 해당 Route로 연결되고 공통 라우팅 설계가 path param을 사용함 | query string 대신 `useParams`로 ID 검증 |
| 2026-07-19 | 상세 조회와 mutation 구현 단계를 분리 | 기존 전체 마이그레이션 계획에서 조회 기능을 변경 기능보다 먼저 검증하기로 했음 | 첫 단계는 GET 상세·갤러리·댓글 읽기만 구현 |
| 2026-07-19 | ID가 없는 `/posts`에서는 잘못된 상세 주소 alert를 적용하지 않음 | React에서 `/posts`는 이미 정상 목록 Route이며 Vanilla의 query 누락 상태와 구조적으로 다름 | 숫자가 아닌 값·0·음수·소수의 `:postId`만 상세 Route 오류로 처리 |
| 2026-07-19 | 공통 Header에 `logoClassName`, `backIconSrc` 추가 | 목록과 상세의 로고 CSS class가 다르고 상세는 기존 `back-button.png`를 사용해야 함 | AppLayout은 그대로 재사용하면서 페이지별 Header 스타일과 자산을 보존 |
| 2026-07-19 | 상세 조회 중복 상태를 `postId`별 Promise Map으로 관리 | Strict Mode의 같은 ID 중복 요청을 막으면서 Route param이 바뀌면 새 ID 요청은 독립적으로 실행해야 함 | 같은 ID 요청은 Promise를 공유하고 이전 ID 응답은 현재 화면 state를 덮어쓰지 않음 |
| 2026-07-19 | 별도 로딩 state 대신 `{ postId, post }` 결과와 현재 Route ID를 비교 | 기존 화면에는 로딩 UI가 없고 ID 전환 중 이전 게시글이 잠시 노출되면 안 됨 | 현재 ID와 일치하는 응답만 렌더링하며 대기 중에는 Header와 빈 상세 영역만 표시 |
| 2026-07-19 | 상세 응답마다 `renderVersion`을 증가시켜 갤러리 key로 전달 | Vanilla는 이미지 경로가 같아도 댓글 mutation 후 상세를 재조회할 때 갤러리 index를 0으로 초기화함 | 새 상세 응답이 반영될 때 `PostImageGallery`가 재마운트되어 index와 이미지 오류 상태를 초기화 |
| 2026-07-19 | 좋아요 중복 요청 차단에 `isLikeSubmitting`과 Promise ref를 함께 사용 | state가 반영되기 전 같은 event loop에서 연속 클릭되면 boolean 렌더링만으로 요청이 겹칠 수 있음 | Promise ref가 즉시 중복 실행을 차단하고 state는 버튼 disabled UI를 담당 |
| 2026-07-19 | `CommentForm`은 수정 대상 ID를 key로 사용해 등록·수정 모드를 재마운트 | prop을 effect로 input state에 복사하면 불필요한 동기화와 React Hooks 경고가 발생할 수 있음 | 수정 시작·취소 시 기존 내용 또는 빈 값으로 명확히 초기화 |
| 2026-07-19 | 댓글 요청도 pending state와 Promise ref를 함께 사용 | 등록·수정 버튼의 연속 제출을 렌더링 전 시점부터 차단해야 함 | state는 버튼 UI, Promise ref는 실제 네트워크 중복 방지를 담당 |
| 2026-07-19 | 수정 중인 댓글의 ID 대신 댓글 snapshot을 보관 | 수정 요청 404 후 상세 재조회에서 댓글이 사라져도 Vanilla는 입력값과 수정 모드를 유지함 | 성공·취소 전까지 수정 폼의 기존 내용과 모드를 유지하고 Route가 바뀌면 현재 페이지에 적용하지 않음 |
| 2026-07-19 | `ConfirmModal`이 닫힐 때 기존 trigger로 포커스 복원 | Vanilla는 초기 확인 포커스만 제공하지만 닫힌 뒤 키보드 사용자의 위치가 사라짐 | 취소·backdrop·Escape 후 삭제를 연 버튼으로 돌아가는 접근성 개선, focus trap은 아직 추가하지 않음 |
| 2026-07-19 | 삭제 대상에 `postId`를 함께 저장 | 모달이 열린 상태에서 Route param이 바뀌면 이전 페이지 대상을 삭제할 위험을 차단해야 함 | 현재 Route ID와 대상 ID가 일치할 때만 모달 표시와 삭제 실행 |
| 2026-07-19 | 삭제 요청도 pending state와 Promise ref를 함께 사용 | 확인 버튼 연속 실행과 요청 중 취소·Escape·backdrop 닫기를 동시에 차단해야 함 | Promise ref가 중복 요청·닫기를 즉시 막고 state가 두 버튼의 disabled UI를 담당 |
