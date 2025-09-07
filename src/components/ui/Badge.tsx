import React from 'react'
import { Trophy } from 'lucide-react'

interface BadgeProps {
  variant: 'bronze' | 'silver' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function Badge({ variant, size = 'md', showIcon = true }: BadgeProps) {
  const variants = {
    bronze: 'bg-orange-100 text-orange-800 border-orange-200',
    silver: 'bg-gray-100 text-gray-800 border-gray-200',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}>
      {showIcon && <Trophy className={`mr-1 ${iconSizes[size]}`} />}
      {variant.charAt(0).toUpperCase() + variant.slice(1)}
    </span>
  )
}