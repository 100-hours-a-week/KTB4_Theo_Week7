// 회원가입 페이지 js

import { request } from "./common.js";
import {
  isValidEmail,
  isValidPassword,
  NICKNAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./validation.js";

// === 프로필 이미지 선택 및 미리보기 ===

// 파일 선택 input 요소
const profileImageInput = document.getElementById("profile-image");
// 선택한 프로필 이미지를 화면에 미리보기로 보여줄 img 태그
const profilePreview = document.getElementById("profile-preview");
// 프로필 이미지 관련 안내 문구를 출력할 p 태그
const profileHelper = document.getElementById("profile-helper");
// 프로필 이미지가 없을 때 보이는 + 버튼 요소
const profilePlus = document.getElementById("profile-plus");
// 프로필 이미지 원형 영역 전체
const profileImageBox = document.getElementById("profile-image-box");

// 사용자가 선택한 프로필 사진 파일
let selectedProfileFile = null;
// 브라우저가 미리보기 용으로 만든 임시 이미지 URL
let profilePreviewUrl = null;

// 프로필 이미지 선택 input 요소에 change 이벤트 리스너 등록
profileImageInput.addEventListener("change", function () {
  // input type = "file"에서 사용자가 선택한 첫번째 파일을 꺼내기
  // files 는 배열처럼 생긴 객체에서 첫번째 파일을 가져오기 위해 [0]으로 접근
  const file = profileImageInput.files[0];

  // 파일을 선택하지 않은 경우에는 더이상 진행하지 않고 함수 종료
  if (!file) {
    validateProfileImage();
    updateSignupButton();
    return;
  }

  // 선택한 파일을 변수에 저장
  selectedProfileFile = file;

  // 이전에 만들어둔 미리보기 URL이 있다면 메모리에서 해제
  // 새로운 이미지를 다시 선택 시 기존 URL을 해제하지 않으면 메모리 누수가 발생할 수 있음
  if (profilePreviewUrl) {
    URL.revokeObjectURL(profilePreviewUrl);
  }

  // 선택한 파일을 브라우저에 임시로 볼 수 있는 url 로 생성
  // 해당 url은 브라우저가 임시로 만들어주는 url이므로 실제 서버에 업로드되는 url이 아님
  profilePreviewUrl = URL.createObjectURL(file);

  // img 태그의 src에 미리보기 사진 url 넣는 것
  profilePreview.src = profilePreviewUrl;
  // 숨겨져있던 img 태그를 화면에 보이도록 변경
  profilePreview.style.display = "block";
  // + 버튼은 숨김 처리
  profilePlus.style.display = "none";

  // 안내 문구를 숨김 처리
  validateProfileImage();
  // 회원가입 버튼 활성화 여부 업데이트
  updateSignupButton();
});

// 프로필 이미지 원형 영역을 클릭했을 때 실행
profileImageBox.addEventListener("click", function (event) {
  // 아직 선택된 프로필 이미지가 없다면 검증 후 파일 선택창은 그대로 연다
  if (!selectedProfileFile) {
    // 프로필 영역을 확인했지만 이미지가 없으면 helper text 표시
    validateProfileImage();
    return;
  }

  // label의 기본 동작을 막습니다.
  // profileImageBox는 label이라서 클릭하면 원래 파일 선택창이 열린다.
  // 이미지를 삭제하려는 상황에서는 파일 선택창이 열리지 않게 막는다.
  event.preventDefault();

  // 실제로 프로필 이미지를 제거
  removeProfileImage();

  // 이미지가 없어졌으므로 helper text가 다시 표시
  validateProfileImage();

  // 회원가입 버튼 활성화 여부를 다시 확인
  // 이미지가 없어졌으므로 버튼은 비활성화
  updateSignupButton();
});

// 프로필 이미지 검증하는 함수
function validateProfileImage() {
  // 선택된 프로필 이미지 파일이 없으면
  if (!selectedProfileFile) {
    // helper text에 에러 메시지를 출력합니다.
    profileHelper.textContent = "* 프로필 사진을 추가해주세요.";

    // 검증 실패를 의미하는 false 반환
    return false;
  }

  // 선택된 프로필 이미지가 있으면 helper text를 비웁니다.
  profileHelper.textContent = "";

  // 검증 성공을 의미하는 true 반환
  return true;
}

// 프로필 이미지 제거하는 함수
function removeProfileImage() {
  // 선택된 파일 상태를 비웁니다.
  selectedProfileFile = null;

  // input type="file"의 값도 비웁니다.
  // 이걸 하지 않으면 같은 파일을 다시 선택했을 때 change 이벤트가 안 뜰 수 있습니다.
  profileImageInput.value = "";

  // 미리보기용 URL이 있다면 메모리에서 해제합니다.
  if (profilePreviewUrl) {
    URL.revokeObjectURL(profilePreviewUrl);

    // URL 상태 변수도 비웁니다.
    profilePreviewUrl = null;
  }

  // img 태그의 src를 비웁니다.
  profilePreview.src = "";

  // 미리보기 img 태그를 다시 숨깁니다.
  profilePreview.style.display = "none";

  // + 표시를 다시 보이게 합니다.
  profilePlus.style.display = "block";
}

// === 이메일 입력 검증 ===

// 이메일 입력
const emailInput = document.getElementById("email");
// 이메일 입력 안내 문구
const emailHelper = document.getElementById("email-helper");

// 이메일 입력창에서 포커스가 벗어났을 때 검증
// blur 이벤트는 input 요소에서 포커스가 벗어났을 때 발생하는 이벤트
emailInput.addEventListener("blur", function () {
  validateEmail(); // 이메일이 비어있는지 확인
  updateSignupButton(); // 회원가입 버튼 활성화 여부
});

// 사용자가 이메일 입력하는 동안 실행
emailInput.addEventListener("input", function () {
  updateSignupButton();
});

// 이메일 검증
function validateEmail() { 
  const email = emailInput.value.trim();

  if (!email) { // 이메일 값이 비어있는 경우
    emailHelper.textContent = "* 이메일을 입력해주세요.";
    return false;
  }

  if (!isValidEmail(email)) { // 이메일 형식이 올바르지 않은 경우
    emailHelper.textContent =
      "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
    return false;
  }

  emailHelper.textContent = "";
  return true;
}

// === 비밀번호 입력 검증 ===

const passwordInput = document.getElementById("password");
const passwordHelper = document.getElementById("password-helper");

const passwordConfirmInput = document.getElementById("password-confirm");
const passwordConfirmHelper = document.getElementById("password-confirm-helper");

// 비밀번호 입력창에서 포커스가 벗어났을 때 검증
passwordInput.addEventListener("blur", function () {
  validatePassword();
  validatePasswordConfirm();
  updateSignupButton();
});

// 비밀번호 입력하는 동안 회원가입 버튼 활성화 여부 확인
passwordInput.addEventListener("input", function () {
  updateSignupButton();
});

passwordConfirmInput.addEventListener("blur", function () {
  validatePasswordConfirm();
  updateSignupButton();
});

passwordConfirmInput.addEventListener("input", function () {
  updateSignupButton();
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

// 비밀번호 확인 검증
function validatePasswordConfirm() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  if (!passwordConfirm) {
    passwordConfirmHelper.textContent =
      "* 비밀번호를 한번 더 입력해주세요.";
    return false;
  }

  if (password !== passwordConfirm) {
    passwordConfirmHelper.textContent = "* 비밀번호가 다릅니다.";
    return false;
  }

  passwordConfirmHelper.textContent = "";
  return true;
}

// === 닉네임 입력 검증 ===

const nicknameInput = document.getElementById("nickname");
const nicknameHelper = document.getElementById("nickname-helper");

nicknameInput.addEventListener("blur", function () {
  validateNickname();
  updateSignupButton();
});

nicknameInput.addEventListener("input", function () {
  updateSignupButton();
});

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
    nicknameHelper.textContent =
      `* 닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 작성 가능합니다.`;
    return false;
  }

  nicknameHelper.textContent = "";
  return true;
}

