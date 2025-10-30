"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  if (typeof window !== "undefined") {
    // Debug: vérifier rendu et état contrôlé
    // eslint-disable-next-line no-console
    console.log("[Popover Root] render", { open: (props as any).open })
  }
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  container,
  disablePortal,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { container?: HTMLElement, disablePortal?: boolean }) {
  const portalContainer = container ?? (typeof document !== "undefined" ? document.body : undefined)
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("[Popover Content] render", { hasContainer: !!portalContainer })
  }
  const content = (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      forceMount
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[100000] w-72 rounded-md border p-4 shadow-md outline-hidden pointer-events-auto",
        className
      )}
      {...props}
    />
  )
  if (disablePortal) {
    return content
  }
  return <PopoverPrimitive.Portal container={portalContainer}>{content}</PopoverPrimitive.Portal>
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
