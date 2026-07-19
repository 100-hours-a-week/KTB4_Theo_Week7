import { useEffect, useRef } from 'react'

const DEFAULT_ROOT_MARGIN = '0px 0px 200px 0px'

export default function useInfiniteScroll({
  hasNext,
  isLoading,
  onLoadMore,
  refreshKey,
  rootMargin = DEFAULT_ROOT_MARGIN,
}) {
  const sentinelRef = useRef(null)
  const isLoadingRef = useRef(isLoading)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    isLoadingRef.current = isLoading
    onLoadMoreRef.current = onLoadMore
  }, [isLoading, onLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel || !hasNext) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isSentinelVisible = entries.some((entry) => entry.isIntersecting)

        if (isSentinelVisible && !isLoadingRef.current) {
          onLoadMoreRef.current()
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasNext, refreshKey, rootMargin])

  return sentinelRef
}
