import { ImageFile } from '@/lib/compressor'
import { formatBytes, getCompressionRatio, cn } from '@/lib/utils'
import { CheckCircle, XCircle, Loader2, Eye, Trash2 } from 'lucide-react'

interface ImageListProps {
  images: ImageFile[]
  onRemove: (id: string) => void
  onPreview: (image: ImageFile) => void
}

export function ImageList({ images, onRemove, onPreview }: ImageListProps) {
  if (images.length === 0) {
    return null
  }
  
  const completedCount = images.filter(img => img.status === 'done').length
  const errorCount = images.filter(img => img.status === 'error').length
  
  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            图片列表 ({completedCount}/{images.length} 已完成)
          </h3>
          
          {errorCount > 0 && (
            <span className="text-sm text-destructive">
              {errorCount} 张失败
            </span>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {images.map((image) => (
          <ImageListItem
            key={image.id}
            image={image}
            onRemove={() => onRemove(image.id)}
            onPreview={() => onPreview(image)}
          />
        ))}
      </div>
    </div>
  )
}

interface ImageListItemProps {
  image: ImageFile
  onRemove: () => void
  onPreview: () => void
}

function ImageListItem({ image, onRemove, onPreview }: ImageListItemProps) {
  const isCompressed = image.status === 'done'
  const isCompressing = image.status === 'compressing'
  const isError = image.status === 'error'
  
  return (
    <div className={cn(
      'p-4 flex items-center gap-4 transition-all duration-200',
      isCompressing && 'bg-primary/5',
      isError && 'bg-destructive/5'
    )}>
      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-secondary">
        <img
          src={image.previewUrl}
          alt={image.name}
          className="w-full h-full object-cover"
        />
        
        {isCompressing && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        
        {isCompressed && (
          <div className="absolute top-1 right-1">
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
        )}
        
        {isError && (
          <div className="absolute top-1 right-1">
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{image.name}</p>
        
        <div className="flex items-center gap-4 mt-1 text-sm">
          <span className="text-muted-foreground">
            原始: {formatBytes(image.originalSize)}
          </span>
          
          {isCompressed && image.compressedSize && (
            <>
              <span className="text-success font-medium">
                压缩后: {formatBytes(image.compressedSize)}
              </span>
              <span className="text-success">
                减少 {getCompressionRatio(image.originalSize, image.compressedSize)}
              </span>
            </>
          )}
          
          {isCompressing && (
            <span className="text-primary">压缩中...</span>
          )}
          
          {isError && (
            <span className="text-destructive">{image.error || '失败'}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isCompressed && (
          <button
            onClick={onPreview}
            className="p-2 rounded hover:bg-secondary transition-colors"
            title="预览对比"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={onRemove}
          className="p-2 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="移除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
