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
  replyTarget,
  editingReply,
  isReplySubmitting,
  onReplyOpen,
  onReplyCancel,
  onReplyCreate,
  onReplyEdit,
  onReplyEditCancel,
  onReplyUpdate,
  onReplyDelete,
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
        replyTarget={replyTarget}
        editingReply={editingReply}
        isReplySubmitting={isReplySubmitting}
        onReplyOpen={onReplyOpen}
        onReplyCancel={onReplyCancel}
        onReplyCreate={onReplyCreate}
        onReplyEdit={onReplyEdit}
        onReplyEditCancel={onReplyEditCancel}
        onReplyUpdate={onReplyUpdate}
        onReplyDelete={onReplyDelete}
      />
    </section>
  )
}

export default CommentSection
