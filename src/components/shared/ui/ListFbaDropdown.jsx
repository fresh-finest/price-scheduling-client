import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiFilter } from "react-icons/ci";

export function ListFbaDropdown({ selectedFbaFbmOption, onChannelChange }) {
  // const [selectedFbaFbmOption, setSelectedFbaFbmOption] = React.useState("");

  console.log("selected opton", selectedFbaFbmOption);

  const handleSelection = (option) => {
    onChannelChange(option);
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
          checked={selectedFbaFbmOption === "FBA"}
          onCheckedChange={() => handleSelection("FBA")}
        >
          FBA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedFbaFbmOption === "FBM"}
          onCheckedChange={() => handleSelection("FBM")}
        >
          FBM
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedFbaFbmOption === "All"}
          onCheckedChange={() => handleSelection("All")}
        >
          Show All
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}