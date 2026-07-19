import { NICKNAME_MAX_LENGTH } from '../../../auth/authValidation.js'

export function validateNickname(nickname) {
  const trimmedNickname = nickname.trim()

  if (!trimmedNickname) {
    return '* 닉네임을 입력해주세요.'
  }

  if (trimmedNickname.includes(' ')) {
    return '* 띄어쓰기를 없애주세요.'
  }

  if (trimmedNickname.length > NICKNAME_MAX_LENGTH) {
    return `* 닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 작성 가능합니다.`
  }

  return ''
}
