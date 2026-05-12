import React, { useState, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartContainerProps {
  height?: number
  children: React.ReactElement
}

export const ChartContainer = ({ 
  height = 300, 
  children 
}: ChartContainerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for DOM to have real dimensions
    const timer = setTimeout(() => {
      if (ref.current && 
          ref.current.offsetWidth > 0) {
        setReady(true)
      }
    }, 50)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: `${height}px`,
        minHeight: `${height}px`,
        minWidth: '200px',
        position: 'relative'
      }}
    >
      {ready ? (
        <ResponsiveContainer 
          width="100%" 
          height="100%"
        >
          {children}
        </ResponsiveContainer>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 
            'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '8px'
        }} />
      )}
    </div>
  )
}
