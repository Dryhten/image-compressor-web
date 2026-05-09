import imageCompression from 'browser-image-compression'

export interface ImageFile {
  id: string
  file: File
  name: string
  originalSize: number
  compressedBlob?: Blob
  compressedSize?: number
  previewUrl: string
  compressedPreviewUrl?: string
  status: 'pending' | 'compressing' | 'done' | 'error'
  error?: string
}

export interface CompressionOptions {
  quality: number
  maxWidth?: number
  maxHeight?: number
  format: 'image/jpeg' | 'image/png' | 'image/webp'
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<Blob> {
  const compressionOptions = {
    maxSizeMB: options.quality * 10,
    maxWidthOrHeight: options.maxWidth || 1920,
    useWebWorker: true,
    fileType: options.format,
    initialQuality: options.quality,
  }

  try {
    const compressedBlob = await imageCompression(file, compressionOptions)
    return compressedBlob
  } catch (error) {
    console.error('Compression error:', error)
    throw error
  }
}

export async function processImages(
  images: ImageFile[],
  options: CompressionOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<ImageFile[]> {
  const results: ImageFile[] = []
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    
    try {
      image.status = 'compressing'
      results.push({ ...image })
      
      const compressedBlob = await compressImage(image.file, options)
      
      const updatedImage: ImageFile = {
        ...image,
        compressedBlob,
        compressedSize: compressedBlob.size,
        compressedPreviewUrl: URL.createObjectURL(compressedBlob),
        status: 'done',
      }
      
      results[i] = updatedImage
      
      if (onProgress) {
        onProgress(i + 1, images.length)
      }
    } catch (error) {
      const errorImage: ImageFile = {
        ...image,
        status: 'error',
        error: error instanceof Error ? error.message : '压缩失败',
      }
      results[i] = errorImage
      
      if (onProgress) {
        onProgress(i + 1, images.length)
      }
    }
  }
  
  return results
}
