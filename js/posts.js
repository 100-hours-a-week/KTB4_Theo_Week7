// 게시글 목록 조회 페이지 js

// === 게시글 목록 요소 및 페이지네이션 상태 ===

// 서버에서 받은 게시글 카드를 추가할 영역
const postList = document.getElementById("post-list");

// 게시글은 한 번에 10개씩 조회
const POST_PAGE_SIZE = 10;

// 다음 요청에서 기준으로 사용할 마지막 게시글 ID
// 최초 요청에는 lastPostId가 없으므로 null로 시작
let lastPostId = null;

// 다음에 조회할 게시글이 있는지 나타내는 상태
let hasNext = true;

// 스크롤 이벤트가 여러 번 발생해도 요청이 중복되지 않도록 사용하는 상태
let isPostListLoading = false;


// === 게시글 목록 요청 URL 생성 ===

function createPostListUrl() {
  // 최초 조회에서는 lastPostId 없이 size만 전달
  if (lastPostId === null) {
    return `/posts?size=${POST_PAGE_SIZE}`;
  }

  // 추가 조회에서는 이전 응답으로 받은 lastPostId도 전달
  return `/posts?lastPostId=${lastPostId}&size=${POST_PAGE_SIZE}`;
}


// === 게시글 목록 조회 요청 ===

async function readPostList() {
  // 이미 요청 중이거나 다음 게시글이 없다면 요청하지 않음
  if (isPostListLoading || !hasNext) {
    return;
  }

  // 요청을 보내기 전에 로딩 상태로 변경
  isPostListLoading = true;

  try {
    const requestUrl = createPostListUrl();

    const result = await request(requestUrl, {
      method: "GET",
    });

    // 약속된 성공 응답이 아니라면 정상 데이터로 처리하지 않음
    if (result?.message !== "post_list_read_success") {
      throw new Error("게시글 목록 응답 형식이 올바르지 않습니다.");
    }

    const posts = result.data.posts;

    // 조회된 게시글을 기존 목록의 뒤에 이어서 추가
    renderPostList(posts);

    // 다음 요청에 필요한 페이지네이션 상태를 서버 응답으로 갱신
    hasNext = result.data.hasNext;
    lastPostId = result.data.lastPostId;
  } catch (error) {
    console.log(error);
    handlePostListError(error);
  } finally {
    // 성공하거나 실패해도 다음 요청을 받을 수 있도록 상태 복구
    isPostListLoading = false;
  }
}


// === 게시글 목록 화면 출력 ===

function renderPostList(posts) {
  // 조회된 게시글이 없다면 화면에 추가할 내용이 없으므로 종료
  if (!Array.isArray(posts) || posts.length === 0) {
    return;
  }

  // 반복해서 DOM에 직접 추가하는 횟수를 줄이기 위한 임시 저장 공간
  const fragment = document.createDocumentFragment();

  // 조회된 게시글을 반복하면서 카드 요소를 생성하고 fragment에 추가
  posts.forEach(function (post) { 
    const postCard = createPostCard(post);
    fragment.appendChild(postCard);
  });

  // 기존 게시글은 지우지 않고 새 카드들을 목록 마지막에 추가
  postList.appendChild(fragment);
}


// === 게시글 카드 생성 ===

