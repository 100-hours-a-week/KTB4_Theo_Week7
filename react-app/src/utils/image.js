import { API_BASE_URL } from '../api/client.js'

export function resolveImageUrl(imagePath) {
  if (!imagePath) {
    return ''
  }

  return `${API_BASE_URL}/images/${encodeURIComponent(imagePath)}`
}
