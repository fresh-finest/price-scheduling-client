import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../shared/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FaChevronDown } from "react-icons/fa";
import Cookies from "js-cookie";

const AccountDropdown = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const accounts = [
    { value: "ATVPDKIKX0DER", label: "FF-US" },
    { value: "A2EUQ1WTGCTBG2", label: "FF-CA" },
  ];

  const DEFAULT_MARKETPLACE_ID = "ATVPDKIKX0DER"; // Default to US marketplace

  useEffect(() => {
    const storedMarketplaceId = Cookies.get("marketplace_id");

    if (storedMarketplaceId) {
      setValue(storedMarketplaceId);
    } else {
      // Try to fetch marketplace ID from the backend
      fetch("https://api.priceobo.com/api/market", {
        credentials: "include", // Include cookies with the request
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.marketplaceId) {
            setValue(data.marketplaceId);
            Cookies.set("marketplace_id", data.marketplaceId, { path: "/" });
          } else {
            // Fallback to default marketplace ID if API does not return a value
            setValue(DEFAULT_MARKETPLACE_ID);
            Cookies.set("marketplace_id", DEFAULT_MARKETPLACE_ID, { path: "/" });
          }
        })
        .catch((error) => {
          console.error("Error fetching marketplace ID:", error);
          // Fallback to default marketplace ID if an error occurs
          setValue(DEFAULT_MARKETPLACE_ID);
          Cookies.set("marketplace_id", DEFAULT_MARKETPLACE_ID, { path: "/" });
        });
    }
  }, []);

  const handleSelect = (selectedValue) => {
    setValue(selectedValue === value ? "" : selectedValue);
    Cookies.set("marketplace_id", selectedValue, { path: "/" });

    // Close the dropdown
    setOpen(false);

    // Reload the page
    // window.location.reload();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-[200px] justify-between">
          {value ? accounts.find((acc) => acc.value === value)?.label : "Select Account"}
          <FaChevronDown className="ml-2 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem key={account.value} onSelect={() => handleSelect(account.value)}>
                  <Check className={cn("mr-2 h-4 w-4", value === account.value ? "opacity-100" : "opacity-0")} />
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
