import { useEffect, useRef, useState } from 'react'
import {
  COMMENT_MAX_LENGTH,
  validateComment,
} from '../utils/commentValidation.js'

function ReplyForm({ initialContent = '', isEditing = false, isSubmitting, onSubmit, onCancel }) {
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const validationError = validateComment(content)
    if (validationError) {
      setError(validationError.replace('댓글', '대댓글'))
      return
    }

    setError('')
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (requestError) {
      if (requestError?.status === 400) {
        setError('* 대댓글 내용을 입력해주세요.')
      }
    }
  }

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor={isEditing ? 'reply-edit-content' : 'reply-content'}>
        {isEditing ? '대댓글 수정' : '대댓글 작성'}
      </label>
      <textarea
        id={isEditing ? 'reply-edit-content' : 'reply-content'}
        ref={textareaRef}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="대댓글을 남겨주세요!"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <p className="comment-helper">{error}</p>
      <div className="comment-submit-area">
        {onCancel && (
          <button type="button" className="comment-cancel-button" disabled={isSubmitting} onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="comment-submit-button" disabled={!content.trim() || isSubmitting}>
          {isEditing ? '수정 완료' : '대댓글 등록'}
        </button>
      </div>
    </form>
  )
}

export default ReplyForm
