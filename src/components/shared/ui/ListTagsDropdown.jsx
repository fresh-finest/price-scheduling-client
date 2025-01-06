import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { CiFilter } from "react-icons/ci";
import axios from "axios";

const BASE_URL = "http://192.168.0.102:3000";

const ListTagsDropdown = () => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tag`);
      setTags(response.data.tag);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const handleTagSelection = (tagName) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tagName)
        ? prevSelected.filter((tag) => tag !== tagName)
        : [...prevSelected, tagName]
    );
    setSelectAll(false);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedTags([]);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter className="text-base" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 space-y-1">
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            className="   "
            // style={{
            //   backgroundColor: tag.colorCode,

            //   color: "white",
            // }}
            key={tag.tagName}
            checked={selectedTags.includes(tag.tagName)}
            onCheckedChange={() => handleTagSelection(tag.tagName)}
          >
            {tag.tagName}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuCheckboxItem
          checked={selectAll}
          onCheckedChange={handleSelectAll}
        >
          Show All
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ListTagsDropdown;
