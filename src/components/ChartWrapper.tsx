import React, { useState, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'

export const ChartWrapper = ({ 
  children, 
  height = 300,
  className = ""
}: { 
  children: React.ReactElement
  height?: number
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ 
    width: 0, 
    height: 0 
  })

  useEffect(() => {
    if (!containerRef.current) return
    
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        width: '100%', 
        height: `${height}px`,
        minHeight: `${height}px`
      }}
    >
      {dimensions.width > 0 && (
        <ResponsiveContainer 
          width="100%" 
          height="100%"
        >
          {children}
        </ResponsiveContainer>
      )}
    </div>
  )
}

