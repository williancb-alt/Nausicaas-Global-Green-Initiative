import { cn } from "../../utils/constants"
import { ComponentProps } from "react"

type SlotOptions = {
  slot: string
  baseClassName: string
  as?: "div" | "h4" | "p"
}

function createSlot({
  slot,
  baseClassName,
  as: Component = "div",
}: SlotOptions) {
  return function Slot({
    className,
    ...props
  }: ComponentProps<typeof Component>) {
    return (
      <Component
        data-slot={slot}
        className={cn(baseClassName, className)}
        {...props}
      />
    )
  }
}

const Card = createSlot({
  slot: "card",
  baseClassName:
    "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
})

const CardHeader = createSlot({
  slot: "card-header",
  baseClassName:
    "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
})

const CardTitle = createSlot({
  slot: "card-title",
  baseClassName: "leading-none",
  as: "h4",
})

const CardDescription = createSlot({
  slot: "card-description",
  baseClassName: "text-muted-foreground",
  as: "p",
})

const CardAction = createSlot({
  slot: "card-action",
  baseClassName:
    "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
})

const CardContent = createSlot({
  slot: "card-content",
  baseClassName: "px-6 [&:last-child]:pb-6",
})

const CardFooter = createSlot({
  slot: "card-footer",
  baseClassName: "flex items-center px-6 pb-6 [.border-t]:pt-6",
})

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
