import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiFilter } from "react-icons/ci";

export function ListStatusDropdown() {
  const [selectedOption, setSelectedOption] = React.useState("All");

  const handleSelection = (option) => {
    setSelectedOption(option);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter className="text-base" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={selectedOption === "Active"}
          onCheckedChange={() => handleSelection("Active")}
        >
          Active
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "Inactive"}
          onCheckedChange={() => handleSelection("Inactive")}
        >
          Inactive
        </DropdownMenuCheckboxItem>
        {/* <DropdownMenuCheckboxItem
          checked={selectedOption === "Incomplete"}
          onCheckedChange={() => handleSelection("Incomplete")}
        >
          Incomplete
        </DropdownMenuCheckboxItem> */}
        <DropdownMenuCheckboxItem
          checked={selectedOption === "All"}
          onCheckedChange={() => handleSelection("All")}
        >
          Show All
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}