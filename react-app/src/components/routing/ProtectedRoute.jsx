import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import useAuth from '../../features/auth/useAuth.js'

function ProtectedRoute() {
  const location = useLocation()
  const { accessToken, user, initializeAuth } = useAuth()
  const [status, setStatus] = useState('initializing')

  useEffect(() => {
    if (user) {
      return undefined
    }

    let isActive = true

    initializeAuth()
      .then(() => {
        if (isActive) {
          setStatus('authenticated')
        }
      })
      .catch((error) => {
        console.error(error)

        if (isActive) {
          setStatus('failed')
        }
      })

    return () => {
      isActive = false
    }
  }, [initializeAuth, user])

  if (user) {
    return <Outlet />
  }

  if (status === 'initializing') {
    return null
  }

  if (status === 'failed' && !accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
