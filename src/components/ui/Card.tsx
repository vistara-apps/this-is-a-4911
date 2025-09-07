import React from 'react'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'highlight'
  className?: string
  onClick?: () => void
}

export default function Card({ children, variant = 'default', className = '', onClick }: CardProps) {
  const baseClasses = 'bg-surface rounded-lg shadow-card transition-all duration-200'
  
  const variants = {
    default: 'hover:shadow-lg',
    highlight: 'border-2 border-accent hover:shadow-lg'
  }
  
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
  
  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}