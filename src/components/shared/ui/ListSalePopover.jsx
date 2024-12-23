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

const ListSalePopover = ({
  handleListSalePopoverSubmit,
  dayOptions,
  unitOptions,
  selectedDay,
  setSelectedDay,
  selectedUnit,
  setSelectedUnit,
  inputValue,
  setInputValue,
  filters,
  saleBetweenMinValue,
  setSaleBetweenMinValue,
  saleBetweenMaxValue,
  setSaleBetweenMaxValue,
}) => {
  const handleDaySelection = (value) => {
    const selectedOption = dayOptions.find((option) => option.value === value);
    console.log("selected option", selectedOption);
    setSelectedDay(selectedOption);
  };

  // const handleUnitSelection = (value) => {
  //   const selectedOption = unitOptions.find((option) => option.value === value);
  //   setSelectedUnit(selectedOption);
  // };

  const handleUnitSelection = (value) => {
    const selectedOption = unitOptions.find((option) => option.value === value);
    setSelectedUnit(selectedOption);

    if (value !== "between") {
      setSaleBetweenMinValue("");
      setSaleBetweenMaxValue("");
      setInputValue("");
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event, currentPage) => {
    if (event.key === "Enter") {
      handleListSalePopoverSubmit(event, currentPage);
    }
  };

  return (
    <Popover className="p-0">
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter
            className={`text-base ${
              filters?.salesCondition?.value ? "text-blue-600" : ""
            }`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3">
        <form onSubmit={handleListSalePopoverSubmit} className="space-y-3">
          <Select className="w-full" onValueChange={handleDaySelection}>
            <SelectTrigger>
              <span>{selectedDay.label}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {dayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select className="w-full" onValueChange={handleUnitSelection}>
            <SelectTrigger>
              <span>{selectedUnit.label}</span>
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

          {selectedUnit.value === "between" ? (
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                value={saleBetweenMinValue}
                type="number"
                onChange={(e) => setSaleBetweenMinValue(e.target.value)}
              />
              <Input
                placeholder="Max"
                value={saleBetweenMaxValue}
                type="number"
                onChange={(e) => setSaleBetweenMaxValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          ) : (
            <Input
              placeholder="Filter"
              value={inputValue}
              type="number"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ListSalePopover;