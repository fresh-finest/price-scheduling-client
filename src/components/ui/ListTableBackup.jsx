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

const data = [
  {
    id: "m5gr84i9",
    price: 316,
    status: "active",
    email: "ken99@yahoo.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 1",
    fba: "data 1",
    channelStock: "data 1",
    sale: "data 1",
  },
  {
    id: "3u1reuv4",
    price: 242,
    status: "active",
    email: "Abe45@gmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 2",
    fba: "data 2",
    channelStock: "data 2",
    sale: "data 2",
  },
  {
    id: "derv1ws0",
    price: 837,
    status: "Suppressed",
    email: "Monserrat44@gmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 3",
    fba: "data 3",
    channelStock: "data 3",
    sale: "data 3",
  },
  {
    id: "5kma53ae",
    price: 874,
    status: "active",
    email: "Silas22@gmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 4",
    fba: "data 4",
    channelStock: "data 4",
    sale: "data 4",
  },
  {
    id: "bhqecj4p",
    price: 721,
    status: "Inactive",
    email: "carmella@hotmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 5",
    fba: "data 5",
    channelStock: "data 5",
    sale: "data 5",
  },
  {
    id: "m5gr84i9",
    price: 316,
    status: "active",
    email: "ken99@yahoo.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 6",
    fba: "data 6",
    channelStock: "data 6",
    sale: "data 6",
  },
  {
    id: "3u1reuv4",
    price: 242,
    status: "active",
    email: "Abe45@gmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 7",
    fba: "data 7",
    channelStock: "data 7",
    sale: "data 7",
  },
  {
    id: "derv1ws0",
    price: 837,
    status: "Suppressed",
    email: "Monserrat44@gmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 8",
    fba: "data 8",
    channelStock: "data 8",
    sale: "data 8",
  },
  {
    id: "5kma53ae",
    price: 874,
    status: "active",
    email: "Silas22@gmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 9",
    fba: "data 9",
    channelStock: "data 9",
    sale: "data 9",
  },
  {
    id: "bhqecj4p",
    price: 721,
    status: "Out of Stock",
    email: "carmella@hotmail.com",
    productImage:
      "https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg",
    productName: "product 10",
    fba: "data 10",
    channelStock: "data 10",
    sale: "data 10",
  },
];

export const columns = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <div className="capitalize">{row.getValue("status")}</div>
  //   ),
  // },

  //..................multiple status filter feature (but it is not working properly)
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => {
  //     const [selectedStatuses, setSelectedStatuses] = React.useState([]);

  //     const handleCheckboxChange = (status) => {
  //       setSelectedStatuses((prev) =>
  //         prev.includes(status)
  //           ? prev.filter((item) => item !== status)
  //           : [...prev, status]
  //       );
  //     };

  //     React.useEffect(() => {
  //       console.log(selectedStatuses);
  //       if (selectedStatuses.length > 0) {
  //         column.setFilterValue(selectedStatuses);
  //       } else {
  //         column.setFilterValue([]);
  //       }
  //     }, [selectedStatuses, column]);

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="outline" className="flex items-center px-1">
  //             Status <ChevronDown className="ml-2 h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="start">
  //           <DropdownMenuCheckboxItem
  //             checked={selectedStatuses.includes("active")}
  //             onCheckedChange={() => handleCheckboxChange("active")}
  //           >
  //             Active
  //           </DropdownMenuCheckboxItem>
  //           <DropdownMenuCheckboxItem
  //             checked={selectedStatuses.includes("failed")}
  //             onCheckedChange={() => handleCheckboxChange("failed")}
  //           >
  //             In Active
  //           </DropdownMenuCheckboxItem>
  //           <DropdownMenuCheckboxItem
  //             checked={selectedStatuses.includes("processing")}
  //             onCheckedChange={() => handleCheckboxChange("processing")}
  //           >
  //             Out of Stock
  //           </DropdownMenuCheckboxItem>
  //           <DropdownMenuCheckboxItem
  //             checked={selectedStatuses.includes("processing")}
  //             onCheckedChange={() => handleCheckboxChange("processing")}
  //           >
  //             Suppressed
  //           </DropdownMenuCheckboxItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem
  //             className="flex justify-center"
  //             onClick={() => setSelectedStatuses([])} // Clear all selected filters
  //           >
  //             Clear Filter
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   cell: ({ row }) => (
  //     <div className="capitalize">{row.getValue("status")}</div>
  //   ),
  // },

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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-center"
              onClick={() => setSelectedStatus(null)} // Clear filter
            >
              Clear Filter
            </DropdownMenuItem>
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
  // {
  //   accessorKey: "productName",
  //   header: "Product",
  //   cell: ({ row }) => (
  //     <div className="capitalize">
  //       <img src={row.getValue("productImage")} alt="" />
  //       {row.getValue("productName")}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "productName",
    header: "Product Details",
    cell: ({ row }) => (
      <div className="capitalize ">{row.getValue("productName")}</div>
    ),
  },
  // {
  //   accessorKey: "email",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Email
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  // },
  // {
  //   accessorKey: "email",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Email
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  // },

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
    cell: ({ row }) => <div className="capitalize ">{row.getValue("fba")}</div>,
  },
  {
    accessorKey: "channelStock",
    header: "Channel Stock",
    cell: ({ row }) => (
      <div className="capitalize ">{row.getValue("channelStock")}</div>
    ),
  },
  {
    accessorKey: "sale",
    header: "Sale",
    cell: ({ row }) => (
      <div className="capitalize ">{row.getValue("sale")}</div>
    ),
  },

  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const payment = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(payment.id)}
  //           >
  //             Copy payment ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View payment details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];

export function ListTableBackup() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
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
