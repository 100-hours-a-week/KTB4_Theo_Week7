function ImagePreviewList({ previews }) {
  if (previews.length === 0) {
    return null
  }

  return (
    <div className="post-image-preview-list">
      {previews.map(({ file, url }) => (
        <img
          key={url}
          className="post-image-preview"
          src={url}
          alt={`${file.name} 미리보기`}
        />
      ))}
    </div>
  )
}

export default ImagePreviewList
