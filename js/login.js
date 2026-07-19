// 로그인 페이지 js

import { request, saveAccessToken } from "./common.js";
import {
  isValidEmail,
  isValidPassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./validation.js";

// === 이메일 입력 검증 ===

// 이메일 입력
const emailInput = document.getElementById("email");
// 이메일 입력 안내 문구
const emailHelper = document.getElementById("email-helper");

// 이메일 입력창에서 포커스가 벗어났을 때 검증
emailInput.addEventListener("blur", function () {
  validateEmail();
  updateLoginButton();
});

// 사용자가 이메일 입력하는 동안 로그인 버튼 활성화 여부 확인
emailInput.addEventListener("input", function () {
  updateLoginButton();
});

// 이메일 검증
function validateEmail() {
  const email = emailInput.value.trim();

  if (!email) {
    emailHelper.textContent = "* 이메일을 입력해주세요.";
    return false;
  }

  if (!isValidEmail(email)) {
    emailHelper.textContent =
      "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
    return false;
  }

  emailHelper.textContent = "";
  return true;
}

// === 비밀번호 입력 검증 ===

const passwordInput = document.getElementById("password");
const passwordHelper = document.getElementById("password-helper");

// 비밀번호 입력창에서 포커스가 벗어났을 때 검증
passwordInput.addEventListener("blur", function () {
  validatePassword();
  updateLoginButton();
});

// 사용자가 비밀번호 입력하는 동안 로그인 버튼 활성화 여부 확인
passwordInput.addEventListener("input", function () {
  updateLoginButton();
});

// 비밀번호 검증
function validatePassword() {
  const password = passwordInput.value;

  if (!password) {
    passwordHelper.textContent = "* 비밀번호를 입력해주세요.";
    return false;
  }

  if (!isValidPassword(password)) {
    passwordHelper.textContent =
      `* 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상, ${PASSWORD_MAX_LENGTH}자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.`;
    return false;
  }

  passwordHelper.textContent = "";
  return true;
}

// === 로그인 버튼 활성화 ===

const loginButton = document.getElementById("login-button");
let isLoginSubmitting = false; // 로그인 요청 중인지 여부를 나타내는 상태 변수

function isLoginFormValid() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  return isValidEmail(email) && isValidPassword(password);
}

function updateLoginButton() {
  const isValid = isLoginFormValid();
  const isActive = isValid && !isLoginSubmitting; // 로그인 요청 중이 아니고, 입력값이 유효한 경우에만 버튼 활성화

  loginButton.disabled = !isActive;
  loginButton.classList.toggle("active", isActive); // 버튼 활성화 상태에 따라서 클래스 토글
}

// === 로그인 요청 ===

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // 브라우저 기본 폼 제출 막기

  if (isLoginSubmitting) {
    return;
  }

  const isValid =
    validateEmail() &&
    validatePassword();

  updateLoginButton();

  if (!isValid) {
    return; // 유효성 검증 실패 시 로그인 요청 중단
  }

  // 요청 body 생성
  const requestBody = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  isLoginSubmitting = true;
  updateLoginButton();

  try {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      includeAccessToken: false,
      retryOnUnauthorized: false,
    });

    saveAccessToken(result.data?.accessToken);

    location.href = "posts.html"; // 게시글 목록 조회 페이지로 이동
  } catch (error) {
    console.log(error);
    handleLoginError(error);
  } finally {
    isLoginSubmitting = false;
    updateLoginButton();
  }
});

// === 로그인 예외 처리 ===

function handleLoginError(error) {
  const status = error?.status;
  const message = error?.message;

  clearLoginErrorMessages();

  if (status === 400) {
    handleLoginBadRequest(message);
    return;
  }

  if (status === 401) {
    handleLoginUnauthorized(message);
    return;
  }

  if (status === 429) {
    handleTooManyLoginAttempts(message);
    return;
  }

  if (status === 500) {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
}

function handleLoginBadRequest(message) {
  if (message === "invalid_request") {
    alert("입력값을 다시 확인해주세요.");
    return;
  }

  if (message === "invalid_email_format") {
    emailHelper.textContent =
      "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
    return;
  }

  alert("입력값을 다시 확인해주세요.");
}

function handleLoginUnauthorized(message) {
  if (message === "invalid_credentials") {
    passwordHelper.textContent =
      "* 아이디 또는 비밀번호를 확인해주세요.";
    return;
  }

  alert("아이디 또는 비밀번호를 확인해주세요.");
}

function handleTooManyLoginAttempts(message) {
  if (message === "too_many_login_attempts") {
    alert("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
}

function clearLoginErrorMessages() {
  emailHelper.textContent = "";
  passwordHelper.textContent = "";
}
