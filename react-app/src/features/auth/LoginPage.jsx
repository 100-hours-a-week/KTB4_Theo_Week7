import { useState } from 'react'
import { useNavigate } from 'react-router'
import FormField from '../../components/form/FormField.jsx'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import '../../styles/common.css'
import '../../styles/login.css'
import {
  isValidEmail,
  isValidPassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './authValidation.js'
import useAuth from './useAuth.js'

const EMAIL_FORMAT_ERROR =
  '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)'
const PASSWORD_FORMAT_ERROR =
  `* 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상, ${PASSWORD_MAX_LENGTH}자 이하이며, ` +
  '대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'

function getEmailError(email) {
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    return '* 이메일을 입력해주세요.'
  }

  if (!isValidEmail(trimmedEmail)) {
    return EMAIL_FORMAT_ERROR
  }

  return ''
}

function getPasswordError(password) {
  if (!password) {
    return '* 비밀번호를 입력해주세요.'
  }

  if (!isValidPassword(password)) {
    return PASSWORD_FORMAT_ERROR
  }

  return ''
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isFormValid =
    isValidEmail(email.trim()) && isValidPassword(password)
  const canSubmit = isFormValid && !isSubmitting

  function handleEmailChange(event) {
    setEmail(event.target.value)
  }

  function handleEmailBlur() {
    setErrors((currentErrors) => ({
      ...currentErrors,
      email: getEmailError(email),
    }))
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)
  }

  function handlePasswordBlur() {
    setErrors((currentErrors) => ({
      ...currentErrors,
      password: getPasswordError(password),
    }))
  }

  function handleLoginError(error) {
    const status = error?.status
    const message = error?.message

    setErrors({ email: '', password: '' })

    if (status === 400) {
      if (message === 'invalid_email_format') {
        setErrors({ email: EMAIL_FORMAT_ERROR, password: '' })
        return
      }

      alert('입력값을 다시 확인해주세요.')
      return
    }

    if (status === 401) {
      if (message === 'invalid_credentials') {
        setErrors({
          email: '',
          password: '* 아이디 또는 비밀번호를 확인해주세요.',
        })
        return
      }

      alert('아이디 또는 비밀번호를 확인해주세요.')
      return
    }

    if (status === 429) {
      alert('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (status === 500) {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const emailError = getEmailError(email)

    if (emailError) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email: emailError,
      }))
      return
    }

    const passwordError = getPasswordError(password)

    if (passwordError) {
      setErrors({ email: '', password: passwordError })
      return
    }

    setErrors({ email: '', password: '' })
    setIsSubmitting(true)

    try {
      await login({
        email: email.trim(),
        password,
      })
      navigate('/posts', { replace: true })
    } catch (error) {
      console.error(error)
      handleLoginError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="로그인"
      description="이메일로 로그인하고 오늘의 개발 이야기를 이어가세요."
      footerText="아직 회원이 아니신가요?"
      footerLinkLabel="회원가입"
      footerTo="/signup"
      mainClassName="login-main"
    >
      <form onSubmit={handleSubmit}>
        <FormField
          id="email"
          name="email"
          type="email"
          label="이메일"
          placeholder="이메일을 입력하세요"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
        />

        <FormField
          id="password"
          name="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
        />

        <button
          type="submit"
          className={`primary-button${canSubmit ? ' active' : ''}`}
          disabled={!canSubmit}
        >
          로그인
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
