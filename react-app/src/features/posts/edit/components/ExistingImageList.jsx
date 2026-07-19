import { useState } from 'react'
import { resolveImageUrl } from '../../../../utils/image.js'

function ExistingImageList({ imagePaths }) {
  const [failedImageIndexes, setFailedImageIndexes] = useState(() => new Set())
  const validImagePaths = Array.isArray(imagePaths)
    ? imagePaths.filter(Boolean)
    : []

  if (validImagePaths.length === 0) {
    return null
  }

  function handleImageError(index) {
    setFailedImageIndexes((currentIndexes) => {
      if (currentIndexes.has(index)) {
        return currentIndexes
      }

      const nextIndexes = new Set(currentIndexes)
      nextIndexes.add(index)
      return nextIndexes
    })
  }

  return (
    <section className="existing-image-area">
      <h3>기존 이미지</h3>
      <div className="existing-image-list">
        {validImagePaths.map((imagePath, index) =>
          failedImageIndexes.has(index) ? null : (
            <img
              key={`${imagePath}-${index}`}
              className="existing-post-image"
              src={resolveImageUrl(imagePath)}
              alt={`기존 게시글 이미지 ${index + 1}`}
              onError={() => handleImageError(index)}
            />
          ),
        )}
      </div>
    </section>
  )
}

export default ExistingImageList
