import likeButtonImage from '../../../../assets/images/like-button.png'
import { formatPostCount } from '../../utils/postFormatters.js'

function LikeButton({ liked, likeCount, disabled = false, onClick }) {
  const className = `statistic-box like-statistic${liked ? ' liked' : ''}`

  return (
    <button
      type="button"
      className={className}
      aria-pressed={Boolean(liked)}
      disabled={disabled}
      onClick={onClick}
    >
      <img src={likeButtonImage} alt="" aria-hidden="true" />
      <strong>{formatPostCount(likeCount)}</strong>
      <span>좋아요</span>
    </button>
  )
}

export default LikeButton
