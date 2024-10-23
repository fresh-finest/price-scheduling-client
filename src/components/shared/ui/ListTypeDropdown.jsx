import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { CiFilter } from "react-icons/ci";
  
  export function ListTypeDropdown({
    showSingleType,
    setShowSingleType,
    showWeeklyType,
    setShowWeeklyType,
    showMonthlyType,
    setShowMonthlyType,
  }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <CiFilter className="text-base" />
          </button>
          {/* <Button variant="ghost" size="icon">
            <CiFilter />
          </Button> */}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 ">
          <DropdownMenuLabel className="text-start">
            Choose Types
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showSingleType}
            onCheckedChange={setShowSingleType}
          >
            Single
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showWeeklyType}
            onCheckedChange={setShowWeeklyType}
          >
            Weekly
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showMonthlyType}
            onCheckedChange={setShowMonthlyType}
          >
            Monthly
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }