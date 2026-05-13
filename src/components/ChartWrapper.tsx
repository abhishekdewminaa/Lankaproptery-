import { useRef, useState, useEffect } from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartWrapperProps {
  height?: number
  children: React.ReactElement
}

const ChartWrapper = ({ 
  height = 300, 
  children 
}: ChartWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true)
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: `${height}px`,
        minHeight: `${height}px`,
        minWidth: '0',
        overflow: 'hidden'
      }}
    >
      {ready && (
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

export default ChartWrapper
