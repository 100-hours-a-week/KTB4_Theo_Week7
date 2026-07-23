# 게시글 목록 React 컴포넌트 및 Props 설계

## 1. 목표

기존 게시글 목록의 커서 페이지네이션, 카드 표시 규칙과 공통 Header를 React state와 JSX로 이전한다. 첫 페이지 조회를 먼저 완성한 후 IntersectionObserver를 연결한다.

## 2. 권장 구조

```text
ProtectedRoute
└── AppLayout
    ├── Header
    │   └── ProfileMenu
    └── PostListPage
        ├── 피드 제목과 PostWriteLink
        ├── PostList
        │   └── PostCard × N
        └── InfiniteScrollSentinel
```

빈 상태, 로딩 표시, 재시도 UI는 기존 화면에 없으므로 1차 동등성 구현의 필수 컴포넌트로 만들지 않는다.

## 3. `PostListPage`

책임:

- 목록 조회 상태와 커서 상태 소유
- 최초 조회와 추가 조회 실행
- 성공 응답을 기존 목록 뒤에 병합
- 오류 alert와 인증 실패 이동
- 제목·작성 링크·목록·sentinel 조합

Route에서 직접 렌더링하므로 props는 받지 않는다.

권장 상태:

```ts
type PostListState = {
  posts: PostSummary[];
  lastPostId: number | null;
  hasNext: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: unknown | null;
};
```

구현은 `isLoading` 하나로 시작할 수 있지만 최초 조회와 추가 조회 UI를 나중에 구분할 가능성이 있으므로 상태 의미는 분리해 설계한다. 요청 중복 방지는 ref 또는 상태와 AbortController를 함께 검토한다.

## 4. `PostList`

표현 책임만 가진다.

```ts
type PostListProps = {
  posts: PostSummary[];
  onPostClick?: (postId: number) => void;
};
```

권장안은 각 `PostCard`를 React Router `Link`로 렌더링하여 `onPostClick` 없이도 접근 가능한 전체 카드 링크를 만드는 것이다. 이 경우 props는 `posts`만 받는다.

```jsx
<PostList posts={visiblePosts} />
```

숨김 게시글 필터는 API 계층이 아니라 `PostListPage`의 파생 데이터 또는 PostList에서 처리한다. 원본 응답을 보존해야 서버 커서와 화면 필터를 혼동하지 않는다.

## 5. `PostCard`

```ts
type PostCardProps = {
  post: {
    postId: number;
    title: string;
    edited: boolean;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    createdAt: string;
    profileImage: string | null;
    nickname: string | null;
    authorDeleted: boolean;
  };
};
```

책임:

- 제목과 `수정됨` 표시
- 좋아요·댓글·조회수·날짜 표시
- 작성자 이미지와 닉네임 표시
- 전체 카드의 `/posts/{postId}` 이동 제공

수치와 날짜 변환 함수는 컴포넌트 밖 공통 utility로 이전한다.

## 6. `InfiniteScrollSentinel`

```ts
type InfiniteScrollSentinelProps = {
  hasNext: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  refreshKey?: number;
  rootMargin?: string;
};
```

책임:

- sentinel DOM ref 관리
- `IntersectionObserver` 생성과 cleanup
- 교차 시 조건을 확인하고 `onLoadMore` 호출

기본 `rootMargin`은 기존과 같은 `0px 0px 200px 0px`다. observer callback이 과거 state를 캡처하지 않도록 최신 callback ref 또는 안정된 `useCallback`을 사용한다.

`refreshKey`는 성공 응답으로 목록 길이가 변경됐을 때만 observer를 다시 연결한다. 요청 실패 후 로딩 상태만 해제됐을 때 sentinel이 계속 보인다는 이유로 같은 실패 요청이 즉시 반복되는 것을 방지한다.

목록 페이지에서만 쓰이고 코드가 짧다면 별도 컴포넌트 대신 `useInfiniteScroll` Hook으로 구현해도 된다. 구현 시 선택 이유를 변경 기록에 남긴다.

