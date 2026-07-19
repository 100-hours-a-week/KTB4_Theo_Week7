// 회원정보 수정 페이지 js

import "./profile-menu.js";
import { request, resolveImageUrl } from "./common.js";
import { NICKNAME_MAX_LENGTH } from "./validation.js";

const EDIT_PROFILE_TOAST_DURATION_MS = 2000;

// === DOM 요소 ===

const editProfileForm = document.getElementById("edit-profile-form");
const profileEditPreview = document.getElementById("profile-edit-preview");
const newProfileImageInput = document.getElementById("new-profile-image");
const userEmail = document.getElementById("user-email");
const nicknameInput = document.getElementById("nickname");
const nicknameHelper = document.getElementById("nickname-helper");
const editProfileSubmitButton = document.getElementById("edit-profile-submit-button");
const withdrawalButton = document.getElementById("withdrawal-button");
const withdrawalModal = document.getElementById("withdrawal-modal");
const withdrawalCancelButton = document.getElementById("withdrawal-cancel-button");
const withdrawalConfirmButton = document.getElementById("withdrawal-confirm-button");
const editProfileToast = document.getElementById("edit-profile-toast");


// === 페이지 상태 ===

let originalNickname = "";
let originalProfileImage = "";
let selectedProfileImageFile = null;
let profileEditPreviewUrl = null;
let isUserLoading = false;
let isUserUpdating = false;
let isUserDeleting = false;
let toastTimer = null;


// === 현재 사용자 조회 ===

async function readCurrentUser() {
  if (isUserLoading) {
    return;
  }

  isUserLoading = true;

  try {
    const result = await request("/users/me", {
      method: "GET",
    });

    fillEditProfileForm(result.data);
  } catch (error) {
    console.log(error);
    handleReadCurrentUserError(error);
  } finally {
    isUserLoading = false;
    updateEditProfileSubmitButton();
  }
}

// === 회원정보 수정 폼 채우기 ===

function fillEditProfileForm(user) {
  originalNickname = user.nickname || "";
  originalProfileImage = user.profileImage || "";

  userEmail.textContent = user.email || "";
  nicknameInput.value = originalNickname;
  renderProfileEditImage(originalProfileImage);
  editProfileForm.hidden = false;
}


// === 프로필 이미지 선택 및 미리보기 ===

function handleProfileImageChange() {
  const file = newProfileImageInput.files[0];
  clearProfileEditPreviewUrl();

  if (!file) {
    selectedProfileImageFile = null; 
    renderProfileEditImage(originalProfileImage);
    updateEditProfileSubmitButton();
    return;
  }

  selectedProfileImageFile = file;
  profileEditPreviewUrl = URL.createObjectURL(file);
  profileEditPreview.src = profileEditPreviewUrl;
  updateEditProfileSubmitButton();
}

// === 프로필 이미지 렌더링 및 미리보기 URL 해제 ===
function renderProfileEditImage(imagePath) {
  if (!imagePath) {
    profileEditPreview.removeAttribute("src");
    return;
  }

  profileEditPreview.src = resolveImageUrl(imagePath);
}

function clearProfileEditPreviewUrl() {
  if (profileEditPreviewUrl) {
    URL.revokeObjectURL(profileEditPreviewUrl);
    profileEditPreviewUrl = null;
  }
}


// === 닉네임 검증 ===

function validateNickname() {
  const nickname = nicknameInput.value.trim();

  if (!nickname) {
    nicknameHelper.textContent = "* 닉네임을 입력해주세요.";
    return false;
  }

  if (nickname.includes(" ")) {
    nicknameHelper.textContent = "* 띄어쓰기를 없애주세요.";
    return false;
  }

  if (nickname.length > NICKNAME_MAX_LENGTH) {
    nicknameHelper.textContent = `* 닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 작성 가능합니다.`;
    return false;
  }

  nicknameHelper.textContent = "";
  return true;
}

function isValidNickname(nickname) {
  return (
    nickname.length > 0 &&
    !nickname.includes(" ") &&
    nickname.length <= NICKNAME_MAX_LENGTH
  );
}


// === 수정 버튼 활성화 ===

function updateEditProfileSubmitButton() {
  const nickname = nicknameInput.value.trim();
  const hasChanged =
    nickname !== originalNickname || selectedProfileImageFile !== null;
  const isActive =
    isValidNickname(nickname) && hasChanged && !isUserLoading && !isUserUpdating;

  editProfileSubmitButton.disabled = !isActive;
}


// === 회원정보 수정 요청 ===

