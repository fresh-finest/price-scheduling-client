import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CiFilter } from "react-icons/ci";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { LuArrowUpDown } from "react-icons/lu";

const ListChannelStockPopover = ({
  handleChannelStockPopoverSubmit,

  unitOptions,

  selectedChannelStockUnit,
  setSelectedChannelStockUnit,
  channelStockInputValue,
  setChannelStockInputValue,
}) => {
  const handleUnitSelection = (value) => {
    const selectedOption = unitOptions.find((option) => option.value === value);
    setSelectedChannelStockUnit(selectedOption);
  };

  const handleInputChange = (event) => {
    setChannelStockInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleChannelStockPopoverSubmit(event);
    }
  };

  return (
    <Popover className="p-0">
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter className="text-base" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3">
        <form onSubmit={handleChannelStockPopoverSubmit} className="space-y-3">
          <Select className="w-full" onValueChange={handleUnitSelection}>
            <SelectTrigger>
              <span>{selectedChannelStockUnit.label}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter"
            value={channelStockInputValue}
            type="number"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          {/* <Button type="submit" className="w-full">
            Apply
          </Button> */}
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ListChannelStockPopover;