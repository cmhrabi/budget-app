import * as React from "react"
import { cn } from "@/lib/utils"

export interface DropdownMenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  className?: string
}

export function DropdownMenu({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  align = "start",
  className
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleTriggerClick = () => {
    setOpen(!open)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  return (
    <div ref={containerRef} className="relative">
      <div onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {open && (
        <div
          className={cn(
            "absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            align === "end" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownMenuContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-2", className)} {...props}>
      {children}
    </div>
  )
}