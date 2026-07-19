import { useCallback, useEffect, useRef, useState } from 'react'

function createImagePreviews(files) {
  return files.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }))
}

function revokeImagePreviews(previews) {
  previews.forEach(({ url }) => {
    URL.revokeObjectURL(url)
  })
}

function useObjectUrls() {
  const [previews, setPreviews] = useState([])
  const previewsRef = useRef([])

  const replaceFiles = useCallback((files) => {
    const nextPreviews = createImagePreviews(files)

    revokeImagePreviews(previewsRef.current)
    previewsRef.current = nextPreviews
    setPreviews(nextPreviews)
  }, [])

  useEffect(() => {
    return () => {
      revokeImagePreviews(previewsRef.current)
      previewsRef.current = []
    }
  }, [])

  return { previews, replaceFiles }
}

export default useObjectUrls
