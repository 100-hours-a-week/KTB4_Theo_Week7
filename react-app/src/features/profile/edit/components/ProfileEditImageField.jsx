import useObjectUrls from '../../../../hooks/useObjectUrls.js'
import { resolveImageUrl } from '../../../../utils/image.js'

function ProfileEditImageField({
  originalImagePath,
  selectedFile,
  onChange,
}) {
  const { previews, replaceFiles } = useObjectUrls()
  const selectedPreview = selectedFile ? previews[0] : null
  const imageUrl = selectedPreview?.url || resolveImageUrl(originalImagePath)

  function handleChange(event) {
    const nextFile = event.target.files?.[0] ?? null

    replaceFiles(nextFile ? [nextFile] : [])
    onChange(nextFile)
  }

  return (
    <div className="profile-edit-area">
      <span className="profile-edit-label">프로필 사진</span>
      <label className="profile-edit-image-box" htmlFor="new-profile-image">
        <img src={imageUrl || undefined} alt="프로필 사진 미리보기" />
        <span className="profile-edit-overlay">이미지 변경</span>
      </label>
      <input
        type="file"
        id="new-profile-image"
        name="profileImage"
        value=""
        accept="image/*"
        onChange={handleChange}
        hidden
      />
    </div>
  )
}

export default ProfileEditImageField
