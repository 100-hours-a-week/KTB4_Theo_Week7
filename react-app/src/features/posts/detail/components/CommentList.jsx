import CommentCard from './CommentCard.jsx'

function CommentList({ comments, replyTarget, editingReply, isReplySubmitting, onEdit, onDelete, onReplyOpen, onReplyCancel, onReplyCreate, onReplyEdit, onReplyEditCancel, onReplyUpdate, onReplyDelete }) {
  const commentList = Array.isArray(comments) ? comments : []

  return (
    <div className="comment-list">
      {commentList.map((comment) => (
        <CommentCard
          key={comment.commentId}
          comment={comment}
          onEdit={() => onEdit?.(comment.commentId)}
          onDelete={() => onDelete?.(comment.commentId)}
          replyTarget={replyTarget?.commentId === comment.commentId}
          editingReply={editingReply?.commentId === comment.commentId ? editingReply.reply : null}
          isReplySubmitting={isReplySubmitting}
          onReplyOpen={() => onReplyOpen(comment.commentId)}
          onReplyCancel={onReplyCancel}
          onReplyCreate={(content) => onReplyCreate(comment.commentId, content)}
          onReplyEdit={(replyId) => onReplyEdit(comment.commentId, replyId)}
          onReplyEditCancel={onReplyEditCancel}
          onReplyUpdate={(replyId, content) => onReplyUpdate(comment.commentId, replyId, content)}
          onReplyDelete={(replyId) => onReplyDelete(comment.commentId, replyId)}
        />
      ))}
    </div>
  )
}

export default CommentList
