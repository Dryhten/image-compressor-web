import { Slider } from './ui/slider'
import { cn } from '@/lib/utils'

interface QualityControlProps {
  quality: number
  onQualityChange: (quality: number) => void
  disabled?: boolean
}

export function QualityControl({ quality, onQualityChange, disabled }: QualityControlProps) {
  const qualityPercentage = Math.round(quality * 100)
  
  const getQualityLabel = (q: number) => {
    if (q >= 0.9) return '极高'
    if (q >= 0.8) return '高'
    if (q >= 0.7) return '中'
    if (q >= 0.5) return '低'
    return '极低'
  }
  
  const getQualityColor = (q: number) => {
    if (q >= 0.8) return 'text-success'
    if (q >= 0.6) return 'text-primary'
    return 'text-destructive'
  }
  
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">压缩质量</h3>
          <p className="text-sm text-muted-foreground mt-1">
            调整图片质量,数值越小压缩率越高
          </p>
        </div>
        
        <div className="text-right">
          <div className={cn('text-3xl font-bold', getQualityColor(quality))}>
            {qualityPercentage}%
          </div>
          <div className="text-sm text-muted-foreground">
            质量: {getQualityLabel(quality)}
          </div>
        </div>
      </div>
      
      <Slider
        value={[quality]}
        onValueChange={(values) => onQualityChange(values[0])}
        min={0.1}
        max={1}
        step={0.05}
        disabled={disabled}
      />
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>最小文件</span>
        <span>最佳质量</span>
      </div>
    </div>
  )
}
