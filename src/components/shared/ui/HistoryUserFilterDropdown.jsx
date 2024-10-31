import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function HistoryUserFilterDropdown({ users, value, onSelect }) {
  const [open, setOpen] = React.useState(false);

  const usersData = [
    { value: "", label: "All Users" },
    ...users.map((user) => ({
      value: user.userName,
      label: user.userName,
    })),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-[25px] justify-between items-center"
        >
          {/* {value
            ? usersData.find((user) => user.value === value)?.label
            : "Select User"} */}

          {/* Show "All Users" if value is empty, otherwise show selected user */}
          {value === ""
            ? "All Users"
            : usersData.find((user) => user.value === value)?.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Users..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {usersData.map((user) => (
                <CommandItem
                  key={user.value}
                  value={user.value}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === value ? "all" : currentValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center px-2 py-1.5 rounded cursor-pointer",
                    value === user.value ? "bg-gray-100" : ""
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}