import { useEffect, useRef, useState } from 'react'
import {
  COMMENT_MAX_LENGTH,
  validateComment,
} from '../utils/commentValidation.js'

function CommentForm({
  initialContent = '',
  isEditing = false,
  isSubmitting,
  onSubmit,
  onCancel,
}) {
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)
  const formRef = useRef(null)
  const canSubmit = content.trim().length > 0 && !isSubmitting

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus()
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isEditing])

  function handleBlur() {
    if (content.length > 0) {
      setError(validateComment(content))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const validationError = validateComment(content)

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')

    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (requestError) {
      if (
        requestError?.status === 400 &&
        requestError?.message === 'blank_comment_content'
      ) {
        setError('* 댓글 내용을 입력해주세요.')
      }
    }
  }

  return (
    <form className="comment-form" ref={formRef} onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="comment-content">
        댓글 작성
      </label>
      <textarea
        id="comment-content"
        name="content"
        ref={textareaRef}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="댓글을 남겨주세요!"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onBlur={handleBlur}
      />
      <p className="comment-helper">{error}</p>
      <div className="comment-submit-area">
        {isEditing && (
          <button
            type="button"
            className="comment-cancel-button"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          className="comment-submit-button"
          disabled={!canSubmit}
        >
          {isEditing ? '댓글 수정' : '댓글 등록'}
        </button>
      </div>
    </form>
  )
}

export default CommentForm
