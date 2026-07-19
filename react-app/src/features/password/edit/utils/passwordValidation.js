import {
  isValidPassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../../auth/authValidation.js'

export const PASSWORD_FORMAT_ERROR =
  `* 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상, ${PASSWORD_MAX_LENGTH}자 이하이며, ` +
  '대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'

export function validateNewPassword(password) {
  if (!password) {
    return '* 비밀번호를 입력해주세요.'
  }

  if (!isValidPassword(password)) {
    return PASSWORD_FORMAT_ERROR
  }

  return ''
}

export function validatePasswordConfirm(password, passwordConfirm) {
  if (!passwordConfirm) {
    return '* 비밀번호를 한번 더 입력해주세요.'
  }

  if (password !== passwordConfirm) {
    return '* 비밀번호 확인과 다릅니다.'
  }

  return ''
}
