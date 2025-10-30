"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-xl shadow-2xl mx-auto p-4 max-w-full w-full group/calendar border border-border",
        "[--cell-size:44px] sm:[--cell-size:52px] md:[--cell-size:56px] lg:[--cell-size:60px] ",
        "[&_table]:rounded-xl",
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full max-w-sm mx-auto", defaultClassNames.root),
        months: cn(
          "flex gap-2 sm:gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-2 px-1 md:px-2",
          "bg-background/20 rounded-xl pb-2 pt-2 shadow-sm",
          defaultClassNames.month
        ),
        nav: cn(
          "flex items-center gap-2 w-full absolute top-0 inset-x-0 justify-between z-10",          
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none rounded-full backdrop-blur-md bg-white/30 dark:bg-neutral-800/70 hover:bg-primary/10 transition border-border border",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none rounded-full backdrop-blur-md bg-white/30 dark:bg-neutral-800/70 hover:bg-primary/10 transition border-border border",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-auto w-full px-2 pb-1 gap-2",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-semibold justify-center gap-2",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-background border rounded-md shadow-lg z-20 left-0 right-0 mx-auto text-left outline-none mt-1 !opacity-100 w-full",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-bold text-[1.05rem] uppercase tracking-wide text-primary",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md px-2 py-1 flex items-center gap-1 text-base h-8 [&>svg]:text-primary [&>svg]:size-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 shadow-sm ",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-semibold text-[0.92rem] select-none uppercase px-0 py-1",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full text-center aspect-square select-none px-0 py-0 group/day font-medium shadow-none border-0 outline-none transition-colors",
          "md:text-[1.025rem] text-base",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-xl"
            : "[&:first-child[data-selected=true]_button]:rounded-l-xl",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-xl bg-gradient-to-tr from-primary to-pink-400 text-white font-extrabold shadow-xl",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-primary/10 dark:bg-primary/20 text-primary", defaultClassNames.range_middle),
        range_end: cn("rounded-r-xl bg-gradient-to-tl from-pink-500 to-indigo-600 text-white font-extrabold shadow-2xl", defaultClassNames.range_end),
        today: cn(
          "bg-gradient-to-tr from-indigo-100 via-sky-200 to-pink-100 text-blue-700 font-bold border-2 border-primary rounded-xl scale-[1.075] relative z-10 shadow-md",
          "dark:bg-gradient-to-tr dark:from-indigo-700 dark:via-pink-700 dark:to-sky-700 dark:text-white dark:border-white/20",
          "after:content-[''] after:absolute after:inset-1 after:rounded-xl after:border-2 after:border-primary/60 after:opacity-10",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/60 opacity-40 bg-gray-100 dark:bg-neutral-800 pointer-events-none",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        weekend: cn(
          "bg-rose-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-300",
          defaultClassNames.weekend
        ),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      type="button"
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
