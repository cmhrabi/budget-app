import * as React from "react"
import { cn } from "@/lib/utils"

export interface PopoverProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function Popover({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  align = "center",
  side = "bottom",
  className
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleTriggerClick = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect())
    }
    setOpen(!open)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])

  const getContentStyle = (): React.CSSProperties => {
    if (!triggerRect) return {}

    let top = triggerRect.bottom + 4
    let left = triggerRect.left

    if (side === 'top') {
      top = triggerRect.top - 4
    }

    if (align === 'end') {
      left = triggerRect.right
    } else if (align === 'center') {
      left = triggerRect.left + triggerRect.width / 2
    }

    return {
      position: 'fixed',
      top,
      left,
      zIndex: 50,
      transform: align === 'center' ? 'translateX(-50%)' : undefined,
      transformOrigin: side === 'top' ? 'bottom' : 'top'
    }
  }

  return (
    <>
      {React.cloneElement(trigger as React.ReactElement, {
        ref: triggerRef,
        onClick: handleTriggerClick,
        'aria-expanded': open,
        'aria-haspopup': true
      })}
      
      {open && (
        <div
          ref={contentRef}
          style={getContentStyle()}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            side === 'top' && "animate-in slide-in-from-bottom-2",
            side === 'bottom' && "animate-in slide-in-from-top-2",
            className
          )}
        >
          {children}
        </div>
      )}
    </>
  )
}

export function PopoverTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return React.cloneElement(children as React.ReactElement, props)
}

export function PopoverContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-2", className)} {...props}>
      {children}
    </div>
  )
}