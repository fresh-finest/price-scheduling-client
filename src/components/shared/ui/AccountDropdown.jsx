import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../shared/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FaChevronDown } from "react-icons/fa";
import Cookies from "js-cookie";

const AccountDropdown = () => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const accounts = [
    { value: "ATVPDKIKX0DER", label: "FF-US" },
    { value: "A2EUQ1WTGCTBG2", label: "FF-CA" },
  ];

  // Fetch the marketplace_id from the backend on component mount
  React.useEffect(() => {
    // First, check if marketplace_id is stored in cookies
    const storedMarketplaceId = Cookies.get("marketplace_id");
    if (storedMarketplaceId) {
      setValue(storedMarketplaceId);
    } else {
      // If not in cookies, fetch from the backend
      fetch("http://localhost:3000/api/market", {
        method: "GET",
        credentials: "include", // Send cookies with the request
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.marketplaceId) {
            setValue(data.marketplaceId);
            Cookies.set("marketplace_id", data.marketplaceId, { path: "/" });
          }
        })
        .catch((error) => console.error("Error fetching marketplace ID:", error));
    }
  }, []);

  const handleSelect = (currentValue) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    setOpen(false);

    // Set or clear the marketplace_id cookie
    if (newValue) {
      Cookies.set("marketplace_id", newValue, { path: "/" });
    } else {
      Cookies.remove("marketplace_id", { path: "/" });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value ? accounts.find((account) => account.value === value)?.label : "Select Account"}
          <FaChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem
                  key={account.value}
                  value={account.value}
                  onSelect={() => handleSelect(account.value)}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === account.value ? "opacity-100" : "opacity-0")}
                  />
                  {account.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AccountDropdown;
