import CommentForm from './CommentForm.jsx'
import CommentList from './CommentList.jsx'

function CommentSection({
  comments,
  editingComment,
  isSubmitting,
  onCreate,
  onUpdate,
  onEditStart,
  onEditCancel,
  onDelete,
}) {
  const isEditing = Boolean(editingComment)

  function handleSubmit(content) {
    if (editingComment) {
      return onUpdate(editingComment.commentId, content)
    }

    return onCreate(content)
  }

  return (
    <section className="comment-section">
      <CommentForm
        key={editingComment?.commentId ?? 'create'}
        initialContent={editingComment?.commentContent ?? ''}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onEditCancel}
      />
      <CommentList
        comments={comments}
        onEdit={onEditStart}
        onDelete={onDelete}
      />
    </section>
  )
}

export default CommentSection
