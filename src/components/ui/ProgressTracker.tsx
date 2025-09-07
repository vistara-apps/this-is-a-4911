import React from 'react'

interface ProgressTrackerProps {
  current: number
  total: number
  variant?: 'simple' | 'detailed'
  showPercentage?: boolean
}

export default function ProgressTracker({ 
  current, 
  total, 
  variant = 'simple', 
  showPercentage = true 
}: ProgressTrackerProps) {
  const percentage = Math.round((current / total) * 100)
  
  if (variant === 'simple') {
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>Progress</span>
          {showPercentage && <span>{percentage}%</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-text-primary">
          {current} of {total} modules completed
        </span>
        <span className="text-sm font-bold text-primary">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-text-secondary">Started</span>
        <span className="text-xs text-text-secondary">Complete</span>
      </div>
    </div>
  )
}