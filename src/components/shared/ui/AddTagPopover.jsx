import { useState, useEffect } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { FaPlus } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

// const BASE_URL = "http://192.168.0.102:3000";
const BASE_URL = `https://api.priceobo.com`;

const AddTagPopover = ({
  sku,
  selectedProductTags,

  setTagsUpdated,
}) => {
  console.log("selected product tags", selectedProductTags);
  const [tags, setTags] = useState([]);
  const [productTags, setProductTags] = useState([]);

  console.log("tags", tags);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tag`);
      const data = await response.json();
      setTags(data.tag);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const handleTagClick = async (tag) => {
    console.log("tag", tag);

    try {
      const updatedTags = [
        ...selectedProductTags,
        { tag: tag.tagName, colorCode: tag.colorCode },
      ];

      const payload = {
        tags: updatedTags,
      };
      const encodedSku = encodeURIComponent(sku);

      await axios.put(`${BASE_URL}/api/product/tag/${encodedSku}`, payload);

      // Update local state with new tags
      setProductTags(updatedTags);

      setTagsUpdated(true);

      Swal.fire({
        title: "Added!",
        text: "Tags have been added.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Failed to update tag:", error);
      setTagsUpdated(true);
      Swal.fire({
        title: "Error!",
        text: `Failed to add tags: ${error.message}`,
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <Popover className="p-0">
      <PopoverTrigger asChild>
        <button className=" rounded-full bg-[#0662BB] text-white flex justify-center items-center ml-0.5 p-0.5">
          <FaPlus className="text-xs" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-42 p-3 space-y-3">
        {tags.map((tag, index) => (
          <div key={index}>
            <button
              onClick={() => handleTagClick(tag)}
              className="rounded-full px-2 py-1 text-xs "
              style={{
                backgroundColor: tag.colorCode,
                color: "white",
              }}
            >
              {tag.tagName}
            </button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default AddTagPopover;
