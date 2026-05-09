import React from 'react'

interface SliderProps {
  value: [number]
  onValueChange: (values: [number]) => void
  min: number
  max: number
  step: number
  disabled?: boolean
}

export function Slider({ value, onValueChange, min, max, step, disabled }: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) as any
    onValueChange([newValue])
  }
  
  const percentage = ((value[0] - min) / (max - min)) * 100
  
  return (
    <div className="relative w-full h-8 flex items-center">
      <div className="absolute w-full h-2 bg-secondary rounded-full">
        <div
          className="h-full bg-primary rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute w-5 h-5 bg-primary rounded-full border-2 border-background shadow-lg pointer-events-none transition-all duration-150"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
}
