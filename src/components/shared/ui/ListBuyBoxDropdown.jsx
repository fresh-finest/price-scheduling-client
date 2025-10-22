// ListBuyBoxDropdown.jsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiFilter } from "react-icons/ci";

const ListBuyBoxDropdown = ({ selectedBuyBoxOption, onBuyBoxChange }) => {
  // Normalize to UI label
  // selectedBuyBoxOption can be: true | false | null/undefined
  const currentOption =
    selectedBuyBoxOption === true
      ? "True"
      : selectedBuyBoxOption === false
      ? "False"
      : "All";

  const handleSelection = (opt) => {
    // Pass normalized value back up
    // "True" -> true, "False" -> false, "All" -> null
    if (opt === "True") onBuyBoxChange(true);
    else if (opt === "False") onBuyBoxChange(false);
    else onBuyBoxChange(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter
            className={`text-base ${selectedBuyBoxOption !== null && selectedBuyBoxOption !== undefined ? "text-blue-600" : ""}`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={currentOption === "True"}
          onCheckedChange={() => handleSelection("True")}
        >
          True
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={currentOption === "False"}
          onCheckedChange={() => handleSelection("False")}
        >
          False
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
};

export default ListBuyBoxDropdown;
