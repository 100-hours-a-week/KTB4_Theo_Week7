# 게시글 목록 정상 작동 시나리오

## 1. 기준 소스

- 화면: `pages/posts.html`
- 목록 동작: `js/posts.js`
- Header 동작: `js/profile-menu.js`
- 공통 요청·표시 유틸리티: `js/common.js`
- 제목 길이 상수: `js/validation.js`
- 스타일: `css/common.css`, `css/posts.css`

## 2. 페이지 정보

- 기존 URL: `pages/posts.html`
- React 예정 URL: `/posts`
- 진입 대상: 로그인 사용자
- 카드 이동: 기존 `pages/post.html?postId={id}`, React 예정 `/posts/{id}`
- 작성 이동: 기존 `pages/make-post.html`, React 예정 `/posts/new`
- 페이지네이션 방식: 마지막 게시글 ID를 사용하는 커서 방식

## 3. 화면 구성

1. 서비스 로고
2. 현재 사용자 프로필 이미지 버튼
3. 프로필 메뉴
4. `전체 피드` 제목과 설명
5. 게시글 작성 링크
6. 4열 게시글 카드 목록
7. 추가 조회를 감지하는 화면 하단 sentinel

## 4. 최초 진입 시나리오

1. 프로필 메뉴 스크립트가 현재 사용자 정보 `GET /users/me`를 요청한다.
2. Access Token이 메모리에 없으면 Refresh Token 쿠키로 `POST /auth/reissue`를 먼저 요청한다.
3. 사용자 프로필 이미지가 있으면 서버 이미지 URL로 표시한다.
4. 이미지 경로가 없거나 로드에 실패하면 기본 프로필 이미지를 표시한다.
5. 목록 sentinel에 `IntersectionObserver`를 연결한다.
6. `GET /posts?size=10`으로 첫 페이지를 요청한다.
7. 응답의 `posts`를 기존 목록 뒤에 렌더링한다.
8. 응답의 `hasNext`, `lastPostId`를 다음 요청 상태로 저장한다.

현재 Vanilla 화면은 최초 요청 중 spinner나 로딩 문구를 표시하지 않는다.

## 5. 게시글 카드 표시 시나리오

각 게시글은 다음 규칙으로 표시한다.

- `blinded === true`: 카드 전체를 목록에 추가하지 않는다.
- 제목: 최대 26자까지만 사용하고 CSS에서 최대 두 줄로 표시한다.
- `edited === true`: 제목 오른쪽에 `수정됨` 배지를 표시한다.
- 좋아요: 하트와 `likeCount`를 표시한다.
- 댓글: `댓글 {commentCount}`를 표시한다.
- 조회수: `조회수 {viewCount}`를 표시한다.
- 수치가 1,000 이상이면 1,000으로 나눈 값을 내림하여 `{n}k`로 표시한다.
- 작성일: `createdAt`에서 날짜만 사용하여 `YYYY.MM.DD`로 표시한다.
- 작성자 탈퇴 상태면 닉네임을 `알 수 없음`으로 표시한다.
- 작성자 프로필 이미지가 없거나 로드에 실패하면 기본 이미지를 표시한다.

## 6. 게시글 상세 이동

1. 사용자가 카드 내부의 어느 요소든 선택한다.
2. 가장 가까운 `.post-card`에서 `postId`를 읽는다.
3. 기존 화면은 `post.html?postId={postId}`로 이동한다.
4. React에서는 프로젝트 공통 라우팅 설계에 따라 `/posts/{postId}`로 이동한다.

빈 목록 영역을 선택하면 아무 동작도 하지 않는다.

## 7. 무한 스크롤 시나리오

1. viewport 아래 200px 범위에 sentinel이 들어오면 observer callback이 실행된다.
2. 요청 중이거나 `hasNext === false`이면 요청하지 않는다.
3. 다음 페이지가 있으면 `GET /posts?lastPostId={lastPostId}&size=10`을 요청한다.
4. 새 게시글을 기존 목록 뒤에 이어 붙인다.
5. `hasNext`, `lastPostId`를 새 응답으로 교체한다.
6. 다음 페이지가 있고 응답 게시글이 1개 이상이면 sentinel을 다시 관찰하여 짧은 목록에서도 연속 조회될 수 있게 한다.
7. `hasNext === false`이면 이후 sentinel 진입에도 요청하지 않는다.

요청이 실패하면 이미 표시된 카드는 유지하며, `finally`에서 로딩 잠금을 해제하여 다시 요청할 수 있게 한다.

## 8. 빈 응답과 숨김 게시글

- `posts`가 배열이 아니거나 빈 배열이면 DOM에 아무것도 추가하지 않는다.
- 빈 목록 안내 문구는 표시하지 않는다.
- 응답 배열에 숨김 게시글만 있으면 카드가 표시되지 않는다.
- 서버가 내려준 `lastPostId`와 `hasNext`는 숨김 카드 필터링 여부와 관계없이 그대로 사용한다.

## 9. Header와 프로필 메뉴

### 프로필 메뉴

- 프로필 버튼을 선택하면 메뉴를 토글하고 `aria-expanded`를 갱신한다.
- 메뉴 외부를 선택하면 닫는다.
- 열린 상태에서 Escape를 누르면 닫고 프로필 버튼으로 포커스를 돌린다.
- 회원정보 수정과 비밀번호 수정 링크를 제공한다.

### 로그아웃

1. 중복 로그아웃 요청을 차단하고 버튼을 비활성화한다.
2. 토큰 자동 첨부와 401 재시도 없이 `POST /auth/logout`을 요청한다.
3. 성공하면 메모리 Access Token을 제거하고 로그인 페이지로 이동한다.
4. 실패하면 오류 alert를 표시하고 버튼을 복구한다.

## 10. 오류 시나리오

- 목록 400 `invalid_request`: 요청값 확인 alert, 현재 화면 유지
- 목록 401 `unauthorized_request`: 로그인 필요 alert 후 로그인 이동
- 목록 500 `internal_server_error`: 서버 오류 alert, 현재 화면 유지
- 그 외 또는 네트워크 오류: 일반 목록 오류 alert, 현재 화면 유지
- 사용자 정보 조회 401: 별도 alert 없이 로그인 페이지 이동

상세 문구는 `error-behaviors.md`에서 관리한다.

## 11. React 마이그레이션에서 보존할 동작

- 한 번에 10개를 요청하는 커서 페이지네이션 계약
- 최초 요청과 추가 요청 URL의 차이
- 기존 카드 뒤에 추가하는 순서
- 숨김 게시글 제외와 탈퇴 작성자 표시
- 제목·수치·날짜·프로필 이미지 fallback 규칙
- observer 200px 선조회와 중복 요청 방지
- 기존 카드 클릭 전체 영역의 상세 이동
- Header 메뉴의 외부 클릭·Escape·포커스 복원
- 인증 복구와 로그아웃 정책
- 요청 실패 시 이미 표시한 목록 유지