async function updateCurrentUser() {
  const requestBody = {
    nickname: nicknameInput.value.trim(),
    profileImage: selectedProfileImageFile
      ? selectedProfileImageFile.name
      : originalProfileImage,
  };

  isUserUpdating = true;
  updateEditProfileSubmitButton();

  try {
    const result = await request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(requestBody),
    });

    applyUpdatedUser(result.data);
    showEditProfileToast();
  } catch (error) {
    console.log(error);
    handleUpdateCurrentUserError(error);
  } finally {
    isUserUpdating = false;
    updateEditProfileSubmitButton();
  }
}

function applyUpdatedUser(user) {
  originalNickname = user.nickname || nicknameInput.value.trim();
  originalProfileImage = user.profileImage || originalProfileImage;
  selectedProfileImageFile = null;
  newProfileImageInput.value = "";
  clearProfileEditPreviewUrl();

  nicknameInput.value = originalNickname;
  renderProfileEditImage(originalProfileImage);

  const headerProfileImage = document.getElementById("profile-image");
  if (headerProfileImage && originalProfileImage) {
    headerProfileImage.src = resolveImageUrl(originalProfileImage);
  }
}

function handleEditProfileSubmit(event) {
  event.preventDefault();

  if (isUserUpdating || !validateNickname()) {
    return;
  }

  updateCurrentUser();
}


// === 회원정보 수정 예외 처리 ===

function handleReadCurrentUserError(error) {
  if (error?.status === 401 && error?.message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  alert("회원정보를 불러오는 중 오류가 발생했습니다.");
}

function handleUpdateCurrentUserError(error) {
  const status = error?.status;
  const message = error?.message;

  nicknameHelper.textContent = "";

  if (status === 400 && message === "blank_nickname") {
    nicknameHelper.textContent = "* 닉네임을 입력해주세요.";
    return;
  }

  if (status === 400 && message === "invalid_nickname_format") {
    nicknameHelper.textContent = `* 닉네임은 띄어쓰기 없이 최대 ${NICKNAME_MAX_LENGTH}자까지 작성 가능합니다.`;
    return;
  }

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 409 && message === "same_nickname") {
    nicknameHelper.textContent = "* 현재 사용 중인 닉네임과 같습니다.";
    return;
  }

  if (status === 409 && message === "nickname_already_exist") {
    nicknameHelper.textContent = "* 중복된 닉네임입니다.";
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("회원정보 수정 중 오류가 발생했습니다.");
}


// === 회원 탈퇴 확인 모달 ===

function openWithdrawalModal() {
  withdrawalModal.hidden = false;
  withdrawalConfirmButton.focus();
}

function closeWithdrawalModal() {
  if (isUserDeleting) {
    return;
  }

  withdrawalModal.hidden = true;
}

async function handleWithdrawalConfirm() {
  if (isUserDeleting) {
    return;
  }

  isUserDeleting = true;
  withdrawalCancelButton.disabled = true;
  withdrawalConfirmButton.disabled = true;

  try {
    await request("/users/me", {
      method: "DELETE",
    });

    location.href = "./login.html";
  } catch (error) {
    console.log(error);
    handleWithdrawalError(error);
  } finally {
    isUserDeleting = false;
    withdrawalCancelButton.disabled = false;
    withdrawalConfirmButton.disabled = false;
  }
}

function handleWithdrawalError(error) {
  const status = error?.status;
  const message = error?.message;

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("회원 탈퇴 중 오류가 발생했습니다.");
}

function handleWithdrawalModalClick(event) {
  if (event.target === withdrawalModal) {
    closeWithdrawalModal();
  }
}

function handlePageKeydown(event) {
  if (event.key === "Escape" && !withdrawalModal.hidden) {
    closeWithdrawalModal();
  }
}


// === 수정 완료 토스트 ===

function showEditProfileToast() {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  editProfileToast.hidden = false;
  toastTimer = setTimeout(function () {
    editProfileToast.hidden = true;
  }, EDIT_PROFILE_TOAST_DURATION_MS);
}


// === 이벤트 등록 및 페이지 초기화 ===

function bindEditProfileEvents() {
  newProfileImageInput.addEventListener("change", handleProfileImageChange);
  nicknameInput.addEventListener("input", updateEditProfileSubmitButton);
  nicknameInput.addEventListener("blur", validateNickname);
  editProfileForm.addEventListener("submit", handleEditProfileSubmit);

  withdrawalButton.addEventListener("click", openWithdrawalModal);
  withdrawalCancelButton.addEventListener("click", closeWithdrawalModal);
  withdrawalConfirmButton.addEventListener("click", handleWithdrawalConfirm);
  withdrawalModal.addEventListener("click", handleWithdrawalModalClick);
  document.addEventListener("keydown", handlePageKeydown);
  window.addEventListener("beforeunload", clearProfileEditPreviewUrl);
}

function initEditProfilePage() {
  bindEditProfileEvents();
  readCurrentUser();
}

initEditProfilePage();
