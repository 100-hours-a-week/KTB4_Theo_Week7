import ProfileImage from '../../../../components/media/ProfileImage.jsx'
import {
  formatPostDate,
  getPostNickname,
} from '../../utils/postFormatters.js'

function CommentCard({ comment, onEdit, onDelete }) {
  const canModify =
    comment.author && !comment.commentDeleted && !comment.authorDeleted

  return (
    <article className="comment-card">
      <div className="comment-card-header">
        <div className="comment-author-information">
          <div className="comment-profile">
            <ProfileImage imagePath={comment.profileImage} alt="" />
          </div>
          <strong>{getPostNickname(comment)}</strong>
          <time className="comment-date" dateTime={comment.createdAt || ''}>
            {formatPostDate(comment.createdAt)}
          </time>
        </div>

        {canModify && (
          <div className="comment-action-buttons">
            <button
              type="button"
              className="outline-action-button"
              onClick={onEdit}
            >
              수정
            </button>
            <button
              type="button"
              className="outline-action-button"
              onClick={onDelete}
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <p className="comment-content">
        {comment.commentDeleted
          ? '삭제된 댓글입니다.'
          : comment.commentContent}
      </p>
    </article>
  )
}

export default CommentCard
