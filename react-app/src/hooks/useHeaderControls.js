import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

function useHeaderControls({ logout }) {
  const navigate = useNavigate()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const closeProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(false)
  }, [])

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen((isOpen) => !isOpen)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error(error)
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }, [logout, navigate])

  return {
    isProfileMenuOpen,
    closeProfileMenu,
    toggleProfileMenu,
    handleLogout,
  }
}

export default useHeaderControls
