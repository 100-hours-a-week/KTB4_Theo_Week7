import { useState } from 'react'
import { isValidNickname, NICKNAME_MAX_LENGTH } from '../../../auth/authValidation.js'
import { validateNickname } from '../utils/profileValidation.js'
import ProfileEditImageField from './ProfileEditImageField.jsx'
import WithdrawalPanel from './WithdrawalPanel.jsx'

function ProfileEditForm({
  user,
  isSubmitting,
  serverNicknameError = '',
  onClearServerError,
  onSubmit,
  onWithdrawalRequest,
}) {
  const originalNickname = user.nickname || ''
  const originalProfileImage = user.profileImage || ''
  const [nickname, setNickname] = useState(originalNickname)
  const [profileFile, setProfileFile] = useState(null)
  const [nicknameError, setNicknameError] = useState('')
  const trimmedNickname = nickname.trim()
  const hasChanged =
    trimmedNickname !== originalNickname || profileFile !== null
  const canSubmit =
    isValidNickname(trimmedNickname) && hasChanged && !isSubmitting
  const displayedNicknameError =
    nicknameError || serverNicknameError || ''

  function handleNicknameBlur() {
    setNicknameError(validateNickname(nickname))
    onClearServerError()
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextNicknameError = validateNickname(nickname)
    setNicknameError(nextNicknameError)

    if (nextNicknameError || !hasChanged) {
      return
    }

    onSubmit({ nickname, profileFile })
  }

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit} noValidate>
      <div className="edit-profile-card">
        <ProfileEditImageField
          originalImagePath={originalProfileImage}
          selectedFile={profileFile}
          onChange={setProfileFile}
        />

        <div className="edit-profile-field">
          <span className="edit-profile-field-label">이메일</span>
          <p className="edit-profile-email">{user.email || ''}</p>
          <p className="edit-profile-note">이메일은 변경할 수 없습니다.</p>
        </div>

        <div className="edit-profile-field">
          <label className="edit-profile-field-label" htmlFor="nickname">
            닉네임
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            maxLength={NICKNAME_MAX_LENGTH}
            value={nickname}
            aria-describedby="edit-profile-nickname-helper edit-profile-nickname-note"
            aria-invalid={Boolean(displayedNicknameError)}
            onChange={(event) => setNickname(event.target.value)}
            onBlur={handleNicknameBlur}
          />
          <p
            className="edit-profile-helper"
            id="edit-profile-nickname-helper"
          >
            {displayedNicknameError}
          </p>
          <p className="edit-profile-note" id="edit-profile-nickname-note">
            닉네임은 띄어쓰기 없이 10자 이내로 설정해주세요.
          </p>
        </div>

        <button
          type="submit"
          className="edit-profile-submit-button"
          disabled={!canSubmit}
        >
          변경사항 저장
        </button>
      </div>

      <WithdrawalPanel onRequest={onWithdrawalRequest} />
    </form>
  )
}

export default ProfileEditForm
