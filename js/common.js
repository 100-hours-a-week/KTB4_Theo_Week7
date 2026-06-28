// js/common.js 
// 공통적으로 사용하는 API 요청 함수

const BASE_URL = "http://127.0.0.1:8080"; // 백엔드 서버 주소

// DB에서 받은 이미지 파일명 또는 경로를 브라우저가 요청할 수 있는 URL로 변환
function resolveImageUrl(imagePath) {
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

async function request(url, options = {}) {
  const response = await fetch(BASE_URL + url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  const result = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw {
      status: response.status,
      message: result?.message,
      data: result?.data,
    };
  }

  return result;
}
