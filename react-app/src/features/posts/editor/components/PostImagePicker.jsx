import useObjectUrls from '../../../../hooks/useObjectUrls.js'
import ImagePreviewList from './ImagePreviewList.jsx'

function PostImagePicker({ files, onChange, disabled = false }) {
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
        disabled={disabled}
        onChange={handleChange}
      />
      <p className="selected-image-names">
        {selectedFileNames || '선택된 이미지가 없습니다.'}
      </p>
      <ImagePreviewList previews={previews} />
    </div>
  )
}

export default PostImagePicker
