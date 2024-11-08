import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  
  import { useState } from "react";
  import { CiFilter } from "react-icons/ci";
  
  const StatusScheduleTypedropdown = ({ handleScheduleTypeChange }) => {
    const [selectedOption, setSelectedOption] = useState("all");
  
    const handleSelection = (option) => {
      setSelectedOption(option);
      handleScheduleTypeChange(option); // Pass selected option to JobTable
    };
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <CiFilter className="text-base" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedOption === "Single"}
            onCheckedChange={() => handleSelection("Single")}
          >
            Single
          </DropdownMenuCheckboxItem>
  
          <DropdownMenuCheckboxItem
            checked={selectedOption === "Weekly"}
            onCheckedChange={() => handleSelection("Weekly")}
          >
            Weekly
          </DropdownMenuCheckboxItem>
  
          <DropdownMenuCheckboxItem
            checked={selectedOption === "Monthly"}
            onCheckedChange={() => handleSelection("Monthly")}
          >
            Monthly
          </DropdownMenuCheckboxItem>
  
          <DropdownMenuCheckboxItem
            checked={selectedOption === "all"}
            onCheckedChange={() => handleSelection("all")}
          >
            Show All
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  export default StatusScheduleTypedropdown;