import { useEffect, useRef } from 'react'

function ConfirmModal({
  isOpen,
  title,
  description,
  isSubmitting,
  onConfirm,
  onCancel,
  initialFocus = 'confirm',
  backdropClassName = '',
  className = '',
}) {
  const cancelButtonRef = useRef(null)
  const confirmButtonRef = useRef(null)
  const previousActiveElementRef = useRef(null)
  const backdropClasses = ['modal-backdrop', backdropClassName]
    .filter(Boolean)
    .join(' ')
  const modalClasses = ['confirm-modal', className].filter(Boolean).join(' ')

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    previousActiveElementRef.current = document.activeElement
    const initialFocusRef =
      initialFocus === 'cancel' ? cancelButtonRef : confirmButtonRef
    initialFocusRef.current?.focus()

    return () => {
      previousActiveElementRef.current?.focus()
      previousActiveElementRef.current = null
    }
  }, [initialFocus, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeydown(event) {
      if (event.key === 'Escape' && !isSubmitting) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen, isSubmitting, onCancel])

  if (!isOpen) {
    return null
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isSubmitting) {
      onCancel()
    }
  }

  return (
    <div className={backdropClasses} onClick={handleBackdropClick}>
      <section
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <h2 id="confirm-modal-title">{title}</h2>
        <p id="confirm-modal-description">{description}</p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="modal-button modal-cancel-button"
            ref={cancelButtonRef}
            disabled={isSubmitting}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="modal-button modal-confirm-button"
            ref={confirmButtonRef}
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmModal
