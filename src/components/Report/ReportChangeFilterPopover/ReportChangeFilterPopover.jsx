import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from '@/components/ui/select';
import React from 'react';
import { CiFilter } from 'react-icons/ci';

const ReportChangeFilterPopover = ({
  unitOptions,
  reportChangeFilter,
  setReportChangeFilter,
  onSubmitFilter,
  setPendingFilter
}) => {
  const handleUnitChange = (val) => {
    setReportChangeFilter((prev) => ({
      ...prev,
      unit: val,
      value: '',
      minValue: '',
      maxValue: '',
    }));
  };

  const handleValueChange = (e) => {
    setReportChangeFilter((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleMinChange = (e) => {
    setReportChangeFilter((prev) => ({ ...prev, minValue: e.target.value }));
  };

  const handleMaxChange = (e) => {
    setReportChangeFilter((prev) => ({ ...prev, maxValue: e.target.value }));
  };

  const validateAndSubmit = () => {
    if (reportChangeFilter.unit === 'between') {
      const min = Number(reportChangeFilter.minValue);
      const max = Number(reportChangeFilter.maxValue);
      if (isNaN(min) || isNaN(max) || min > max) {
        alert("Invalid range: Min must be less than or equal to Max");
        return;
      }
    }
    onSubmitFilter();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndSubmit();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateAndSubmit();
  };

  return (
    <Popover className="p-0">
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <CiFilter className="text-base" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Select onValueChange={handleUnitChange} value={reportChangeFilter.unit}>
            <SelectTrigger>
              <span>{unitOptions.find((u) => u.value === reportChangeFilter.unit)?.label || 'Select'}</span>
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

          {reportChangeFilter.unit === 'between' ? (
            <div className="flex space-x-2">
              <Input
                placeholder="Min"
                type="number"
                value={reportChangeFilter.minValue}
                onChange={handleMinChange}
                onKeyDown={handleKeyDown}
              />
              <Input
                placeholder="Max"
                type="number"
                value={reportChangeFilter.maxValue}
                onChange={handleMaxChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          ) : (
            <Input
              placeholder="Enter number"
              value={reportChangeFilter.value}
              type="number"
              onChange={handleValueChange}
              onKeyDown={handleKeyDown}
            />
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ReportChangeFilterPopover;
