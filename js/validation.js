// js/validation.js
// 여러 페이지에서 공통으로 사용하는 입력값 검증 함수

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;
export const NICKNAME_MAX_LENGTH = 10;
export const POST_TITLE_MAX_LENGTH = 26;

export function isValidPassword(password) {
  const passwordRegex = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};':"\\\\|,.<>/?]).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`
  );

  return passwordRegex.test(password);
}

export function isValidPostTitle(title) {
  const trimmedTitle = title.trim();
  return trimmedTitle.length > 0 && trimmedTitle.length <= POST_TITLE_MAX_LENGTH;
}

export function isValidPostContent(content) {
  return content.trim().length > 0;
}

export function validatePostTitleInput(titleInput, titleHelper) {
  const title = titleInput.value.trim();

  if (!title) {
    titleHelper.textContent = "* 제목을 입력해주세요.";
    return false;
  }

  if (title.length > POST_TITLE_MAX_LENGTH) {
    titleHelper.textContent = `* 제목은 최대 ${POST_TITLE_MAX_LENGTH}자까지 작성 가능합니다.`;
    return false;
  }

  titleHelper.textContent = "";
  return true;
}

export function validatePostContentInput(contentInput, contentHelper) {
  const content = contentInput.value.trim();

  if (!content) {
    contentHelper.textContent = "* 내용을 입력해주세요.";
    return false;
  }

  contentHelper.textContent = "";
  return true;
}

export function isPostFormValid(titleInput, contentInput) {
  return (
    isValidPostTitle(titleInput.value) &&
    isValidPostContent(contentInput.value)
  );
}
