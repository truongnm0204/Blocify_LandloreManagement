import { useState } from 'react'
import { api } from '@/lib/axios'

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useImageUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  // Upload multiple files to backend /upload endpoint, returns array of URLs
  async function uploadImages(files: File[]): Promise<string[]> {
    setState({ isUploading: true, progress: 0, error: null })

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const res = await api.post<{ urls: string[] }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setState((prev) => ({ ...prev, progress: pct }))
          }
        },
      })

      setState({ isUploading: false, progress: 100, error: null })
      return res.data.urls
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload that bai'
      setState({ isUploading: false, progress: 0, error: msg })
      throw err
    }
  }

  return { ...state, uploadImages }
}
