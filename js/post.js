// 게시글 상세 조회 페이지 js

// === DOM 요소 ===

const postDetail = document.getElementById("post-detail");
const commentSection = document.getElementById("comment-section");

const postTitle = document.getElementById("post-title");
const postAuthorProfile = document.getElementById("post-author-profile");
const postAuthorNickname = document.getElementById("post-author-nickname");
const postCreatedAt = document.getElementById("post-created-at");
const postEditedLabel = document.getElementById("post-edited-label");
const postEditLink = document.getElementById("post-edit-link");
const postDeleteButton = document.getElementById("post-delete-button");
const postContent = document.getElementById("post-content");

const postImageGallery = document.getElementById("post-image-gallery");
const postGalleryImage = document.getElementById("post-gallery-image");
const galleryPreviousButton = document.getElementById("gallery-previous-button");
const galleryNextButton = document.getElementById("gallery-next-button");
const galleryIndicator = document.getElementById("gallery-indicator");

const likeButton = document.getElementById("like-button");
const postLikeCount = document.getElementById("post-like-count");
const postViewCount = document.getElementById("post-view-count");
const postCommentCount = document.getElementById("post-comment-count");

const commentForm = document.getElementById("comment-form");
const commentContentInput = document.getElementById("comment-content");
const commentHelper = document.getElementById("comment-helper");
const commentSubmitButton = document.getElementById("comment-submit-button");
const commentList = document.getElementById("comment-list");

const deleteModal = document.getElementById("delete-modal");
const deleteModalTitle = document.getElementById("delete-modal-title");
const deleteCancelButton = document.getElementById("delete-cancel-button");
const deleteConfirmButton = document.getElementById("delete-confirm-button");


// === 페이지 상태 ===

let currentPostId = null;
let currentImageUrls = [];
let currentImageIndex = 0;
let editingCommentId = null;
let pendingDeleteTarget = null;
let isPostDetailLoading = false;
let isDeleteSubmitting = false;
let isCommentCreating = false;
let isCommentUpdating = false;
let isLikeSubmitting = false;


// === URL의 게시글 ID 확인 ===

function getPostIdFromUrl() {
  const searchParams = new URLSearchParams(location.search);
  const postId = Number(searchParams.get("postId"));

  if (!Number.isInteger(postId) || postId <= 0) {
    return null;
  }

  return postId;
}


// === 게시글 상세 조회 ===

async function readPostDetail() {
  if (isPostDetailLoading) {
    return;
  }

  isPostDetailLoading = true;

  try {
    const result = await request(`/posts/${currentPostId}`, {
      method: "GET",
    });

    if (result?.message !== "post_read_success") {
      throw new Error("게시글 상세 응답 형식이 올바르지 않습니다.");
    }

    renderPostDetail(result.data);
  } catch (error) {
    console.log(error);
    handlePostDetailError(error);
  } finally {
    isPostDetailLoading = false;
  }
}


// === 게시글 상세 화면 출력 ===

function renderPostDetail(post) {
  const isBlinded = Boolean(post.blinded);

  postTitle.textContent = isBlinded ? "숨김 처리된 게시글입니다." : post.title;
  postContent.textContent = isBlinded ? "숨김 처리된 게시글입니다." : post.content;
  postAuthorNickname.textContent = getDisplayNickname(post.nickname, post.authorDeleted);
  renderProfileImage(postAuthorProfile, post.profileImage);

  if (post.createdAt) {
    postCreatedAt.dateTime = post.createdAt;
    postCreatedAt.textContent = formatPostDate(post.createdAt);
    postCreatedAt.hidden = false;
  } else {
    postCreatedAt.hidden = true;
  }

  // 수정됨 라벨은 게시글이 수정된 경우에만 표시
  postEditedLabel.hidden = !post.edited;
  postEditLink.href = `./edit-post.html?postId=${post.postId}`;
  postEditLink.hidden = !post.author;
  postDeleteButton.hidden = !post.author;

  postLikeCount.textContent = formatPostCount(post.likeCount);
  postViewCount.textContent = formatPostCount(post.viewCount);
  postCommentCount.textContent = formatPostCount(post.commentCount);
  likeButton.classList.toggle("liked", Boolean(post.liked));
  likeButton.setAttribute("aria-pressed", String(Boolean(post.liked)));

  renderPostImages(isBlinded ? [] : post.imageUrls);
  renderCommentList(post.comments);

  postDetail.hidden = false;
  commentSection.hidden = false;
}

