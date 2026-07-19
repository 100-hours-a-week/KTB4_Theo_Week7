// 게시글 수정 페이지 js

import "./profile-menu.js";
import { getPostIdFromUrl, request, resolveImageUrl } from "./common.js";
import {
  isPostFormValid,
  POST_TITLE_MAX_LENGTH,
  validatePostContentInput,
  validatePostTitleInput,
} from "./validation.js";

// === DOM 요소 ===

const editPostForm = document.getElementById("edit-post-form");
const backLink = document.getElementById("back-link");
const titleInput = document.getElementById("post-title");
const titleHelper = document.getElementById("title-helper");
const contentInput = document.getElementById("post-content");
const contentHelper = document.getElementById("content-helper");
const existingImageArea = document.getElementById("existing-image-area");
const existingImageList = document.getElementById("existing-image-list");
const postImagesInput = document.getElementById("post-images");
const selectedImageName = document.getElementById("selected-image-name");
const newImagePreview = document.getElementById("new-image-preview");
const editPostSubmitButton = document.getElementById("edit-post-submit-button");


// === 페이지 상태 ===

let currentPostId = null;
let existingImageUrls = [];
let selectedPostImageFiles = [];
let newImagePreviewUrls = [];
let isPostLoading = false;
let isPostUpdating = false;

// === 기존 게시글 조회 ===

async function readPostForEdit() {
  if (isPostLoading) {
    return;
  }

  isPostLoading = true;

  try {
    const result = await request(`/posts/${currentPostId}`, {
      method: "GET",
    });

    fillEditPostForm(result.data);
  } catch (error) {
    console.log(error);
    handleReadPostError(error);
  } finally {
    isPostLoading = false;
    updateEditPostSubmitButton();
  }
}

function fillEditPostForm(post) {
  titleInput.value = post.title || "";
  contentInput.value = post.content || "";
  existingImageUrls = Array.isArray(post.imageUrls)
    ? post.imageUrls.filter(Boolean)
    : [];

  renderExistingImages();
  editPostForm.hidden = false;
  updateEditPostSubmitButton();
}


// === 기존 이미지 및 새 이미지 미리보기 ===

function renderExistingImages() {
  existingImageList.replaceChildren();
  existingImageArea.hidden = existingImageUrls.length === 0;

  existingImageUrls.forEach(function (imageUrl, index) {
    const image = document.createElement("img");
    image.src = resolveImageUrl(imageUrl);
    image.alt = `기존 게시글 이미지 ${index + 1}`;
    image.className = "existing-post-image";
    image.addEventListener("error", function () {
      image.remove();
    });
    existingImageList.appendChild(image);
  });
}

function handlePostImageChange() {
  const files = Array.from(postImagesInput.files);
  clearNewImagePreview();

  if (files.length === 0) {
    selectedPostImageFiles = [];
    selectedImageName.textContent =
      "새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다.";
    return;
  }

  selectedPostImageFiles = files;
  selectedImageName.textContent = `${files
    .map(function (file) {
      return file.name;
    })
    .join(", ")} 선택됨 - 기존 이미지를 교체합니다.`;

  files.forEach(function (file) {
    const previewUrl = URL.createObjectURL(file);
    const previewImage = document.createElement("img");

    newImagePreviewUrls.push(previewUrl);
    previewImage.src = previewUrl;
    previewImage.alt = `${file.name} 미리보기`;
    previewImage.className = "new-post-image";
    newImagePreview.appendChild(previewImage);
  });
}

function clearNewImagePreview() {
  newImagePreviewUrls.forEach(function (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  });

  newImagePreviewUrls = [];
  newImagePreview.replaceChildren();
}

function isEditPostFormValid() {
  return isPostFormValid(titleInput, contentInput);
}

function updateEditPostSubmitButton() {
  const isValid = isEditPostFormValid();
  const isActive = isValid && !isPostLoading && !isPostUpdating;

  editPostSubmitButton.disabled = !isActive;
}


// === 게시글 수정 요청 ===

async function updatePost() {
  const imageUrls = selectedPostImageFiles.length > 0
    ? selectedPostImageFiles.map(function (file) {
        return file.name;
      })
    : existingImageUrls;

  const requestBody = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    // 이미지 업로드 API 연결 전까지 새 이미지는 파일명을 임시 값으로 전달
    imageUrls,
  };

  isPostUpdating = true;
  updateEditPostSubmitButton();

  try {
    await request(`/posts/${currentPostId}`, {
      method: "PATCH",
      body: JSON.stringify(requestBody),
    });

    location.href = `./post.html?postId=${currentPostId}`;
  } catch (error) {
    console.log(error);
    handleUpdatePostError(error);
  } finally {
    isPostUpdating = false;
    updateEditPostSubmitButton();
  }
}

function handleEditPostSubmit(event) {
  event.preventDefault();

  if (isPostUpdating) {
    return;
  }

  const isValid =
    validatePostTitleInput(titleInput, titleHelper) &&
    validatePostContentInput(contentInput, contentHelper);
  updateEditPostSubmitButton();

  if (!isValid) {
    return;
  }

  updatePost();
}


// === 예외 처리 ===

function handleReadPostError(error) {
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

  alert("수정할 게시글을 불러오는 중 오류가 발생했습니다.");
}

function handleUpdatePostError(error) {
  const status = error?.status;
  const message = error?.message;

  clearEditPostErrorMessages();

  if (status === 400 && message === "blank_title") {
    titleHelper.textContent = "* 제목을 입력해주세요.";
    return;
  }

  if (status === 400 && message === "blank_content") {
    contentHelper.textContent = "* 내용을 입력해주세요.";
    return;
  }

  if (status === 400 && message === "invalid_post_title") {
    titleHelper.textContent = `* 제목은 최대 ${POST_TITLE_MAX_LENGTH}자까지 작성 가능합니다.`;
    return;
  }

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 403 && message === "post_modify_forbidden") {
    alert("게시글을 수정할 권한이 없습니다.");
    location.href = `./post.html?postId=${currentPostId}`;
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

  alert("게시글 수정 중 오류가 발생했습니다.");
}

function clearEditPostErrorMessages() {
  titleHelper.textContent = "";
  contentHelper.textContent = "";
}


// === 이벤트 등록 및 페이지 초기화 ===

function bindEditPostEvents() {
  titleInput.addEventListener("input", updateEditPostSubmitButton);
  titleInput.addEventListener("blur", function () {
    validatePostTitleInput(titleInput, titleHelper);
  });
  contentInput.addEventListener("input", updateEditPostSubmitButton);
  contentInput.addEventListener("blur", function () {
    validatePostContentInput(contentInput, contentHelper);
  });
  postImagesInput.addEventListener("change", handlePostImageChange);
  editPostForm.addEventListener("submit", handleEditPostSubmit);
  window.addEventListener("beforeunload", clearNewImagePreview);
}

function initEditPostPage() {
  currentPostId = getPostIdFromUrl();

  if (currentPostId === null) {
    alert("잘못된 게시글 주소입니다.");
    location.href = "./posts.html";
    return;
  }

  backLink.href = `./post.html?postId=${currentPostId}`;
  bindEditPostEvents();
  readPostForEdit();
}

initEditPostPage();
