import { useState } from 'react'
import FormField from '../../../../components/form/FormField.jsx'
import { isValidPassword } from '../../../auth/authValidation.js'
import {
  validateNewPassword,
  validatePasswordConfirm,
} from '../utils/passwordValidation.js'

const EMPTY_ERRORS = {
  password: '',
  passwordConfirm: '',
}

function PasswordEditForm({
  isSubmitting,
  serverErrors = EMPTY_ERRORS,
  onClearServerError,
  onSubmit,
}) {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS)
  const canSubmit =
    isValidPassword(password) &&
    password === passwordConfirm &&
    !isSubmitting
  const passwordError = fieldErrors.password || serverErrors.password || ''
  const passwordConfirmError =
    fieldErrors.passwordConfirm || serverErrors.passwordConfirm || ''

  function handlePasswordBlur() {
    const nextPasswordError = validateNewPassword(password)

    setFieldErrors((currentErrors) => ({
      password: nextPasswordError,
      passwordConfirm: passwordConfirm
        ? validatePasswordConfirm(password, passwordConfirm)
        : currentErrors.passwordConfirm,
    }))
    onClearServerError('password')

    if (passwordConfirm) {
      onClearServerError('passwordConfirm')
    }
  }

  function handlePasswordConfirmBlur() {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      passwordConfirm: validatePasswordConfirm(password, passwordConfirm),
    }))
    onClearServerError('passwordConfirm')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextPasswordError = validateNewPassword(password)

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      password: nextPasswordError,
    }))

    if (nextPasswordError) {
      return
    }

    const nextPasswordConfirmError = validatePasswordConfirm(
      password,
      passwordConfirm,
    )

    setFieldErrors({
      password: '',
      passwordConfirm: nextPasswordConfirmError,
    })

    if (nextPasswordConfirmError) {
      return
    }

    onSubmit({ password, passwordConfirm })
  }

  return (
    <form className="edit-password-card" onSubmit={handleSubmit} noValidate>
      <FormField
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        guide="8~20자, 대문자·소문자·숫자·특수문자를 각각 1개 이상 포함해주세요."
        guideClassName="edit-password-guide"
        helperClassName="edit-password-helper"
        placeholder="비밀번호를 입력하세요"
        autoComplete="new-password"
        value={password}
        error={passwordError}
        className="edit-password-form-group"
        onChange={(event) => setPassword(event.target.value)}
        onBlur={handlePasswordBlur}
      />

      <FormField
        id="password-confirm"
        name="passwordConfirm"
        type="password"
        label="비밀번호 확인"
        guide="위에 입력한 비밀번호와 동일하게 입력해주세요."
        guideClassName="edit-password-guide"
        helperClassName="edit-password-helper"
        placeholder="비밀번호를 한번 더 입력하세요"
        autoComplete="new-password"
        value={passwordConfirm}
        error={passwordConfirmError}
        className="edit-password-form-group"
        onChange={(event) => setPasswordConfirm(event.target.value)}
        onBlur={handlePasswordConfirmBlur}
      />

      <button
        type="submit"
        className="edit-password-submit-button"
        disabled={!canSubmit}
      >
        수정하기
      </button>
    </form>
  )
}

export default PasswordEditForm
