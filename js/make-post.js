// 게시글 작성 페이지 js

// === DOM 요소 ===

const makePostForm = document.getElementById("make-post-form");
const titleInput = document.getElementById("post-title");
const titleHelper = document.getElementById("title-helper");
const contentInput = document.getElementById("post-content");
const contentHelper = document.getElementById("content-helper");
const postImagesInput = document.getElementById("post-images");
const selectedImageNames = document.getElementById("selected-image-names");
const postImagePreviewList = document.getElementById("post-image-preview-list");
const makePostSubmitButton = document.getElementById("make-post-submit-button");


// === 페이지 상태 ===

let selectedPostImageFiles = [];
let postImagePreviewUrls = [];
let isPostCreating = false;


// === 제목 검증 ===

function validatePostTitle() {
  const title = titleInput.value.trim();

  if (!title) {
    titleHelper.textContent = "* 제목을 입력해주세요.";
    return false;
  }

  if (title.length > 26) {
    titleHelper.textContent = "* 제목은 최대 26자까지 작성 가능합니다.";
    return false;
  }

  titleHelper.textContent = "";
  return true;
}

function isValidPostTitle(title) {
  return title.length > 0 && title.length <= 26;
}


// === 내용 검증 ===

function validatePostContent() {
  const content = contentInput.value.trim();

  if (!content) {
    contentHelper.textContent = "* 내용을 입력해주세요.";
    return false;
  }

  contentHelper.textContent = "";
  return true;
}


// === 이미지 선택 및 미리보기 ===

function handlePostImagesChange() {
  // 선택된 이미지 파일들을 배열로 변환하여 저장
  selectedPostImageFiles = Array.from(postImagesInput.files);
  clearPostImagePreviews();
  // 선택된 이미지 파일이 없으면 미리보기 영역을 초기화하고 종료
  if (selectedPostImageFiles.length === 0) {
    selectedImageNames.textContent = "선택된 이미지가 없습니다.";
    return;
  }

  // 선택된 이미지 파일명을 쉼표로 구분하여 표시
  selectedImageNames.textContent = selectedPostImageFiles
    .map(function (file) {
      return file.name;
    })
    .join(", ");

    // 선택된 이미지 파일들을 미리보기 영역에 표시
  selectedPostImageFiles.forEach(function (file) {
    const previewUrl = URL.createObjectURL(file);
    const previewImage = document.createElement("img");

    postImagePreviewUrls.push(previewUrl);
    previewImage.src = previewUrl;
    previewImage.alt = `${file.name} 미리보기`;
    previewImage.className = "post-image-preview";
    postImagePreviewList.appendChild(previewImage);
  });
}

function clearPostImagePreviews() {
  postImagePreviewUrls.forEach(function (previewUrl) {
    URL.revokeObjectURL(previewUrl); // 브라우저 메모리 해제
  });

  postImagePreviewUrls = [];
  postImagePreviewList.replaceChildren();
}


// === 작성 버튼 활성화 ===

function isMakePostFormValid() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  return isValidPostTitle(title) && content.length > 0;
}

function updateMakePostSubmitButton() {
  const isValid = isMakePostFormValid();
  const isActive = isValid && !isPostCreating;

  makePostSubmitButton.disabled = !isActive;
}


// === 게시글 작성 요청 ===

async function createPost() {
  const requestBody = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    // 이미지 업로드 API 연결 전까지 선택한 파일명을 임시 값으로 전달
    imageUrls: selectedPostImageFiles.map(function (file) {
      return file.name;
    }),
  };

  isPostCreating = true;
  updateMakePostSubmitButton();

  try {
    const result = await request("/posts", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (result?.message !== "post_create_success") {
      throw new Error("게시글 작성 응답 형식이 올바르지 않습니다.");
    }

    // 명세 문서와 실제 응답의 두 가지 data 형식을 모두 처리
    const postId = result.data?.postId ?? result.data;

    if (postId) {
      location.href = `./post.html?postId=${postId}`;
      return;
    }

    location.href = "./posts.html";
  } catch (error) {
    console.log(error);
    handleCreatePostError(error);
  } finally {
    isPostCreating = false;
    updateMakePostSubmitButton();
  }
}

function handleMakePostSubmit(event) {
  event.preventDefault();

  if (isPostCreating) {
    return;
  }

  const isValid = validatePostTitle() && validatePostContent();
  updateMakePostSubmitButton();

  if (!isValid) {
    return;
  }

  createPost();
}


// === 게시글 작성 예외 처리 ===

function handleCreatePostError(error) {
  const status = error?.status;
  const message = error?.message;

  clearCreatePostErrorMessages();

  if (status === 400 && message === "blank_title") {
    titleHelper.textContent = "* 제목을 입력해주세요.";
    return;
  }

  if (status === 400 && message === "blank_content") {
    contentHelper.textContent = "* 내용을 입력해주세요.";
    return;
  }

  if (status === 400 && message === "invalid_post_title") {
    titleHelper.textContent = "* 제목은 최대 26자까지 작성 가능합니다.";
    return;
  }

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 429 && message === "post_create_rate_limit_exceeded") {
    alert("게시글은 1분에 최대 3개까지 작성할 수 있습니다.");
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
}

function clearCreatePostErrorMessages() {
  titleHelper.textContent = "";
  contentHelper.textContent = "";
}


// === 이벤트 등록 및 페이지 초기화 ===

function bindMakePostEvents() {
  titleInput.addEventListener("input", updateMakePostSubmitButton);
  titleInput.addEventListener("blur", validatePostTitle);
  contentInput.addEventListener("input", updateMakePostSubmitButton);
  contentInput.addEventListener("blur", validatePostContent);
  postImagesInput.addEventListener("change", handlePostImagesChange);
  makePostForm.addEventListener("submit", handleMakePostSubmit);
  window.addEventListener("beforeunload", clearPostImagePreviews);
}

function initMakePostPage() {
  bindMakePostEvents();
  updateMakePostSubmitButton();
}

initMakePostPage();
