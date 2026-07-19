function ProfileImageField({
  inputId,
  label,
  file,
  previewUrl,
  error = '',
  defaultImageSrc,
  onChange,
  onRemove,
  onEmptyClick,
}) {
  const helperId = `${inputId}-helper`

  function handleImageBoxClick(event) {
    if (file) {
      event.preventDefault()
      onRemove()
      return
    }

    onEmptyClick?.()
  }

  return (
    <div className="profile-upload-area">
      <label className="profile-label" htmlFor={inputId}>
        {label}
      </label>
      <p className="helper-text profile-helper" id={helperId}>
        {error}
      </p>

      <label
        className="profile-image-box"
        htmlFor={inputId}
        onClick={handleImageBoxClick}
      >
        {file && previewUrl ? (
          <img
            src={previewUrl}
            className="profile-preview"
            alt="프로필 미리보기"
            style={{ display: 'block' }}
          />
        ) : (
          <img
            src={defaultImageSrc}
            className="profile-plus"
            alt=""
            aria-hidden="true"
          />
        )}
      </label>

      <input
        type="file"
        id={inputId}
        name="profileImage"
        value=""
        accept="image/*"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? helperId : undefined}
        onChange={onChange}
        hidden
      />
    </div>
  )
}

export default ProfileImageField
