import { request } from './client.js'

export async function signup(payload) {
  await request('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    includeAccessToken: false,
    retryOnUnauthorized: false,
  })
}

export async function getCurrentUser() {
  const result = await request('/users/me', {
    method: 'GET',
  })

  return result?.data
}

export async function updateCurrentUser({ nickname, profileImage }) {
  const result = await request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ nickname, profileImage }),
  })

  return result?.data
}

export async function deleteCurrentUser() {
  await request('/users/me', {
    method: 'DELETE',
  })
}

export async function updatePassword({ password, passwordConfirm }) {
  await request('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ password, passwordConfirm }),
  })
}
