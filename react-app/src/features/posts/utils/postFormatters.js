export const POST_TITLE_MAX_LENGTH = 26
export const COUNT_COMPACT_THRESHOLD = 1000

export function formatPostCount(count) {
  const safeCount = Number(count) || 0

  if (safeCount >= COUNT_COMPACT_THRESHOLD) {
    return `${Math.floor(safeCount / COUNT_COMPACT_THRESHOLD)}k`
  }

  return String(safeCount)
}

export function formatPostDate(createdAt) {
  if (!createdAt) {
    return ''
  }

  return createdAt.replace('T', ' ').split('.')[0]
}

export function formatPostListDate(createdAt) {
  const formattedDate = formatPostDate(createdAt)

  if (!formattedDate) {
    return ''
  }

  return formattedDate.split(' ')[0].replaceAll('-', '.')
}

export function getPostTitle(post) {
  if (post.blinded) {
    return '숨김 처리된 게시글입니다.'
  }

  const title = post.title || ''

  return title.length > POST_TITLE_MAX_LENGTH
    ? title.slice(0, POST_TITLE_MAX_LENGTH)
    : title
}

export function getPostNickname(post) {
  if (post.authorDeleted) {
    return '알 수 없음'
  }

  return post.nickname || ''
}