## 7. 공통 `AppLayout`, `Header`, `ProfileMenu`

게시글 목록에서 처음 구현하지만 상세·작성·수정·회원 관리 화면이 재사용할 공통 컴포넌트다.

### `AppLayout`

```ts
type AppLayoutProps = {
  children: ReactNode;
  headerClassName?: string;
  backTo?: string;
  backLabel?: string;
};
```

목록은 뒤로가기를 전달하지 않는다.

### `Header`

```ts
type HeaderProps = {
  profileImageUrl?: string;
  isProfileMenuOpen: boolean;
  onProfileMenuToggle: () => void;
  onProfileMenuClose: () => void;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  backTo?: string;
  backLabel?: string;
};
```

현재 사용자 정보와 인증 상태는 AppLayout 또는 AuthContext가 소유하고 Header는 표시와 이벤트 연결을 담당한다.

### `ProfileMenu`

```ts
type ProfileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
};
```

- 외부 클릭 시 닫기
- Escape 시 닫고 trigger 포커스 복원
- 회원정보·비밀번호 Route 링크
- 요청 중 로그아웃 중복 실행 방지

## 8. `ProfileImage` 공통 후보

```ts
type ProfileImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc: string;
};
```

Header와 PostCard 모두 서버 이미지 URL 변환과 로드 실패 fallback이 필요하므로 이번 단계에서 공통 컴포넌트로 도입할 가치가 있다. 크기와 테두리는 부모 CSS class가 담당한다.

로드에 실패한 원본 URL을 내부 state에 기록하고 `src`와 fallback class를 렌더 결과로 계산한다. 이미지 요소의 `src`나 `classList`를 직접 변경하지 않으며, 다른 `imagePath`가 전달되면 새 URL은 다시 로드를 시도한다.

## 9. API 경계

`postApi.js`를 추가한다.

```ts
type ReadPostListParams = {
  size?: number;
  lastPostId?: number | null;
};

function getPosts(params: ReadPostListParams): Promise<{
  posts: PostSummary[];
  hasNext: boolean;
  lastPostId: number | null;
}>;
```

API 함수는 URL 생성과 `result.data` 추출까지만 담당한다. 숨김 필터, 화면용 날짜·수치 변환, 목록 병합은 담당하지 않는다.

사용자 조회와 로그아웃은 각각 기존 `userApi.js`, `authApi.js`에 추가한다.

## 10. 데이터 흐름

```text
route /posts
→ ProtectedRoute 인증 확인
→ AppLayout이 현재 사용자와 Header 구성
→ PostListPage 첫 페이지 요청
→ postApi.getPosts({ size: 10 })
→ posts/hasNext/lastPostId 갱신
→ blinded 제외 후 PostList 렌더링
→ sentinel 교차
→ postApi.getPosts({ size: 10, lastPostId })
→ 이전 posts 뒤에 새 posts 병합
```

## 11. 구현 순서

1. 게시글 표시 utility와 `postApi.js`
2. `ProtectedRoute`의 인증 초기화 정책
3. `AppLayout`, `Header`, `ProfileMenu`, `ProfileImage`
4. `PostCard`, `PostList`
5. 첫 페이지 조회만 사용하는 `PostListPage`
6. `/posts` Route와 로그인 성공 이동 연결
7. 최초·빈 목록·오류 동등성 검증
8. 무한 스크롤 연결과 중복·종료 조건 검증
9. 반응형 CSS와 Vanilla 비교

## 12. AI 작업 리스팅

- 기존 DOM·이벤트·API 필드와 CSS breakpoint 대조
- `postApi.js`와 표시 utility 구현
- Header 공통 컴포넌트와 접근성 동작 구현
- 카드와 목록 컴포넌트 구현
- 커서 상태·중복 요청 방지 로직 구현
- IntersectionObserver Hook 또는 컴포넌트 구현
- 라우팅·인증 만료 흐름 연결
- lint/build 및 체크리스트 기반 브라우저 검증
- 기존 설계와 달라진 구현 및 이유 기록

