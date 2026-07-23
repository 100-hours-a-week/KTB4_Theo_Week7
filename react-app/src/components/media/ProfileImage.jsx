import { useState } from 'react'
import defaultProfileImage from '../../assets/images/basic-profile-icon.png'
import { resolveImageUrl } from '../../utils/image.js'

function ProfileImage({
  imagePath,
  alt,
  className = '',
  fallbackSrc = defaultProfileImage,
}) {
  const imageUrl = resolveImageUrl(imagePath)
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const isDefaultImage = !imageUrl || failedImageUrl === imageUrl
  const imageClassName = [
    className,
    isDefaultImage ? 'default-profile-image' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function handleImageError() {
    if (isDefaultImage) {
      return
    }

    setFailedImageUrl(imageUrl)
  }

  return (
    <img
      className={imageClassName}
      src={isDefaultImage ? fallbackSrc : imageUrl}
      alt={alt}
      onError={handleImageError}
    />
  )
}

export default ProfileImage