function renderProfileImage(container, imageUrl) {
  container.replaceChildren();

  if (!imageUrl) {
    return;
  }

  const image = document.createElement("img");
  image.src = resolveImageUrl(imageUrl);
  image.alt = "";
  image.addEventListener("error", function () {
    image.remove();
  });
  container.appendChild(image);
}


// === 첨부 이미지 갤러리 ===

function renderPostImages(imageUrls) {
  currentImageUrls = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
  currentImageIndex = 0;

  if (currentImageUrls.length === 0) {
    postImageGallery.hidden = true;
    postGalleryImage.removeAttribute("src");
    return;
  }

  postImageGallery.hidden = false;
  updateGalleryImage();
}

function updateGalleryImage() {
  const imageCount = currentImageUrls.length;

  postGalleryImage.src = resolveImageUrl(currentImageUrls[currentImageIndex]);
  galleryIndicator.textContent = `${currentImageIndex + 1} / ${imageCount}`;
  galleryPreviousButton.disabled = currentImageIndex === 0;
  galleryNextButton.disabled = currentImageIndex === imageCount - 1;
  galleryPreviousButton.hidden = imageCount === 1;
  galleryNextButton.hidden = imageCount === 1;
  galleryIndicator.hidden = imageCount === 1;
}

function showPreviousImage() {
  if (currentImageIndex === 0) {
    return;
  }

  currentImageIndex -= 1;
  updateGalleryImage();
}

function showNextImage() {
  if (currentImageIndex >= currentImageUrls.length - 1) {
    return;
  }

  currentImageIndex += 1;
  updateGalleryImage();
}


// === 댓글 목록 출력 ===

function renderCommentList(comments) {
  commentList.replaceChildren();

  if (!Array.isArray(comments) || comments.length === 0) {
    return;
  }

  const fragment = document.createDocumentFragment();

  comments.forEach(function (comment) {
    fragment.appendChild(createCommentCard(comment));
  });

  commentList.appendChild(fragment);
}

function createCommentCard(comment) {
  const commentCard = document.createElement("article");
  commentCard.className = "comment-card";
  commentCard.dataset.commentId = comment.commentId;

  const header = document.createElement("div");
  header.className = "comment-card-header";

  const authorInformation = document.createElement("div");
  authorInformation.className = "comment-author-information";

  const profile = document.createElement("div");
  profile.className = "comment-profile";
  renderProfileImage(profile, comment.profileImage);

  const nickname = document.createElement("strong");
  nickname.textContent = getDisplayNickname(comment.nickname, comment.authorDeleted);

  const createdAt = document.createElement("time");
  createdAt.className = "comment-date";
  createdAt.dateTime = comment.createdAt || "";
  createdAt.textContent = formatPostDate(comment.createdAt);

  authorInformation.append(profile, nickname, createdAt);
  header.appendChild(authorInformation);

  if (comment.author && !comment.commentDeleted && !comment.authorDeleted) {
    const actionButtons = document.createElement("div");
    actionButtons.className = "comment-action-buttons";

    const editButton = createCommentActionButton("수정", "edit-comment");
    const deleteButton = createCommentActionButton("삭제", "delete-comment");
    actionButtons.append(editButton, deleteButton);
    header.appendChild(actionButtons);
  }

  const content = document.createElement("p");
  content.className = "comment-content";
  content.textContent = comment.commentDeleted
    ? "삭제된 댓글입니다."
    : comment.commentContent;

  commentCard.append(header, content);
  return commentCard;
}

function createCommentActionButton(text, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "outline-action-button";
  button.dataset.action = action;
  button.textContent = text;
  return button;
}


// === 댓글 입력 및 수정 ===

function validateCommentContent() {
  const content = commentContentInput.value.trim();

  if (!content) {
    commentHelper.textContent = "* 댓글 내용을 입력해주세요.";
    return false;
  }

  if (content.length > 50) {
    commentHelper.textContent = "* 댓글은 최대 50자까지 작성 가능합니다.";
    return false;
  }

  commentHelper.textContent = "";
  return true;
}

function updateCommentSubmitButton() { // 댓글 등록/수정 버튼 활성화 상태를 업데이트하는 함수
  const isValid = commentContentInput.value.trim().length > 0;
  const isCommentSubmitting = isCommentCreating || isCommentUpdating;
  const isActive = isValid && !isCommentSubmitting;
  commentSubmitButton.disabled = !isActive;
}

