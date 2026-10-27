/**
 * Extracts a human-readable error message from Axios API errors.
 * Falls back to a generic Vietnamese message if none is found.
 */
export function getErrorMessage(err: unknown): string {
  const axiosErr = err as { response?: { data?: { message?: string | string[] } } }
  const msg = axiosErr?.response?.data?.message
  if (Array.isArray(msg)) return msg[0]
  if (msg) return msg
  return 'Vui long thu lai'
}
