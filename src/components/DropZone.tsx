import React, { useCallback, useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
  disabled?: boolean
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      onFilesAdded(files)
    }
  }, [onFilesAdded, disabled])
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      onFilesAdded(files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFilesAdded])
  
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])
  
  return (
    <div
      className={cn(
        'drop-zone',
        isDragging && 'active',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-secondary">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium">
            拖放图片到这里,或点击选择文件
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            支持 JPG、PNG、WebP 格式,可批量选择多张图片
          </p>
        </div>
      </div>
    </div>
  )
}
