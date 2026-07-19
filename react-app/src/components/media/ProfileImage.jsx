import defaultProfileImage from '../../assets/images/basic-profile-icon.png'
import { resolveImageUrl } from '../../utils/image.js'

function ProfileImage({
  imagePath,
  alt,
  className = '',
  fallbackSrc = defaultProfileImage,
}) {
  const imageUrl = resolveImageUrl(imagePath)
  const isDefaultImage = !imageUrl
  const imageClassName = [
    className,
    isDefaultImage ? 'default-profile-image' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function handleImageError(event) {
    const image = event.currentTarget

    if (image.src === fallbackSrc) {
      return
    }

    image.src = fallbackSrc
    image.classList.add('default-profile-image')
  }

  return (
    <img
      className={imageClassName}
      src={imageUrl || fallbackSrc}
      alt={alt}
      onError={handleImageError}
    />
  )
}

export default ProfileImage
