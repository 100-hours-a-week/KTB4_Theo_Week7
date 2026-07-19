import useObjectUrls from '../../../../hooks/useObjectUrls.js'

function EditPostImagePicker({ files, onChange }) {
  const { previews, replaceFiles } = useObjectUrls()
  const selectedFileNames = files.map((file) => file.name).join(', ')

  function handleChange(event) {
    const nextFiles = Array.from(event.target.files ?? [])

    replaceFiles(nextFiles)
    onChange(nextFiles)
  }

  return (
    <div className="post-image-upload-area">
      <label className="post-image-label" htmlFor="post-images">
        이미지
      </label>
      <input
        type="file"
        id="post-images"
        name="postImages"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
      <p className="selected-image-name">
        {selectedFileNames
          ? `${selectedFileNames} 선택됨 - 기존 이미지를 교체합니다.`
          : '새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다.'}
      </p>
      <div className="new-image-preview">
        {previews.map(({ file, url }) => (
          <img
            key={url}
            className="new-post-image"
            src={url}
            alt={`${file.name} 미리보기`}
          />
        ))}
      </div>
    </div>
  )
}

export default EditPostImagePicker
