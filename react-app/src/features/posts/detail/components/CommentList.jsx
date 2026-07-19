import CommentCard from './CommentCard.jsx'

function CommentList({ comments, onEdit, onDelete }) {
  const commentList = Array.isArray(comments) ? comments : []

  return (
    <div className="comment-list">
      {commentList.map((comment) => (
        <CommentCard
          key={comment.commentId}
          comment={comment}
          onEdit={() => onEdit?.(comment.commentId)}
          onDelete={() => onDelete?.(comment.commentId)}
        />
      ))}
    </div>
  )
}

export default CommentList
