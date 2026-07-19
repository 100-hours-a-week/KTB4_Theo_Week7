import { request } from './client.js'

export async function login(credentials) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    includeAccessToken: false,
    retryOnUnauthorized: false,
  })

  const accessToken = result?.data?.accessToken

  if (!accessToken) {
    throw new Error('로그인 응답에 액세스 토큰이 없습니다.')
  }

  return { accessToken }
}

export async function logout() {
  await request('/auth/logout', {
    method: 'POST',
    includeAccessToken: false,
    retryOnUnauthorized: false,
  })
}
