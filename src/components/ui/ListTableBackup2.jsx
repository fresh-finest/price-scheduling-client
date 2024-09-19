import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaPlus } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { ProductDetailDrawer } from "./ProductDetailDrawer";
import { MdCheck, MdContentCopy } from "react-icons/md";

// Static column definition
const columns = [
  {
    accessorKey: "status",
    header: ({ column }) => {
      const [selectedStatus, setSelectedStatus] = React.useState(null);

      const handleCheckboxChange = (status) => {
        setSelectedStatus((prev) => (prev === status ? null : status));
      };

      React.useEffect(() => {
        if (selectedStatus) {
          column.setFilterValue(selectedStatus);
        } else {
          column.setFilterValue([]);
        }
      }, [selectedStatus, column]);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center px-1">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "active"}
              onCheckedChange={() => handleCheckboxChange("active")}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "Inactive"}
              onCheckedChange={() => handleCheckboxChange("Inactive")}
            >
              Inactive
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "Out of Stock"}
              onCheckedChange={() => handleCheckboxChange("Out of Stock")}
            >
              Out of Stock
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "Suppressed"}
              onCheckedChange={() => handleCheckboxChange("Suppressed")}
            >
              Suppressed
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatus === null}
              onCheckedChange={() => setSelectedStatus(null)} // Set default to All
            >
              All
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "productImage",
    header: "Image",
    cell: ({ row }) => (
      <div className="capitalize flex items-center">
        <img
          className="w-10 h-10"
          src={row.original.imageUrl}
          alt={row.original.itemName}
        />
      </div>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Product Details",
    cell: ({ row, index }) => {
      const itemName = row.getValue("itemName");
      const shortItemName =
        itemName.split(" ").slice(0, 15).join(" ") +
        (itemName.split(" ").length > 15 ? "..." : "");

      const asin1 = row.original.asin1;
      const sellerSku = row.original.sellerSku;

      // You might need these states at the component level
      const [copiedAsinIndex, setCopiedAsinIndex] = React.useState(null);
      const [copiedSkuIndex, setCopiedSkuIndex] = React.useState(null);

      const handleCopy = (value, type, idx) => {
        navigator.clipboard.writeText(value); // Copy value to clipboard
        if (type === "asin") {
          setCopiedAsinIndex(idx);
          setTimeout(() => setCopiedAsinIndex(null), 2000); // Reset after 2 seconds
        } else if (type === "sku") {
          setCopiedSkuIndex(idx);
          setTimeout(() => setCopiedSkuIndex(null), 2000); // Reset after 2 seconds
        }
      };

      return (
        <div className="flex flex-col">
          <h6 className="capitalize"> {shortItemName} </h6>
          <div className="flex items-center">
            <span className="text-xs text-[#7A748B] font-semibold">
              {asin1}{" "}
              {copiedAsinIndex === index ? (
                <MdCheck
                  style={{
                    marginLeft: "5px",
                    cursor: "pointer",
                    color: "green",
                  }}
                />
              ) : (
                <MdContentCopy
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(asin1, "asin", index); // Use asin1
                  }}
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                />
              )}
            </span>
            <span className="text-xs text-[#7A748B] font-semibold ml-1">
              {sellerSku}{" "}
              {copiedSkuIndex === index ? (
                <MdCheck
                  style={{
                    marginLeft: "5px",
                    cursor: "pointer",
                    color: "green",
                  }}
                />
              ) : (
                <MdContentCopy
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(sellerSku, "sku", index); // Use sellerSku
                  }}
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                />
              )}
            </span>
          </div>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "itemName",
  //   header: "Product Details",
  //   cell: ({ row }) => {
  //     const itemName = row.getValue("itemName");
  //     const shortItemName =
  //       itemName.split(" ").slice(0, 15).join(" ") +
  //       (itemName.split(" ").length > 15 ? "..." : "");

  //     const asin1 = row.original.asin1;
  //     const sellerSku = row.original.sellerSku;

  //     return (
  //       <div className="flex flex-col">
  //         <h6 className="capitalize"> {shortItemName} </h6>
  //         <div>
  //           <span className="text-xs text-[#7A748B] font-semibold">
  //             {asin1}
  //           </span>
  //           <span className="text-xs text-[#7A748B] font-semibold ml-1">
  //             {sellerSku}
  //           </span>
  //         </div>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="capitalize font-medium">${row.getValue("price")}</div>
    ),
  },
  {
    accessorKey: "fulfillmentChannel",
    header: "FBA/FBM",
    cell: ({ row }) => {
      const fulfillmentChannel = row.getValue("fulfillmentChannel");
      const displayValue = fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA";

      return <div className="capitalize">{displayValue}</div>;
    },
  },

  {
    accessorKey: "channelStock",
    header: "Channel Stock",
    cell: ({ row }) => {
      const item = row.original; // Access the entire row's data
      const channelStock =
        item.fulfillmentChannel === "DEFAULT" // Check if fulfillmentChannel is AMAZON_NA
          ? item?.quantity // Show quantity if Amazon fulfillment is default
          : item?.fulfillableQuantity + item?.pendingTransshipmentQuantity; // Otherwise, show the sum of fulfillable and pending transshipment quantities

      return <div>{channelStock || 0}</div>; // Display the calculated channel stock or 0 if it's null/undefined
    },
  },

  {
    accessorKey: "sale",
    header: "Sale",
    cell: ({ row }) => <div className="capitalize">N/A</div>,
  },
  // {
  //   accessorKey: "sale",
  //   header: "Sale",
  //   cell: ({ row }) => <div className="capitalize">{row.getValue("sale")}</div>,
  // },
  {
    accessorKey: "updatePrice",
    header: "Update Price",
    cell: ({ row }) => {
      return (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button className="bg-[#0662BB] hover:bg-blue-500 transition-all duration-300 px-[20px]">
                  <FaPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Update Price</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      );
    },
  },
];

