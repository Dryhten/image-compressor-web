import { useState } from 'react'
import { ImageFile } from '@/lib/compressor'
import { formatBytes } from '@/lib/utils'
import { X } from 'lucide-react'

interface PreviewModalProps {
  image: ImageFile
  onClose: () => void
}

export function PreviewModal({ image, onClose }: PreviewModalProps) {
  const [showOriginal, setShowOriginal] = useState(true)
  
  const compressedUrl = image.compressedPreviewUrl || image.previewUrl
  
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">图片对比</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
            <img
              src={showOriginal ? image.previewUrl : compressedUrl}
              alt={image.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-4 py-2 rounded transition-colors ${
                  showOriginal
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                原始 ({formatBytes(image.originalSize)})
              </button>
              {image.compressedSize && (
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`px-4 py-2 rounded transition-colors ${
                    !showOriginal
                      ? 'bg-success text-success-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  压缩后 ({formatBytes(image.compressedSize!)})
                </button>
              )}
            </div>
          </div>
          
          {image.compressedSize && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded bg-secondary">
                <p className="text-muted-foreground mb-1">原始大小</p>
                <p className="text-lg font-semibold">{formatBytes(image.originalSize)}</p>
              </div>
              <div className="p-4 rounded bg-secondary">
                <p className="text-muted-foreground mb-1">压缩后大小</p>
                <p className="text-lg font-semibold text-success">
                  {formatBytes(image.compressedSize)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
