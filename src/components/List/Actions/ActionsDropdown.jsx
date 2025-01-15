import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, Spinner } from "react-bootstrap";
import { Button as ShadCdnButton } from "@/components/ui/button";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { IoIosArrowDown } from "react-icons/io";
import AssginTagsModal from "./AssginTagsModal";

// const BASE_URL = "http://192.168.0.102:3000";
const BASE_URL = `https://api.priceobo.com`;

const ActionsDropdown = ({ filteredProducts }) => {
  console.log("filteredProducts", filteredProducts);
  const [loading, setLoading] = useState(false);
  const [exportThisPageLoading, setExportThisPageLoading] = useState(false);
  const [assignTagsModalOpen, setAssignTagsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const checkboxItems = [
    "Image URL",
    "Title",
    "SKU",
    "ASIN",
    "Price",
    "FBA/FBM",
    "Tags",
    "FNSKU",
    "Channel Stock",
  ];

  const defaultCheckedItems = ["Title", "ASIN", "SKU"];
  const [selectedItems, setSelectedItems] = useState([...defaultCheckedItems]);

  const allSelected =
    checkboxItems.filter((item) => !defaultCheckedItems.includes(item))
      .length ===
    selectedItems.filter((item) => !defaultCheckedItems.includes(item)).length;

  const handleCheckboxChange = (item) => {
    if (defaultCheckedItems.includes(item)) return;
    setSelectedItems((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  const handleAssignTagsModalOpen = () => {
    setAssignTagsModalOpen(true);
    setDropdownOpen(false);
  };

  const handleAssignTagsModalClose = () => {
    setAssignTagsModalOpen(false);
  };

  const handleSelectAllChange = () => {
    if (allSelected) {
      setSelectedItems([...defaultCheckedItems]);
    } else {
      setSelectedItems([...checkboxItems]);
    }
  };

  const handleDropdownOpenChange = (isOpen) => {
    setDropdownOpen(isOpen);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/product/limit?page=1&limit=5000`
      );
      const data = await response.json();

      const { listings } = data.data;

      // Extract selected fields
      const excelData = listings.map((item) => {
        const extractedItem = {};
        if (selectedItems.includes("Image URL"))
          extractedItem["Image URL"] = item.imageUrl;
        if (selectedItems.includes("Title"))
          extractedItem["Title"] = item.itemName;
        if (selectedItems.includes("SKU"))
          extractedItem["SKU"] = item.sellerSku;
        if (selectedItems.includes("ASIN")) extractedItem["ASIN"] = item.asin1;
        if (selectedItems.includes("FNSKU"))
          extractedItem["FNSKU"] = item.fnSku;
        if (selectedItems.includes("FBA/FBM"))
          extractedItem["FBA/FBM"] =
            item.fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA";
        if (selectedItems.includes("Price"))
          extractedItem["Price"] = item.price;
        if (selectedItems.includes("Channel Stock"))
          extractedItem["Channel Stock"] =
            item.fulfillmentChannel === "DEFAULT"
              ? item.quantity != null
                ? item.quantity
                : "N/A"
              : item.fulfillableQuantity != null &&
                item.pendingTransshipmentQuantity != null
              ? item.fulfillableQuantity + item.pendingTransshipmentQuantity
              : "N/A";
        if (selectedItems.includes("Tags"))
          extractedItem["Tags"] = item.tags.map((tag) => tag.tag).join(", ");

        return extractedItem;
      });

      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // Create download link
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Products.xlsx";
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);

      setLoading(false);
    } catch (error) {
      console.error("Error generating Excel:", error);
      setLoading(false);

      Swal.fire({
        title: "Error!",
        text: "Something went wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportThisPage = () => {
    try {
      setExportThisPageLoading(true);

      // Extract selected fields from filteredProducts
      const excelData = filteredProducts.listings.map((item) => {
        const extractedItem = {};
        if (selectedItems.includes("Image URL"))
          extractedItem["Image URL"] = item.imageUrl;
        if (selectedItems.includes("Title"))
          extractedItem["Title"] = item.itemName;
        if (selectedItems.includes("SKU"))
          extractedItem["SKU"] = item.sellerSku;
        if (selectedItems.includes("ASIN")) extractedItem["ASIN"] = item.asin1;
        if (selectedItems.includes("FNSKU"))
          extractedItem["FNSKU"] = item.fnSku;
        if (selectedItems.includes("FBA/FBM"))
          extractedItem["FBA/FBM"] =
            item.fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA";
        if (selectedItems.includes("Price"))
          extractedItem["Price"] = item.price;
        if (selectedItems.includes("Channel Stock"))
          extractedItem["Channel Stock"] =
            item.fulfillmentChannel === "DEFAULT"
              ? item.quantity != null
                ? item.quantity
                : "N/A"
              : item.fulfillableQuantity != null &&
                item.pendingTransshipmentQuantity != null
              ? item.fulfillableQuantity + item.pendingTransshipmentQuantity
              : "N/A";
        if (selectedItems.includes("Tags"))
          extractedItem["Tags"] = item.tags.map((tag) => tag.tag).join(", ");

        return extractedItem;
      });

      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Products");

      // Create download link
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Products.xlsx";
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);

      setExportThisPageLoading(false);
    } catch (error) {
      console.error("Error exporting filtered products:", error);
      setExportThisPageLoading(false);

      Swal.fire({
        title: "Error!",
        text: "Something went wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setExportThisPageLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            style={{
              borderRadius: "2px",
              backgroundColor: "#0D6EFD",
              border: "none",
            }}
          >
            <span className="text-[14px] flex justify-center gap-1 items-center cursor-pointer">
              Select Action{" "}
              <IoIosArrowDown
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup></DropdownMenuGroup>

          <DropdownMenuGroup>
            {/* <DropdownMenuItem>Tags</DropdownMenuItem> */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Tags</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={handleAssignTagsModalOpen}
                    onSelect={(e) => e.preventDefault()}
                  >
                    Assign Tags
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>Product Sync</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {checkboxItems.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item)}
                          onChange={() => handleCheckboxChange(item)}
                          disabled={defaultCheckedItems.includes(item)}
                          style={{
                            marginRight: "10px",
                          }}
                        />
                        {item}
                      </label>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAllChange}
                        style={{
                          marginRight: "10px",
                        }}
                      />
                      Select All
                    </label>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "5px",
                      padding: "10px",
                    }}
                  >
                    <ShadCdnButton
                      disabled={loading}
                      variant="outline"
                      onClick={handleSubmit}
                    >
                      {loading ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          variant="secondary"
                        />
                      ) : (
                        "Export All"
                      )}
                    </ShadCdnButton>
                    <ShadCdnButton
                      onClick={handleExportThisPage}
                      disabled={exportThisPageLoading}
                      variant="outline"
                    >
                      {exportThisPageLoading ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          variant="secondary"
                        />
                      ) : (
                        "Export This Page"
                      )}
                    </ShadCdnButton>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AssginTagsModal
        assignTagsModalOpen={assignTagsModalOpen}
        handleAssignTagsModalClose={handleAssignTagsModalClose}
      ></AssginTagsModal>
    </>
  );
};

export default ActionsDropdown;
