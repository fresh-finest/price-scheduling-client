import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selectedDays = [],
  onDateSelect, // Add this prop to handle date selection
  ...props
}) {
  // Handle the date selection and call the onDateSelect handler
  const handleSelect = (selected) => {
    if (selected) {
      onDateSelect(selected); // Pass selected date(s) back to the parent component
    }
  };

  return (
    <DayPicker
      mode="multiple" // Enable multiple day selection
      selected={selectedDays} // Pass the array of selected dates
      onSelect={handleSelect} // Handle date selection
      showOutsideDays={showOutsideDays} // Hide outside days
      numberOfMonths={1} // Display only one month
      className={cn("p-2 h-[220px] w-full flex flex-col", className)}
      classNames={{
        months: "flex-1 flex flex-col w-full",
        month: "flex-1 space-y-2 w-full",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-base font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex items-center justify-center w-full",
        head_cell:
          "text-muted-foreground rounded-md w-full text-center font-normal text-sm ",
        row: "flex w-full mt-1",
        cell: "flex-1 h-5 w-6 text-center text-[0.6rem] p-0 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-6 w-6 p-0 font-normal aria-selected:opacity-100 rounded-full p-1"
        ),
        day_selected:
          "bg-[#0662BB] text-white hover:bg-blue-500 hover:text-primary-foreground focus:bg-[#3B82F6] focus:text-white ",
        day_today: "bg-accent text-accent-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_outside: "text-gray-400",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
