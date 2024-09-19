import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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

// Fake data
const data = [
  {
    status: "Active",
    productImage: "https://via.placeholder.com/150",
    productName: "Product 1",
    price: "29.99",
    fba: "FBA",
    channelStock: "100",
    sale: "15%",
  },
  {
    status: "Inactive",
    productImage: "https://via.placeholder.com/150",
    productName: "Product 2",
    price: "49.99",
    fba: "FBM",
    channelStock: "0",
    sale: "5%",
  },
  {
    status: "Out of Stock",
    productImage: "https://via.placeholder.com/150",
    productName: "Product 3",
    price: "19.99",
    fba: "FBA",
    channelStock: "200",
    sale: "10%",
  },
  {
    status: "Suppressed",
    productImage: "https://via.placeholder.com/150",
    productName: "Product 3",
    price: "19.99",
    fba: "FBA",
    channelStock: "200",
    sale: "10%",
  },
];

const columns = [
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <div className="capitalize">{row.getValue("status")}</div>
  //   ),
  // },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const [selectedStatus, setSelectedStatus] = React.useState("All");

      const handleCheckboxChange = (status) => {
        setSelectedStatus((prev) =>
          prev === status || prev === "All" ? status : "All"
        );
      };

      React.useEffect(() => {
        if (selectedStatus === "All") {
          column.setFilterValue([]);
        } else {
          column.setFilterValue([selectedStatus]);
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
              checked={selectedStatus === "All"}
              onCheckedChange={() => handleCheckboxChange("All")}
            >
              All
            </DropdownMenuCheckboxItem>
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
              checked={selectedStatus === "Out Of Stock"}
              onCheckedChange={() => handleCheckboxChange("Out Of Stock")}
            >
              Out of Stock
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "Suppressed"}
              onCheckedChange={() => handleCheckboxChange("Suppressed")}
            >
              Suppressed
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
          src={row.original.productImage}
          alt={row.original.productName}
        />
      </div>
    ),
  },
  {
    accessorKey: "productName",
    header: "Product Details",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("productName")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="capitalize font-medium">${row.getValue("price")}</div>
    ),
  },
  {
    accessorKey: "fba",
    header: "FBA/FBM",
    cell: ({ row }) => <div className="capitalize">{row.getValue("fba")}</div>,
  },
  {
    accessorKey: "channelStock",
    header: "Channel Stock",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("channelStock")}</div>
    ),
  },
  {
    accessorKey: "sale",
    header: "Sale",
    cell: ({ row }) => <div className="capitalize">{row.getValue("sale")}</div>,
  },
];

export function ListTable() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedStatus, setSelectedStatus] = React.useState("");

  const handleCheckboxChange = (status) => {
    setSelectedStatus((prevStatus) => (prevStatus === status ? "" : status));
    setColumnFilters([{ id: "status", value: status }]);
  };

  const clearFilter = () => {
    setSelectedStatus("");
    setColumnFilters([]);
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={table.getColumn("email")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-64 absolute top-0 mt-[-15px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="absolute top-0 right-[220px] mt-[-20px]"
          >
            <Button variant="outline" className="flex items-center px-1">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center px-1">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={selectedStatus === ""}
              onCheckedChange={() => handleCheckboxChange("")}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "In Stock"}
              onCheckedChange={() => handleCheckboxChange("In Stock")}
            >
              In Stock
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "Out of Stock"}
              onCheckedChange={() => handleCheckboxChange("Out of Stock")}
            >
              Out of Stock
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
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
  );
}