function startCommentEdit(commentCard) { // 댓글 수정모드로 전환
  editingCommentId = Number(commentCard.dataset.commentId);
  const content = commentCard.querySelector(".comment-content").textContent;

  commentContentInput.value = content;
  commentSubmitButton.textContent = "댓글 수정";
  commentHelper.textContent = "";
  updateCommentSubmitButton();
  commentContentInput.focus();
  commentForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetCommentForm() { // 댓글 입력 폼을 초기 상태로 되돌리는 함수
  editingCommentId = null;
  commentContentInput.value = "";
  commentSubmitButton.textContent = "댓글 등록";
  commentHelper.textContent = "";
  updateCommentSubmitButton();
}

async function updateComment() {
  if (isCommentUpdating || !validateCommentContent()) {
    return;
  }

  isCommentUpdating = true;
  updateCommentSubmitButton();

  try {
    const result = await request(
      `/posts/${currentPostId}/comments/${editingCommentId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          content: commentContentInput.value.trim(),
        }),
      }
    );

    if (result?.message !== "comment_update_success") {
      throw new Error("댓글 수정 응답 형식이 올바르지 않습니다.");
    }

    resetCommentForm();
    await readPostDetail();
  } catch (error) {
    console.log(error);
    handleCommentError(error, "수정");
  } finally {
    isCommentUpdating = false;
    updateCommentSubmitButton();
  }
}

async function createComment() {
  if (isCommentCreating || !validateCommentContent()) {
    return;
  }

  isCommentCreating = true;
  updateCommentSubmitButton();

  try {
    const result = await request(`/posts/${currentPostId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        content: commentContentInput.value.trim(),
      }),
    });

    if (result?.message !== "comment_create_success") {
      throw new Error("댓글 등록 응답 형식이 올바르지 않습니다.");
    }

    resetCommentForm();
    await readPostDetail();
  } catch (error) {
    console.log(error);
    handleCommentError(error, "등록");
  } finally {
    isCommentCreating = false;
    updateCommentSubmitButton();
  }
}

function handleCommentFormSubmit(event) {
  event.preventDefault();

  if (editingCommentId !== null) {
    updateComment();
    return;
  }

  createComment();
}


// === 삭제 확인 모달 ===

function openDeleteModal(type, commentId = null) {
  pendingDeleteTarget = { type, commentId };
  deleteModalTitle.textContent =
    type === "post" ? "게시글을 삭제하시겠습니까?" : "댓글을 삭제하시겠습니까?";
  deleteModal.hidden = false;
  deleteConfirmButton.focus();
}

function closeDeleteModal() {
  if (isDeleteSubmitting) {
    return;
  }

  deleteModal.hidden = true;
  pendingDeleteTarget = null;
}

async function confirmDelete() {
  if (!pendingDeleteTarget || isDeleteSubmitting) {
    return;
  }

  isDeleteSubmitting = true;
  deleteConfirmButton.disabled = true;

  try {
    if (pendingDeleteTarget.type === "post") {
      await deletePost();
    } else {
      await deleteComment(pendingDeleteTarget.commentId);
    }
  } finally {
    isDeleteSubmitting = false;
    deleteConfirmButton.disabled = false;
  }
}

async function deletePost() {
  try {
    const result = await request(`/posts/${currentPostId}`, {
      method: "DELETE",
    });

    if (result?.message !== "post_delete_success") {
      throw new Error("게시글 삭제 응답 형식이 올바르지 않습니다.");
    }

    location.href = "./posts.html";
  } catch (error) {
    console.log(error);
    closeDeleteModalAfterError();
    handlePostDeleteError(error);
  }
}

async function deleteComment(commentId) {
  try {
    const result = await request(
      `/posts/${currentPostId}/comments/${commentId}`,
      { method: "DELETE" }
    );

    if (result?.message !== "comment_delete_success") {
      throw new Error("댓글 삭제 응답 형식이 올바르지 않습니다.");
    }

    closeDeleteModalAfterError();
    await readPostDetail();
  } catch (error) {
    console.log(error);
    closeDeleteModalAfterError();
    handleCommentError(error, "삭제");
  }
}

function closeDeleteModalAfterError() {
  deleteModal.hidden = true;
  pendingDeleteTarget = null;
}


// === 이벤트 처리 ===

function handleCommentListClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const commentCard = actionButton.closest(".comment-card");

  if (actionButton.dataset.action === "edit-comment") {
    startCommentEdit(commentCard);
    return;
  }

  if (actionButton.dataset.action === "delete-comment") {
    openDeleteModal("comment", Number(commentCard.dataset.commentId));
  }
}

