// js/profile-menu.js
// 프로필 메뉴가 있는 모든 페이지에서 공통으로 사용하는 토글 및 로그아웃 기능

import {
  clearAccessToken,
  DEFAULT_PROFILE_IMAGE_URL,
  request,
  resolveImageUrl,
} from "./common.js";

const profileMenuContainer = document.getElementById("profile-menu-container");

if (profileMenuContainer) {
  const profileButton = document.getElementById("profile-button");
  const profileImage = document.getElementById("profile-image");
  const profileMenu = document.getElementById("profile-menu");
  const logoutButton = document.getElementById("logout-button");

  let isLogoutSubmitting = false;

  async function readCurrentUserProfileImage() {
    try {
      const result = await request("/users/me", {
        method: "GET",
      });

      const profileImagePath = result.data?.profileImage;

      if (!profileImagePath) {
        setDefaultProfileImage();
        return;
      }

      profileImage.src = resolveImageUrl(profileImagePath);
      profileImage.classList.remove("default-profile-image");
    } catch (error) {
      console.log(error);

      if (error?.status === 401) {
        location.href = "./login.html";
      }
    }
  }

  function setDefaultProfileImage() {
    profileImage.src = DEFAULT_PROFILE_IMAGE_URL;
    profileImage.classList.add("default-profile-image");
  }

  // 프로필 메뉴의 열림/닫힘 상태를 설정하는 함수 (토글 형식)
  function setProfileMenuOpen(isOpen) {
    profileMenu.hidden = !isOpen;
    profileButton.setAttribute("aria-expanded", String(isOpen));
  }

  function toggleProfileMenu() {
    setProfileMenuOpen(profileMenu.hidden);
  }

  function handleProfileButtonClick(event) {
    event.stopPropagation(); // 클릭 이벤트가 문서 전체로 전파되는 것을 막아, 메뉴 외부 클릭 시 닫히는 동작과 충돌하지 않도록 함
    toggleProfileMenu();
  }

  function handleDocumentClick(event) { 
     // 문서 전체 클릭 이벤트가 발생했을 때, 클릭된 요소가 프로필 메뉴 컨테이너 내부에 포함되어 있지 않다면 메뉴를 닫는다.
    if (!profileMenuContainer.contains(event.target)) {
      setProfileMenuOpen(false);
    }
  }

  function handleDocumentKeydown(event) {
    // ESC 키를 눌렀을 때 메뉴가 열려 있다면 메뉴를 닫고, 프로필 버튼에 포커스를 이동시킨다.
    if (event.key === "Escape" && !profileMenu.hidden) {
      setProfileMenuOpen(false);
      profileButton.focus();
    }
  }

  // 로그아웃 요청 처리 함수
  async function handleLogout() {
    if (isLogoutSubmitting) {
      return;
    }

    isLogoutSubmitting = true;
    logoutButton.disabled = true;

    try {
      await request("/auth/logout", {
        method: "POST",
        includeAccessToken: false,
        retryOnUnauthorized: false,
      });

      clearAccessToken();
      location.href = "./login.html";
    } catch (error) {
      console.log(error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      isLogoutSubmitting = false;
      logoutButton.disabled = false;
    }
  }

  profileButton.addEventListener("click", handleProfileButtonClick);
  logoutButton.addEventListener("click", handleLogout);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);

  profileImage.addEventListener("error", function () {
    setDefaultProfileImage();
  });

  readCurrentUserProfileImage();
}
