import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { CiFilter } from 'react-icons/ci';

const ReportCurrentIntervalUnitsFilter = ({
  unitOptions,
  unitsFilter,
  setUnitsFilter,
  onSubmitUnitsFilter,
}) => {
  const handleUnitChange = (val) => {
    setUnitsFilter((prev) => ({
      ...prev,
      unit: val,
      value: '',
      minValue: '',
      maxValue: '',
    }));
  };

  const handleValueChange = (e) => {
    setUnitsFilter((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleMinChange = (e) => {
    setUnitsFilter((prev) => ({ ...prev, minValue: e.target.value }));
  };

  const handleMaxChange = (e) => {
    setUnitsFilter((prev) => ({ ...prev, maxValue: e.target.value }));
  };

  const validateAndSubmit = () => {
    if (unitsFilter.unit === 'between') {
      const min = Number(unitsFilter.minValue);
      const max = Number(unitsFilter.maxValue);
      if (isNaN(min) || isNaN(max) || min > max) {
        alert('Invalid range: Min must be less than or equal to Max');
        return;
      }
    }
    onSubmitUnitsFilter();
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
          <Select onValueChange={handleUnitChange} value={unitsFilter.unit}>
            <SelectTrigger>
              <span>
                {
                  unitOptions.find((u) => u.value === unitsFilter.unit)?.label ||
                  'Select'
                }
              </span>
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

          {unitsFilter.unit === 'between' ? (
            <div className="flex space-x-2">
              <Input
                placeholder="Min"
                type="number"
                value={unitsFilter.minValue}
                onChange={handleMinChange}
                onKeyDown={handleKeyDown}
              />
              <Input
                placeholder="Max"
                type="number"
                value={unitsFilter.maxValue}
                onChange={handleMaxChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          ) : (
            <Input
              placeholder="Enter number"
              value={unitsFilter.value}
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

export default ReportCurrentIntervalUnitsFilter;
