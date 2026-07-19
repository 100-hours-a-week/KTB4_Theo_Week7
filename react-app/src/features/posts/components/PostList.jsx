import PostCard from './PostCard.jsx'

function PostList({ posts }) {
  const visiblePosts = Array.isArray(posts)
    ? posts.filter((post) => !post.blinded)
    : []

  return (
    <div className="post-list" aria-live="polite">
      {visiblePosts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  )
}

export default PostList
