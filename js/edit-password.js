// 비밀번호 수정 페이지 js

// === DOM 요소 ===

const editPasswordForm = document.getElementById("edit-password-form");
const passwordInput = document.getElementById("password");
const passwordHelper = document.getElementById("password-helper");
const passwordConfirmInput = document.getElementById("password-confirm");
const passwordConfirmHelper = document.getElementById("password-confirm-helper");
const editPasswordSubmitButton = document.getElementById("edit-password-submit-button");
const editPasswordToast = document.getElementById("edit-password-toast");


// === 페이지 상태 ===

let isPasswordUpdating = false;
let toastTimer = null;


// === 비밀번호 검증 ===

function validatePassword() {
  const password = passwordInput.value;

  if (!password) {
    passwordHelper.textContent = "* 비밀번호를 입력해주세요.";
    return false;
  }

  if (!isValidPassword(password)) {
    passwordHelper.textContent =
      "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
    return false;
  }

  passwordHelper.textContent = "";
  return true;
}

function validatePasswordConfirm() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  if (!passwordConfirm) {
    passwordConfirmHelper.textContent = "* 비밀번호를 한번 더 입력해주세요.";
    return false;
  }

  if (password !== passwordConfirm) {
    passwordConfirmHelper.textContent = "* 비밀번호 확인과 다릅니다.";
    return false;
  }

  passwordConfirmHelper.textContent = "";
  return true;
}


// === 수정 버튼 활성화 ===

function isEditPasswordFormValid() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  return isValidPassword(password) && password === passwordConfirm;
}

function updateEditPasswordSubmitButton() {
  const isValid = isEditPasswordFormValid();
  const isActive = isValid && !isPasswordUpdating;

  editPasswordSubmitButton.disabled = !isActive;
}


// === 비밀번호 수정 요청 ===

async function updatePassword() {
  const requestBody = {
    password: passwordInput.value,
    passwordConfirm: passwordConfirmInput.value,
  };

  isPasswordUpdating = true;
  updateEditPasswordSubmitButton();

  try {
    const result = await request("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify(requestBody),
    });

    if (result?.message !== "password_update_success") {
      throw new Error("비밀번호 수정 응답 형식이 올바르지 않습니다.");
    }

    resetEditPasswordForm();
    showEditPasswordToast();
  } catch (error) {
    console.log(error);
    handleUpdatePasswordError(error);
  } finally {
    isPasswordUpdating = false;
    updateEditPasswordSubmitButton();
  }
}

function handleEditPasswordSubmit(event) {
  event.preventDefault();

  if (isPasswordUpdating) {
    return;
  }

  const isValid = validatePassword() && validatePasswordConfirm();
  updateEditPasswordSubmitButton();

  if (!isValid) {
    return;
  }

  updatePassword();
}

function resetEditPasswordForm() {
  passwordInput.value = "";
  passwordConfirmInput.value = "";
  passwordHelper.textContent = "";
  passwordConfirmHelper.textContent = "";
}


// === 비밀번호 수정 예외 처리 ===

function handleUpdatePasswordError(error) {
  const status = error?.status;
  const message = error?.message;

  passwordHelper.textContent = "";
  passwordConfirmHelper.textContent = "";

  if (status === 400 && message === "blank_password") {
    passwordHelper.textContent = "* 비밀번호를 입력해주세요.";
    return;
  }

  if (status === 400 && message === "invalid_password_format") {
    passwordHelper.textContent =
      "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
    return;
  }

  if (status === 400 && message === "password_mismatch") {
    passwordConfirmHelper.textContent = "* 비밀번호 확인과 다릅니다.";
    return;
  }

  if (status === 401 && message === "unauthorized_request") {
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return;
  }

  if (
    status === 409 &&
    (message === "same_password" || message === "same password")
  ) {
    passwordHelper.textContent = "* 기존 비밀번호와 다른 비밀번호를 입력해주세요.";
    return;
  }

  if (status === 500 && message === "internal_server_error") {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("비밀번호 수정 중 오류가 발생했습니다.");
}


// === 수정 완료 토스트 ===

function showEditPasswordToast() {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  editPasswordToast.hidden = false;
  toastTimer = setTimeout(function () {
    editPasswordToast.hidden = true;
  }, 2000);
}


// === 이벤트 등록 및 페이지 초기화 ===

function bindEditPasswordEvents() {
  passwordInput.addEventListener("input", updateEditPasswordSubmitButton);
  passwordInput.addEventListener("blur", function () {
    validatePassword();

    if (passwordConfirmInput.value) {
      validatePasswordConfirm();
    }
  });

  passwordConfirmInput.addEventListener("input", updateEditPasswordSubmitButton);
  passwordConfirmInput.addEventListener("blur", validatePasswordConfirm);
  editPasswordForm.addEventListener("submit", handleEditPasswordSubmit);
}

function initEditPasswordPage() {
  bindEditPasswordEvents();
  updateEditPasswordSubmitButton();
}

initEditPasswordPage();
