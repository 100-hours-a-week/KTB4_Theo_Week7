export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 20
export const NICKNAME_MAX_LENGTH = 10

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password) {
  const passwordRegex = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};':"\\\\|,.<>/?]).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`,
  )

  return passwordRegex.test(password)
}

export function isValidNickname(nickname) {
  return (
    nickname.length > 0 &&
    !nickname.includes(' ') &&
    nickname.length <= NICKNAME_MAX_LENGTH
  )
}

export function isPasswordConfirmed(password, passwordConfirm) {
  return passwordConfirm.length > 0 && password === passwordConfirm
}
