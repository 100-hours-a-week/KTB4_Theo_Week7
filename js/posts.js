// 게시글 목록 조회 페이지 js

import "./profile-menu.js";
import {
  DEFAULT_PROFILE_IMAGE_URL,
  formatPostCount,
  formatPostDate,
  request,
  resolveImageUrl,
} from "./common.js";
import { POST_TITLE_MAX_LENGTH } from "./validation.js";

// === 게시글 목록 요소 및 페이지네이션 상태 ===

// 서버에서 받은 게시글 카드를 추가할 영역
const postList = document.getElementById("post-list");
// 다음 페이지 조회 시점을 감지할 목록 하단 요소
const postListSentinel = document.getElementById("post-list-sentinel");

// 게시글은 한 번에 10개씩 조회
const POST_PAGE_SIZE = 10;
// 센티넬이 화면 아래쪽의 이 거리 안에 들어오면 다음 페이지를 미리 조회
const POST_LIST_SENTINEL_MARGIN = 200;

// 다음 요청에서 기준으로 사용할 마지막 게시글 ID
// 최초 요청에는 lastPostId가 없으므로 null로 시작
let lastPostId = null;

// 다음에 조회할 게시글이 있는지 나타내는 상태
let hasNext = true;

// 센티넬 콜백이 반복되어도 요청이 중복되지 않도록 사용하는 상태
let isPostListLoading = false;

// 목록 하단 센티넬의 화면 진입 여부를 감지하는 관찰자
let postListObserver = null;


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
  let shouldRefreshSentinel = false;

  try {
    const requestUrl = createPostListUrl();

    const result = await request(requestUrl, {
      method: "GET",
    });

    const posts = result.data.posts;

    // 조회된 게시글을 기존 목록의 뒤에 이어서 추가
    renderPostList(posts);

    // 다음 요청에 필요한 페이지네이션 상태를 서버 응답으로 갱신
    hasNext = result.data.hasNext;
    lastPostId = result.data.lastPostId;

    // 센티넬이 계속 보이는 짧은 목록도 다음 페이지를 확인할 수 있도록 관찰 갱신
    shouldRefreshSentinel =
      hasNext && Array.isArray(posts) && posts.length > 0;
  } catch (error) {
    console.log(error);
    handlePostListError(error);
  } finally {
    // 성공하거나 실패해도 다음 요청을 받을 수 있도록 상태 복구
    isPostListLoading = false;
  }

  if (shouldRefreshSentinel) {
    refreshPostListSentinelObservation();
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
    if (post.blinded) {
      return;
    }

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
    editedText.textContent = "수정됨";
    titleArea.appendChild(editedText);
  }

  const informationArea = document.createElement("div");
  informationArea.className = "post-card-information";

  const likeCount = document.createElement("span");
  likeCount.className = "post-like-count";
  likeCount.textContent = formatPostCount(post.likeCount);

  const metaRow = document.createElement("div");
  metaRow.className = "post-card-meta-row";

  const countArea = document.createElement("div");
  countArea.className = "post-count-area";

  const commentCount = document.createElement("span");
  commentCount.textContent = `댓글 ${formatPostCount(post.commentCount)}`;

  const viewCount = document.createElement("span");
  viewCount.textContent = `조회수 ${formatPostCount(post.viewCount)}`;

  countArea.append(commentCount, viewCount);

  const createdAt = document.createElement("time");
  createdAt.className = "post-created-at";
  createdAt.dateTime = post.createdAt;
  createdAt.textContent = formatPostListDate(post.createdAt);

  metaRow.append(countArea, createdAt);
  informationArea.append(likeCount, metaRow);
  postContent.append(titleArea, informationArea);

  const authorArea = document.createElement("div");
  authorArea.className = "post-author-area";

  const profileArea = document.createElement("div");
  profileArea.className = "post-author-profile";

  const profileImage = document.createElement("img");
  profileImage.alt = "";

  if (post.profileImage) {
    profileImage.src = resolveImageUrl(post.profileImage);
  } else {
    profileImage.src = DEFAULT_PROFILE_IMAGE_URL;
    profileImage.classList.add("default-profile-image");
  }

  profileImage.addEventListener("error", function () {
    profileImage.src = DEFAULT_PROFILE_IMAGE_URL;
    profileImage.classList.add("default-profile-image");
  });
  profileArea.appendChild(profileImage);

  const nickname = document.createElement("strong");
  nickname.className = "post-author-nickname";
  nickname.textContent = getPostNickname(post);

  authorArea.append(profileArea, nickname);
  postCard.append(postContent, authorArea);

  return postCard;
}


// === 게시글 데이터 표시 형식 변환 ===

function getPostTitle(post) {
  if (post.blinded) {
    return "숨김 처리된 게시글입니다.";
  }

  const title = post.title || "";

  // 명세에 따라 제목 최대 길이를 초과하는 부분은 표시하지 않음
  return title.length > POST_TITLE_MAX_LENGTH
    ? title.slice(0, POST_TITLE_MAX_LENGTH)
    : title;
}

function getPostNickname(post) {
  if (post.authorDeleted) {
    return "알 수 없음";
  }

  return post.nickname || "";
}

function formatPostListDate(createdAt) {
  const formattedDate = formatPostDate(createdAt);

  if (!formattedDate) {
    return "";
  }

  return formattedDate.split(" ")[0].replaceAll("-", ".");
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

function handlePostListIntersection(entries) {
  const isSentinelVisible = entries.some(function (entry) {
    return entry.isIntersecting;
  });

  if (!isSentinelVisible || isPostListLoading || !hasNext) {
    return;
  }

  readPostList();
}

function refreshPostListSentinelObservation() {
  if (!postListObserver) {
    return;
  }

  postListObserver.unobserve(postListSentinel);
  postListObserver.observe(postListSentinel);
}

function observePostListSentinel() {
  postListObserver = new IntersectionObserver(handlePostListIntersection, {
    root: null,
    rootMargin: `0px 0px ${POST_LIST_SENTINEL_MARGIN}px 0px`,
    threshold: 0,
  });

  postListObserver.observe(postListSentinel);
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
  // 동적으로 생성되는 모든 게시글 카드의 클릭을 목록에서 한 번에 처리
  postList.addEventListener("click", handlePostListClick);
}


// === 게시글 목록 페이지 초기화 === 

function initPostListPage() {
  bindPostListEvents(); // 이벤트 등록
  observePostListSentinel(); // 다음 페이지 조회 시점 감지
  readPostList(); // 최초 게시글 목록 조회
}

initPostListPage();