function isValidNickname(nickname) {
  return nickname && !nickname.includes(" ") && nickname.length <= NICKNAME_MAX_LENGTH;
}

// === 회원가입 버튼 활성화 ===

const signupButton = document.getElementById("signup-button");
let isSignupSubmitting = false;

function isSignupFormValid() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value.trim();

  return (
    selectedProfileFile !== null &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    password === passwordConfirm &&
    isValidNickname(nickname)
  );
}

function updateSignupButton() {
  const isValid = isSignupFormValid();
  const isActive = isValid && !isSignupSubmitting;

  signupButton.disabled = !isActive;
  signupButton.classList.toggle("active", isActive);
}

// === 회원가입 요청 ===
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // 브라우저 기본 폼 제출 막기

  if (isSignupSubmitting) {
    return;
  }

  const isValid =
    validateProfileImage() &&
    validateEmail() &&
    validatePassword() &&
    validatePasswordConfirm() &&
    validateNickname();

  updateSignupButton();

  if (!isValid) {
    return; // 유효성 검증 실패 시 회원가입 요청 중단
  }

  // 요청 form body 생성
  const requestBody = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
    passwordConfirm: passwordConfirmInput.value,
    nickname: nicknameInput.value.trim(),
    profileImage: selectedProfileFile ? selectedProfileFile.name : null, // 파일 이름만 전송
  };

  isSignupSubmitting = true;
  updateSignupButton();

  try {
    await request("/users/signup", {
      method: "POST",
      body: JSON.stringify(requestBody),
      includeAccessToken: false,
      retryOnUnauthorized: false,
    });

    alert("회원가입이 완료되었습니다.");
    location.href = "login.html"; // 회원가입 성공 시 로그인 페이지로 리디렉션
  } catch (error) {
    console.log(error);
    handleSignupError(error);
  } finally {
    isSignupSubmitting = false;
    updateSignupButton();
  }
});