function handleDeleteModalClick(event) {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
}

function handlePageKeydown(event) {
  if (event.key === "Escape" && !deleteModal.hidden) {
    closeDeleteModal();
  }
}

async function handleLikeClick() {
  if (isLikeSubmitting) {
    return;
  }

  isLikeSubmitting = true;
  likeButton.disabled = true;

  try {
    const result = await request(`/posts/${currentPostId}/likes`, {
      method: "POST",
    });

    if (result?.message !== "post_like_success") {
      throw new Error("좋아요 응답 형식이 올바르지 않습니다.");
    }

    const liked = Boolean(result.data.liked);
    likeButton.classList.toggle("liked", liked);
    likeButton.setAttribute("aria-pressed", String(liked));
    postLikeCount.textContent = formatPostCount(result.data.likeCount);
  } catch (error) {
    console.log(error);
    handleLikeError(error);
  } finally {
    isLikeSubmitting = false;
    likeButton.disabled = false;
  }
}


// === 예외 처리 ===

function handlePostDetailError(error) {
  const status = error?.status;
  const message = error?.message;

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 404 && message === "post_not_found") {
    alert("존재하지 않는 게시글입니다.");
    location.href = "./posts.html";
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("게시글을 불러오는 중 오류가 발생했습니다.");
}

function handlePostDeleteError(error) {
  const status = error?.status;
  const message = error?.message;

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 403 && message === "post_delete_forbidden") {
    alert("게시글을 삭제할 권한이 없습니다.");
    return;
  }

  if (status === 404 && message === "post_not_found") {
    alert("존재하지 않는 게시글입니다.");
    location.href = "./posts.html";
    return;
  }

  alert("게시글 삭제 중 오류가 발생했습니다.");
}

function handleCommentError(error, actionName) {
  const status = error?.status;
  const message = error?.message;

  if (status === 400 && message === "blank_comment_content") {
    commentHelper.textContent = "* 댓글 내용을 입력해주세요.";
    return;
  }

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 403) {
    alert(`댓글을 ${actionName}할 권한이 없습니다.`);
    return;
  }

  if (status === 404 && message === "comment_not_found") {
    alert("존재하지 않는 댓글입니다.");
    readPostDetail();
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert(`댓글 ${actionName} 중 오류가 발생했습니다.`);
}

function handleLikeError(error) {
  const status = error?.status;
  const message = error?.message;

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 404 && message === "post_not_found") {
    alert("존재하지 않는 게시글입니다.");
    location.href = "./posts.html";
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("좋아요 처리 중 오류가 발생했습니다.");
}


// === 데이터 표시 형식 변환 ===

function formatPostDate(createdAt) {
  if (!createdAt) {
    return "";
  }

  return createdAt.replace("T", " ").split(".")[0];
}

function formatPostCount(count) {
  const safeCount = Number(count) || 0;

  if (safeCount >= 1000) {
    return `${Math.floor(safeCount / 1000)}k`;
  }

  return String(safeCount);
}

function getDisplayNickname(nickname, authorDeleted) {
  return authorDeleted ? "알 수 없음" : nickname || "";
}


// === 이벤트 등록 및 페이지 초기화 ===

function bindPostDetailEvents() {
  galleryPreviousButton.addEventListener("click", showPreviousImage);
  galleryNextButton.addEventListener("click", showNextImage);
  postDeleteButton.addEventListener("click", function () {
    openDeleteModal("post");
  });
  likeButton.addEventListener("click", handleLikeClick);

  commentContentInput.addEventListener("input", updateCommentSubmitButton);
  commentContentInput.addEventListener("blur", function () {
    if (commentContentInput.value.length > 0) {
      validateCommentContent();
    }
  });
  commentForm.addEventListener("submit", handleCommentFormSubmit);
  commentList.addEventListener("click", handleCommentListClick);

  deleteCancelButton.addEventListener("click", closeDeleteModal);
  deleteConfirmButton.addEventListener("click", confirmDelete);
  deleteModal.addEventListener("click", handleDeleteModalClick);
  document.addEventListener("keydown", handlePageKeydown);
}

function initPostDetailPage() {
  currentPostId = getPostIdFromUrl();

  if (currentPostId === null) {
    alert("잘못된 게시글 주소입니다.");
    location.href = "./posts.html";
    return;
  }

  bindPostDetailEvents();
  postEditLink.href = `./edit-post.html?postId=${currentPostId}`; // 게시글 수정 페이지 링크 업데이트
  readPostDetail();
}

initPostDetailPage();
