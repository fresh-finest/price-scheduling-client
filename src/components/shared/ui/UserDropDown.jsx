import * as React from "react";
import { FiLogOut } from "react-icons/fi";
import { FaRegCircleUser } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaChevronUp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "@/redux/user/userSlice";
import { useSelector } from "react-redux";

const BASE_URL = `https://api.priceobo.com`;

const UserDropdown = ({ open }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const userInfo = {
    userName: currentUser.userName,
    email: currentUser.email,
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`${BASE_URL}/api/auth/logout`);
      const data = await res.json();
      if (data.success === false) {
        signOutUserFailure(data.message);
        return;
      }
      dispatch(signOutUserSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleSelect = (currentValue) => {
    // Perform actions based on selected value, but do not update the dropdown label.
    if (currentValue === "Logout") {
      handleSignOut();
    }
    // Close the dropdown
    setDropdownOpen(false);
  };

  return (
    <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={dropdownOpen}
          className="w-full justify-between py-3 mt-2"
        >
          <span className="flex items-center">
            {/* <FaUserCircle className="mr-2 text-xl text-blue-600" /> */}
            <p className="bg-blue-600 text-white rounded-full flex justify-center items-center w-8  h-8 mr-1 ">
              <span className="text-base ">
                {currentUser?.userName.substring(0, 1)}
              </span>
            </p>
            {/* <FaUserCircle className="mr-2 text-xl text-blue-600" /> */}
            {open && <span>{currentUser?.userName}</span>}
          </span>
          {open && <FaChevronUp className="ml-2 h-3 w-3 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem value={userInfo.username} onSelect={handleSelect}>
                <span className="flex flex-col text-start">
                  <span className="font-bold">{userInfo.userName}</span>
                  <span className="text-gray-500">{userInfo.email}</span>
                </span>
              </CommandItem>

              <CommandItem value="Profile" onSelect={handleSelect}>
                <FaRegCircleUser className="mr-1" /> Profile
              </CommandItem>
              <CommandItem value="Logout" onSelect={handleSelect}>
                <FiLogOut className="mr-1" /> Logout
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserDropdown;
