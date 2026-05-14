import { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer } from 'recharts'

export const ChartContainer = ({ 
  height = 300, 
  children 
}: { 
  height?: number
  children: React.ReactElement 
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let frame: number
    const check = () => {
      if (ref.current && ref.current.clientWidth > 0) {
        setReady(true)
      } else {
        frame = requestAnimationFrame(check)
      }
    }
    frame = requestAnimationFrame(check)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: `${height}px`,
        minHeight: `${height}px`,
        minWidth: '100px'
      }}
    >
      {ready && (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  )
}
