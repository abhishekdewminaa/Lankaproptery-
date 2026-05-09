import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartWrapperProps {
  height?: number | string;
  chart: React.ReactElement;
  children?: React.ReactNode;
  className?: string;
}

export const ChartWrapper = ({ height = 300, chart, children, className = "" }: ChartWrapperProps) => {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 150); // Slightly longer delay to be safe
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: typeof height === 'number' ? `${height}px` : height,
        minWidth: '200px',
        position: 'relative',
        display: ready ? 'block' : 'block' // Keep block but hide content if needed
      }}
    >
      {ready && (
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      )}
      {children}
    </div>
  );
};