export function ListTableBackup2({ filteredProducts }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState(""); // global filter state
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedRowId, setSelectedRowId] = React.useState(null); // to track selected row
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false); // state for drawer visible
  const [selectedRowData, setSelectedRowData] = React.useState(null); //Store selected row data

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedListing, setSelectedListing] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [columnWidths, setColumnWidths] = React.useState([
    80, 80, 350, 80, 110,
  ]);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [selectedAsin, setSelectedAsin] = React.useState("");
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);

  const [copiedAsinIndex, setCopiedAsinIndex] = React.useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = React.useState(null);
  const [scheduledData, setScheduledData] = React.useState([]);
  const [filterScheduled, setFilterScheduled] = React.useState(false);

  console.log(filteredProducts);

  const table = useReactTable({
    data: filteredProducts,
    columns, // Use static columns here
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter, // Add global filter change
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter, // Include global filter in state
      columnVisibility,
      rowSelection,
    },
    globalFilterFn: (row, columnIds, filterValue) => {
      if (!filterValue) return true;
      return columnIds.some((columnId) => {
        const cellValue = row.getValue(columnId);
        return (
          typeof cellValue === "string" &&
          cellValue.toLowerCase().includes(filterValue.toLowerCase())
        );
      });
    },
  });

  const handleRowClick = (rowId, rowData) => {
    setSelectedRowId((prevRowId) => (prevRowId === rowId ? null : rowId));
    setSelectedRowData(rowData);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false); // Close the drawer
    setSelectedRowId(null); // Reset selected row
  };

  const handleCopy = (text, type, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "asin") {
          setCopiedAsinIndex(index);
          setTimeout(() => setCopiedAsinIndex(null), 2000);
        } else if (type === "sku") {
          setCopiedSkuIndex(index);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-64 absolute top-0 mt-[-15px]"
          />
          {/* <Input
          placeholder="Search..."
          value={table.getColumn("productName")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("productName")?.setFilterValue(event.target.value)
          }
          className="max-w-64 absolute top-0 mt-[-15px]"
        /> */}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="absolute top-0 right-[220px] mt-[-20px]"
            >
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row.id, row.original)} // Handle row click
                    className={
                      selectedRowId === row.id
                        ? "bg-gray-200 hover:bg-gray-200 cursor-pointer" // Apply light gray background when selected
                        : "cursor-pointer"
                    }
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* product detail sidedrawer */}
      {isDrawerOpen && (
        <ProductDetailDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          data={selectedRowData}
        ></ProductDetailDrawer>
      )}
    </>
  );
}
