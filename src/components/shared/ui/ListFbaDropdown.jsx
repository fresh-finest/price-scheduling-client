import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiFilter } from "react-icons/ci";

export function ListFbaDropdown({ toggleFbaFbmSort }) {
  const [selectedOption, setSelectedOption] = React.useState("All");

  const handleSelection = (option) => {
    setSelectedOption(option);
    toggleFbaFbmSort(option);
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
          checked={selectedOption === "FBA"}
          onCheckedChange={() => handleSelection("FBA")}
        >
          FBA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "FBM"}
          onCheckedChange={() => handleSelection("FBM")}
        >
          FBM
        </DropdownMenuCheckboxItem>
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