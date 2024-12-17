import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiFilter } from "react-icons/ci";

export function ListFbaDropdown({ selectedFbaFbmOption, onChannelChange }) {
  // Map API values back to readable options
  const currentOption =
    selectedFbaFbmOption === "AMAZON_NA"
      ? "FBA"
      : selectedFbaFbmOption === "DEFAULT"
      ? "FBM"
      : "All";

  const handleSelection = (option) => {
    onChannelChange(option); // Pass back the selected option
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter
            className={`text-base ${
              selectedFbaFbmOption ? "text-blue-600" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={currentOption === "FBA"}
          onCheckedChange={() => handleSelection("FBA")}
        >
          FBA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={currentOption === "FBM"}
          onCheckedChange={() => handleSelection("FBM")}
        >
          FBM
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={currentOption === "All"}
          onCheckedChange={() => handleSelection("All")}
        >
          Show All
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

