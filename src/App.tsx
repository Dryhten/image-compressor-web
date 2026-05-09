import React, { useState, useCallback } from 'react'
import { DropZone } from '@/components/DropZone'
import { QualityControl } from '@/components/QualityControl'
import { ImageList } from '@/components/ImageList'
import { PreviewModal } from '@/components/PreviewModal'
import { ImageFile, CompressionOptions, processImages } from '@/lib/compressor'
import { formatBytes, getCompressionRatio } from '@/lib/utils'
import { Download, Zap, Trash2 } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

function App() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [quality, setQuality] = useState(0.8)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null)
  
  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      originalSize: file.size,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }))
    
    setImages(prev => [...prev, ...newImages])
  }, [])
  
  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.previewUrl)
        if (image.compressedPreviewUrl) {
          URL.revokeObjectURL(image.compressedPreviewUrl)
        }
      }
      return prev.filter(img => img.id !== id)
    })
  }, [])
  
  const handleCompressAll = useCallback(async () => {
    if (images.length === 0) return
    
    setIsProcessing(true)
    setProgress({ completed: 0, total: images.length })
    
    const options: CompressionOptions = {
      quality,
      format: 'image/jpeg',
    }
    
    try {
      const results = await processImages(images, options, (completed, total) => {
        setProgress({ completed, total })
      })
      
      setImages(results)
    } catch (error) {
      console.error('Compression failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [images, quality])
  
  const handleDownloadZip = useCallback(async () => {
    const compressedImages = images.filter(img => img.status === 'done' && img.compressedBlob)
    
    if (compressedImages.length === 0) return
    
    const zip = new JSZip()
    
    compressedImages.forEach(image => {
      if (image.compressedBlob) {
        const extension = image.name.split('.').pop() || 'jpg'
        const newName = image.name.replace(/\.[^/.]+$/, '') + '_compressed.' + extension
        zip.file(newName, image.compressedBlob)
      }
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'compressed_images.zip')
  }, [images])
  
  const handleClearAll = useCallback(() => {
    images.forEach(image => {
      URL.revokeObjectURL(image.previewUrl)
      if (image.compressedPreviewUrl) {
        URL.revokeObjectURL(image.compressedPreviewUrl)
      }
    })
    setImages([])
    setProgress({ completed: 0, total: 0 })
  }, [images])
  
  const completedCount = images.filter(img => img.status === 'done').length
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressedSize || 0), completedCount)
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">图片压缩工具</h1>
                <p className="text-sm text-muted-foreground">
                  快速批量压缩图片,不损失质量
                </p>
              </div>
            </div>
            
            {images.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空全部
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <DropZone onFilesAdded={handleFilesAdded} disabled={isProcessing} />
        
        {images.length > 0 && (
          <>
            <QualityControl
              quality={quality}
              onQualityChange={setQuality}
              disabled={isProcessing}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-6">
                <div className="text-sm text-muted-foreground mb-2">图片总数</div>
                <div className="text-3xl font-bold">{images.length}</div>
              </div>
              
              <div className="card p-6">
                <div className="text-sm text-muted-foreground mb-2">原始总大小</div>
                <div className="text-3xl font-bold">{formatBytes(totalOriginalSize)}</div>
              </div>
              
              {completedCount > 0 && (
                <>
                  <div className="card p-6">
                    <div className="text-sm text-muted-foreground mb-2">压缩后总大小</div>
                    <div className="text-3xl font-bold text-success">
                      {formatBytes(totalCompressedSize)}
                    </div>
                  </div>
                  
                  <div className="card p-6">
                    <div className="text-sm text-muted-foreground mb-2">总压缩率</div>
                    <div className="text-3xl font-bold text-success">
                      {getCompressionRatio(totalOriginalSize, totalCompressedSize)}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {isProcessing && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">处理进度</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.completed} / {progress.total}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${(progress.completed / progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={handleCompressAll}
                disabled={isProcessing || images.length === 0}
                className="btn-primary flex-1"
              >
                {isProcessing ? '处理中...' : `压缩全部 (${images.length} 张)`}
              </button>
              
              <button
                onClick={handleDownloadZip}
                disabled={completedCount === 0}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载 ZIP ({completedCount} 张)
              </button>
            </div>
            
            <ImageList
              images={images}
              onRemove={handleRemoveImage}
              onPreview={setPreviewImage}
            />
          </>
        )}
      </main>
      
      {previewImage && (
        <PreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  )
}

export default App
