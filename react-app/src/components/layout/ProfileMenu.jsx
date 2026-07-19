import { useEffect } from 'react'
import { Link } from 'react-router'

function ProfileMenu({
  isOpen,
  onClose,
  onLogout,
  isLoggingOut,
  containerRef,
  triggerRef,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleDocumentClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        onClose()
      }
    }

    function handleDocumentKeydown(event) {
      if (event.key !== 'Escape') {
        return
      }

      onClose()
      triggerRef.current?.focus()
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleDocumentKeydown)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleDocumentKeydown)
    }
  }, [containerRef, isOpen, onClose, triggerRef])

  return (
    <nav
      className="profile-menu"
      id="profile-menu"
      aria-label="회원 메뉴"
      hidden={!isOpen}
    >
      <Link className="profile-menu-item" to="/profile/edit" onClick={onClose}>
        회원정보 수정
      </Link>
      <Link className="profile-menu-item" to="/password/edit" onClick={onClose}>
        비밀번호 수정
      </Link>
      <button
        type="button"
        className="profile-menu-item profile-logout-button"
        disabled={isLoggingOut}
        onClick={onLogout}
      >
        로그아웃
      </button>
    </nav>
  )
}

export default ProfileMenu
