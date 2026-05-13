import React, { 
  useEffect, 
  useRef, 
  useState 
} from 'react'
import { ResponsiveContainer } from 'recharts'

export function ChartContainer({ 
  children, 
  height = 300 
}: { 
  children: React.ReactElement
  height?: number 
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let raf: number
    const check = () => {
      if (divRef.current && divRef.current.clientWidth > 0) {
        setShow(true)
      } else {
        raf = requestAnimationFrame(check)
      }
    }
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={divRef}
      style={{ 
        width: '100%', 
        height,
        minWidth: 100 
      }}
    >
      {show && (
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