function handleSignupError(error) {
  const status = error?.status;
  const message = error?.message;

  clearSignupErrorMessages(); // 이전 에러 메시지 초기화

  if (status === 400) {
    handleSignupBadRequest(message);
    return;
  }

  if (status === 409) {
    handleSignupConflict(message);
    return;
  }

  if (status === 500) {
    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
}

function handleSignupBadRequest(message) {
  if (message === "invalid_request") {
    alert("입력값을 다시 확인해주세요.");
    return;
  }

  if (message === "invalid_email_format") {
    emailHelper.textContent = "* 올바른 이메일 주소 형식을 입력해주세요.";
    return;
  }

  if (message === "invalid_password_format") {
    passwordHelper.textContent =
      `* 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상, ${PASSWORD_MAX_LENGTH}자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.`;
    return;
  }

  if (message === "invalid_nickname_format") {
    nicknameHelper.textContent =
      `* 닉네임은 띄어쓰기 없이 최대 ${NICKNAME_MAX_LENGTH}자까지 작성 가능합니다.`;
    return;
  }

  alert("입력값을 다시 확인해주세요.");
}

function handleSignupConflict(message) {
  if (message === "email_already_exist") {
    emailHelper.textContent = "* 중복된 이메일입니다.";
    return;
  }

  if (message === "nickname_already_exist") {
    nicknameHelper.textContent = "* 중복된 닉네임입니다.";
    return;
  }

  alert("이미 사용 중인 정보가 있습니다.");
}

function clearSignupErrorMessages() {
  emailHelper.textContent = "";
  passwordHelper.textContent = "";
  passwordConfirmHelper.textContent = "";
  nicknameHelper.textContent = "";
}
