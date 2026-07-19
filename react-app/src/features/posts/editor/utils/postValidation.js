export const POST_TITLE_MAX_LENGTH = 26

export function validatePostTitle(title) {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return '* 제목을 입력해주세요.'
  }

  if (trimmedTitle.length > POST_TITLE_MAX_LENGTH) {
    return `* 제목은 최대 ${POST_TITLE_MAX_LENGTH}자까지 작성 가능합니다.`
  }

  return ''
}

export function validatePostContent(content) {
  if (!content.trim()) {
    return '* 내용을 입력해주세요.'
  }

  return ''
}

export function isPostFormValid({ title, content }) {
  return !validatePostTitle(title) && !validatePostContent(content)
}
