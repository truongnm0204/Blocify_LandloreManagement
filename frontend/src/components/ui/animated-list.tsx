import React, { useEffect, useRef, useState } from 'react'

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
}

interface AnimatedItemProps {
  children: React.ReactNode
  itemKey: string
}

/**
 * AnimatedList - renders children with slide-in animation on mount.
 * Tracks keys to only animate newly added items.
 */
function AnimatedItem({ children, itemKey }: AnimatedItemProps) {
  const [visible, setVisible] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      // Trigger animation on next frame
      requestAnimationFrame(() => setVisible(true))
    }
  }, [])

  return (
    <div
      data-key={itemKey}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  )
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  // Track each child's key so we can animate new items
  const childArray = React.Children.toArray(children) as React.ReactElement[]

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {childArray.map((child) => {
        const key = child.key ?? String(Math.random())
        return (
          <AnimatedItem key={key} itemKey={String(key)}>
            {child}
          </AnimatedItem>
        )
      })}
    </div>
  )
}
