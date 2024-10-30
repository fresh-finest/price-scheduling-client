import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CiFilter } from "react-icons/ci";

export function ListSaleDropdown({ handleTimePeriodChange }) {
  const [selectedOption, setSelectedOption] = useState("7 D");

  const handleSelection = (option) => {
    setSelectedOption(option);
    handleTimePeriodChange(option);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter className="text-base" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* <DropdownMenuLabel className="text-start">
          Choose Sale
        </DropdownMenuLabel> */}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedOption === "1 D"}
          onCheckedChange={() => handleSelection("1 D")}
        >
          Yesterday
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "7 D"}
          onCheckedChange={() => handleSelection("7 D")}
        >
          Last 7 Days
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "15 D"}
          onCheckedChange={() => handleSelection("15 D")}
        >
          Last 15 Days
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "30 D"}
          onCheckedChange={() => handleSelection("30 D")}
        >
          Last 30 Days
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "60 D"}
          onCheckedChange={() => handleSelection("60 D")}
        >
          Last 60 Days
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "90 D"}
          onCheckedChange={() => handleSelection("90 D")}
        >
          Last 90 Days
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "6 M"}
          onCheckedChange={() => handleSelection("6 M")}
        >
          Last 6 Months
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedOption === "1 Y"}
          onCheckedChange={() => handleSelection("1 Y")}
        >
          Last 1 Year
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}