## 13. 구현 완료 조건

- [ ] `/posts` 직접 진입과 새로고침에서 인증 복구가 동작한다.
- [ ] 첫 요청이 `size=10`으로 한 번 실행된다.
- [ ] 카드 데이터와 표시 형식이 Vanilla와 일치한다.
- [ ] 숨김 게시글과 탈퇴 작성자가 동일하게 처리된다.
- [ ] 추가 요청이 `lastPostId`를 사용하고 목록 뒤에 병합된다.
- [ ] 요청 중 observer가 반복되어도 같은 요청이 중복되지 않는다.
- [ ] 마지막 페이지 이후 요청하지 않는다.
- [ ] 추가 조회 실패 시 기존 목록을 유지한다.
- [ ] Header 프로필 fallback과 메뉴 키보드 동작이 일치한다.
- [ ] 로그아웃 성공·실패 동작이 일치한다.
- [ ] 카드·작성·회원 메뉴 링크가 React Route로 이동한다.
- [ ] `checklist.md`에 검증 결과를 기록한다.

## 14. 구현 중 변경 기록

| 날짜 | 변경 내용 | 변경 이유 | 영향 |
|---|---|---|---|
| 2026-07-19 | 게시글 목록 최초 컴포넌트와 props 설계 작성 | 기존 목록·Header·무한 스크롤 책임을 React 경계로 정의 | 구현 기준으로 사용 |
| 2026-07-19 | 상세 URL을 query string에서 `/posts/:postId`로 제안 | 전체 마이그레이션 공통 라우팅 설계와 일치시키고 식별자를 명시적 Route param으로 관리 | 상세 페이지 구현 시 기존 URL과 매핑 필요 |
| 2026-07-19 | 로딩·빈 상태 컴포넌트를 1차 필수 구조에서 제외 | 기존 Vanilla에 별도 화면이 없어 동등성 범위를 먼저 유지 | UX 개선 시 별도 변경 기록 필요 |
| 2026-07-19 | `createPostListUrl`과 `DEFAULT_POST_PAGE_SIZE`를 `postApi.js`에서 export | 최초·추가 요청 URL 계약을 한 곳에서 관리하고 네트워크 없이도 URL 생성을 검증하기 위함 | `getPosts`는 생성된 URL로 요청하고 기본 조회 크기는 10으로 유지 |
| 2026-07-19 | `ProfileImage`의 `src`를 `imagePath`로 구체화하고 내부에서 서버 URL로 변환 | 호출부마다 이미지 Base URL 결합과 fallback 처리가 반복되는 것을 막기 위함 | Header와 게시글 카드에는 서버가 반환한 이미지 경로만 전달 |
| 2026-07-19 | `ProfileMenu`에 `containerRef`, `triggerRef` 추가 | document 외부 클릭 판정과 Escape 이후 프로필 버튼 포커스 복원에 실제 DOM 참조가 필요함 | 메뉴가 열렸을 때만 document listener를 등록하고 cleanup 수행 |
| 2026-07-19 | `AppLayout`이 Header 설정을 `headerProps` 객체로 전달 | 프로필 메뉴 상태·로그아웃·이미지 등 Header 전용 props가 AppLayout 최상위에 반복되는 것을 줄이기 위함 | AppLayout은 페이지 틀을 담당하고 Header의 제어 상태는 호출 페이지가 소유 |
| 2026-07-19 | AuthProvider mount 시 자동 조회 대신 `initializeAuth()`를 공개 | 로그인·회원가입 같은 공개 Route 진입에서 불필요한 토큰 재발급 요청이 발생하지 않게 하기 위함 | 이후 `ProtectedRoute`가 보호 화면 진입 시 인증 초기화를 호출 |
| 2026-07-19 | 사용자 조회와 로그아웃 요청을 Promise ref로 중복 방지 | React Strict Mode의 effect 재실행과 빠른 연속 로그아웃에서도 요청을 한 번만 실행하기 위함 | `isAuthInitializing`, `isLoggingOut`은 UI 상태를 제공하고 동일 진행 요청은 같은 Promise를 반환 |
| 2026-07-19 | 사용자 조회 401·재발급 실패에서만 인증 상태 제거 | 일시적인 500·네트워크 오류까지 사용자를 강제로 로그아웃시키면 기존 동작보다 범위가 커짐 | 비인증 오류는 사용자만 비우고 기존 Access Token은 유지하여 상위 화면이 오류를 처리 |
| 2026-07-19 | `ProtectedRoute`가 `user`를 별도 인증 state로 복제하지 않고 직접 판정 | Context의 사용자 상태와 Route 내부 상태가 어긋나는 것을 막고 React Hooks의 effect 내 동기 상태 갱신을 피하기 위함 | 사용자 존재 시 즉시 Outlet을 렌더링하고 비동기 초기화 결과만 Route 상태로 관리 |
| 2026-07-19 | 사용자 조회의 비인증 오류에서 Access Token이 남아 있으면 Outlet 허용 | 기존 Vanilla는 사용자 프로필 조회의 500·네트워크 오류만으로 목록 화면 전체를 차단하지 않음 | Header는 기본 이미지를 사용할 수 있고 이후 목록 API가 자체 오류 처리를 수행 |
| 2026-07-19 | `/posts` 연결 시 `PostListPage` 화면 shell을 함께 생성 | 보호 Route의 Outlet 대상이 필요하며 임시 placeholder 대신 기존 DOM 구조를 다음 목록 구현 기반으로 사용하기 위함 | Header, 피드 제목, 작성 링크, 빈 목록과 sentinel만 먼저 렌더링하며 목록 API는 아직 호출하지 않음 |
| 2026-07-19 | 별도 `InfiniteScrollSentinel` 컴포넌트 대신 `useInfiniteScroll` Hook으로 구현 | sentinel 마크업은 페이지에 한 줄뿐이고 재사용할 핵심은 IntersectionObserver 생명주기이기 때문 | 페이지가 sentinel ref를 연결하고 Hook이 observer 생성·해제를 담당 |
| 2026-07-19 | Hook에 `refreshKey`를 추가하고 로딩 상태는 ref로 판정 | 실패 후 로딩 해제만으로 observer를 재생성하면 화면에 보이는 sentinel이 같은 실패 요청을 즉시 반복할 수 있음 | 게시글이 실제 추가된 성공 시점에만 관찰을 갱신하며 요청 중 교차는 무시 |
| 2026-07-23 | Access Token이 남은 사용자 조회 실패에서 Outlet을 허용하던 정책을 폐기 | `user`가 없는 상태로 회원정보 수정 등 사용자 의존 화면이 렌더링되어 빈 본문이 노출됨 | 2026-07-19의 비인증 오류 Outlet 허용 결정을 대체하며, 비401 실패에는 공통 오류·재시도 화면을 렌더링 |
| 2026-07-23 | `ProtectedRoute` 인증 초기화 중 `LoadingView` 렌더링 | 로그인 직후와 보호 URL 직접 진입 시 `/users/me` 응답 전까지 흰 화면이 노출됨 | 사용자 조회가 끝날 때까지 코드 한입 테마의 로딩 문구와 CSS spinner를 표시하고 Outlet은 숨김 |
| 2026-07-23 | 인증 초기화 실패 재시도 상태를 Route에서 관리 | 500·네트워크 오류는 로그아웃 사유가 아니지만 사용자가 복구할 경로가 필요함 | 재시도 중 버튼을 비활성화하고 성공하면 Outlet, 401 또는 토큰 제거 시 로그인, 그 외 실패면 오류 화면 유지 |
| 2026-07-23 | `ProfileImage` fallback을 실패 URL state로 관리 | `onError`에서 `src`와 `classList`를 직접 변경하면 React가 관리하는 DOM과 상태가 어긋날 수 있음 | state에 따라 기본 이미지와 class를 선언적으로 렌더링하고 이미지 경로 변경 시 새 URL을 다시 시도 |
