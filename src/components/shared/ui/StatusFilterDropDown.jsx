import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  
  import { useState } from "react";
  import { CiFilter } from "react-icons/ci";
  
  const StatusFilterDropdown = ({ handleStatusChange }) => {
    const [selectedOption, setSelectedOption] = useState("all");
  
    const handleSelection = (option) => {
      setSelectedOption(option);
      handleStatusChange(option);
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
            checked={selectedOption === "upcoming"}
            onCheckedChange={() => handleSelection("upcoming")}
          >
            Upcoming
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedOption === "success"}
            onCheckedChange={() => handleSelection("success")}
          >
            Success
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedOption === "failed"}
            onCheckedChange={() => handleSelection("failed")}
          >
            Failed
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
  
  export default StatusFilterDropdown;