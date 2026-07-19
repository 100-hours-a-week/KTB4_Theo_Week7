// js/common.js 
// 공통적으로 사용하는 API 요청 함수

export const BASE_URL = "http://127.0.0.1:8080"; // 백엔드 서버 주소
export const COUNT_COMPACT_THRESHOLD = 1000;
export const DEFAULT_PROFILE_IMAGE_URL = "../assets/images/basic-profile-icon.png";

let accessToken = null;
let reissuePromise = null;

export function getAccessToken() {
  return accessToken;
}

export function saveAccessToken(newAccessToken) {
  if (!newAccessToken) {
    throw new Error("로그인 응답에 액세스 토큰이 없습니다.");
  }

  accessToken = newAccessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getPostIdFromUrl() {
  const searchParams = new URLSearchParams(location.search);
  const postId = Number(searchParams.get("postId"));

  if (!Number.isInteger(postId) || postId <= 0) {
    return null;
  }

  return postId;
}

// DB에서 받은 이미지 파일명 또는 경로를 브라우저가 요청할 수 있는 URL로 변환
export function resolveImageUrl(imagePath) {
  if (!imagePath) {
    return "";
  }

  // 이미 완성된 URL이나 브라우저 미리보기 URL이면 그대로 사용 (이후 옵션)
  // if (/^(https?:|blob:|data:)/i.test(imagePath)) {
  //   return imagePath;
  // }

  // 백엔드가 /images/... 형태의 경로를 내려주는 경우 (이후 옵션)
  // if (imagePath.startsWith("/")) {
  //   return BASE_URL + encodeURI(imagePath);
  // }

  // 파일명만 내려주는 경우 resources/static/images 경로와 결합
  return `${BASE_URL}/images/${encodeURIComponent(imagePath)}`;
}

export function formatPostDate(createdAt) {
  if (!createdAt) {
    return "";
  }

  return createdAt.replace("T", " ").split(".")[0];
}

export function formatPostCount(count) {
  const safeCount = Number(count) || 0;

  if (safeCount >= COUNT_COMPACT_THRESHOLD) {
    return `${Math.floor(safeCount / COUNT_COMPACT_THRESHOLD)}k`;
  }

  return String(safeCount);
}

export function getDisplayNickname(nickname, authorDeleted) {
  return authorDeleted ? "알 수 없음" : nickname || "";
}

async function parseResponse(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function createRequestError(response, result) {
  return {
    status: response.status,
    message: result?.message,
    data: result?.data,
  };
}


async function fetchApi(url, options = {}) {
  const {
    includeAccessToken = true,
    retryOnUnauthorized: _retryOnUnauthorized,
    ...fetchOptions
  } = options;
  const accessToken = getAccessToken();

  return fetch(BASE_URL + url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(includeAccessToken &&
        accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });
}

// 액세스 토큰 재발급 요청
async function reissueAccessToken() {
  // 여러 API 요청이 동시에 401을 받아도 재발급 요청은 한 번만 보낸다.
  if (!reissuePromise) {
    reissuePromise = fetch(BASE_URL + "/auth/reissue", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async function (response) {
        const result = await parseResponse(response);

        if (!response.ok) {
          throw createRequestError(response, result);
        }

        saveAccessToken(result?.data?.accessToken);
      })
      .catch(function (error) {
        clearAccessToken();
        throw error;
      })
      .finally(function () {
        reissuePromise = null;
      });
  }

  return reissuePromise;
}

export async function request(url, options = {}) {
  const shouldUseAccessToken = options.includeAccessToken !== false;
  const shouldRetryUnauthorized = options.retryOnUnauthorized !== false;

  // 페이지 이동으로 메모리의 액세스 토큰이 사라진 경우,
  // 보호 API를 먼저 실패시키지 않고 Refresh Token 쿠키로 토큰부터 재발급한다.
  if (
    shouldUseAccessToken &&
    shouldRetryUnauthorized &&
    !getAccessToken()
  ) {
    await reissueAccessToken();
  }

  let response = await fetchApi(url, options);

  // 액세스 토큰 만료 시 Refresh Token 쿠키로 재발급한 뒤 원래 요청을 한 번만 재시도한다.
  if (response.status === 401 && shouldRetryUnauthorized) {
    await reissueAccessToken();
    response = await fetchApi(url, options);
  }

  const result = await parseResponse(response);

  if (!response.ok) {
    throw createRequestError(response, result);
  }

  return result;
}