function createPostCard(post) {
  const postCard = document.createElement("article");
  postCard.className = "post-card";
  postCard.dataset.postId = post.postId;

  const postContent = document.createElement("div");
  postContent.className = "post-card-content";

  const titleArea = document.createElement("div");
  titleArea.className = "post-card-title-area";

  const title = document.createElement("h3");
  title.className = "post-card-title";
  title.textContent = getPostTitle(post);
  titleArea.appendChild(title);

  // 수정된 게시글이면 제목 옆에 수정 여부 표시
  if (post.edited) {
    const editedText = document.createElement("span");
    editedText.className = "post-edited-text";
    editedText.textContent = "(수정됨)";
    titleArea.appendChild(editedText);
  }

  const informationArea = document.createElement("div");
  informationArea.className = "post-card-information";

  const countArea = document.createElement("div");
  countArea.className = "post-count-area";

  const likeCount = document.createElement("span");
  likeCount.textContent = `좋아요 ${formatPostCount(post.likeCount)}`;

  const commentCount = document.createElement("span");
  commentCount.textContent = `댓글 ${formatPostCount(post.commentCount)}`;

  const viewCount = document.createElement("span");
  viewCount.textContent = `조회수 ${formatPostCount(post.viewCount)}`;

  countArea.append(likeCount, commentCount, viewCount);

  const createdAt = document.createElement("time");
  createdAt.className = "post-created-at";
  createdAt.dateTime = post.createdAt;
  createdAt.textContent = formatPostDate(post.createdAt);

  informationArea.append(countArea, createdAt);
  postContent.append(titleArea, informationArea);

  const authorArea = document.createElement("div");
  authorArea.className = "post-author-area";

  const profileArea = document.createElement("div");
  profileArea.className = "post-author-profile";

  // 프로필 이미지 URL이 있을 때만 img 요소 생성
  if (post.profileImage) {
    const profileImage = document.createElement("img");
    profileImage.src = resolveImageUrl(post.profileImage);
    profileImage.alt = "";
    profileImage.addEventListener("error", function () {
      profileImage.remove();
    });
    profileArea.appendChild(profileImage);
  }

  const nickname = document.createElement("strong");
  nickname.className = "post-author-nickname";
  nickname.textContent = getPostNickname(post);

  authorArea.append(profileArea, nickname);
  postCard.append(postContent, authorArea);

  return postCard;
}


// === 게시글 데이터 표시 형식 변환 ===

// 게시글 작성일시를 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
function formatPostDate(createdAt) { 
  if (!createdAt) {
    return "";
  }

  // 2026-06-27T11:56:30.532605 형식에서 소수점 이하 제거
  return createdAt.replace("T", " ").split(".")[0];
}

// 게시글의 좋아요, 댓글, 조회수 숫자를 k 단위로 변환
function formatPostCount(count) {
  const safeCount = Number(count) || 0; //

  if (safeCount >= 1000) {
    return `${Math.floor(safeCount / 1000)}k`;
  }

  return String(safeCount);
}

function getPostTitle(post) {
  if (post.blinded) {
    return "숨김 처리된 게시글입니다.";
  }

  const title = post.title || "";

  // 명세에 따라 26자를 초과하는 부분은 표시하지 않음
  return title.length > 26 ? title.slice(0, 26) : title;
}

function getPostNickname(post) {
  if (post.authorDeleted) {
    return "알 수 없음";
  }

  return post.nickname || "";
}


// === 게시글 카드 클릭 ===

function handlePostListClick(event) {
  // 실제 클릭된 요소에서 가장 가까운 게시글 카드를 찾음
  const postCard = event.target.closest(".post-card");

  // 게시글 카드가 아닌 빈 목록 영역을 클릭한 경우 종료
  if (!postCard) {
    return;
  }

  const postId = postCard.dataset.postId;

  // 게시글 상세 조회 페이지로 이동하면서 postId 전달
  location.href = `./post.html?postId=${postId}`;
}


// === 무한 스크롤 ===

function isNearPageBottom() {
  const currentScrollBottom = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const scrollThreshold = 200;

  // 페이지 끝에서 200px 이내까지 내려왔는지 확인
  return currentScrollBottom >= pageHeight - scrollThreshold;
}

function handlePostListScroll() {
  if (isPostListLoading || !hasNext) {
    return;
  }

  if (isNearPageBottom()) {
    readPostList();
  }
}


// === 게시글 목록 조회 예외 처리 ===

function handlePostListError(error) {
  const status = error?.status;
  const message = error?.message;

  if (status === 400 && message === "invalid_request") {
    alert("게시글 목록 요청값을 다시 확인해주세요.");
    return;
  }

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("게시글 목록을 불러오는 중 오류가 발생했습니다.");
}


// === 이벤트 등록 ===

function bindPostListEvents() {
  // 추가 조회를 위한 스크롤 이벤트
  window.addEventListener("scroll", handlePostListScroll);

  // 동적으로 생성되는 모든 게시글 카드의 클릭을 목록에서 한 번에 처리
  postList.addEventListener("click", handlePostListClick);
}


// === 게시글 목록 페이지 초기화 === 

function initPostListPage() {
  bindPostListEvents(); // 이벤트 등록
  readPostList(); // 최초 게시글 목록 조회
}

initPostListPage();
