export const COMMENT_MAX_LENGTH = 50

export function validateComment(content) {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    return '* 댓글 내용을 입력해주세요.'
  }

  if (trimmedContent.length > COMMENT_MAX_LENGTH) {
    return `* 댓글은 최대 ${COMMENT_MAX_LENGTH}자까지 작성 가능합니다.`
  }

  return ''
}
