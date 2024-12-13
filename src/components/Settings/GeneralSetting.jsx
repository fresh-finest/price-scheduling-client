import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import React, { useContext, useEffect, useState } from "react";
import TimezoneSelect from "react-timezone-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;

import { TimeZoneContext } from "../../contexts/TimeZoneContext";
import axios from "axios";
import moment from "moment-timezone";

const GeneralSettings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { timeZone, loading, fetchTimZone } = useContext(TimeZoneContext);
 
  console.log(currentUser);
  const userInfo = {
    userName: currentUser.userName,
    email: currentUser.email,
  };

  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [updating, setUpdating] = useState(false);
  const [timeZoneList, setTimeZoneList] = useState([]);
  useEffect(() => {
    const zones = moment.tz.names();
    setTimeZoneList(zones);
  },[]);
  useEffect(() => {
    if (!loading && timeZone) {
      setSelectedTimezone(timeZone);
    }
  }, [loading, timeZone]);
  const handleTimezoneUpdate = async () => {
    try {
      setUpdating(true);
      const response = await axios.put(`${BASE_URL}/api/time-zone`, {
        timeZone: selectedTimezone,
      });
      if (response.status === 200 && response.data.status === "Success") {
        fetchTimZone();
      } else {
        console.error("Failed to update time zone: ", response.data);
      }
    } catch (error) {
      console.error(
        "Error updating time zone",
        error.response ? error.response.data : error.message
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="mt-3 ml-2">
      <h2 className="text-xl  font-semibold">Basics</h2>
      <hr className="text-gray-400 mt-2" />

      <div className="flex  items-center mt-2 py-2">
        <h2 className="text-normal font-semibold w-[30%]">Photo</h2>

        <div className="flex justify-between items-center  w-full">
          <div>
            <Avatar>
              <AvatarImage
                src="https://img.icons8.com/external-kmg-design-flat-kmg-design/64/external-user-user-interface-kmg-design-flat-kmg-design-2.png"
                alt="user-image"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>

          <div>
            <Button variant="outline" size="icon" className="px-4">
              Edit
            </Button>
          </div>
        </div>
      </div>
      <hr className="text-gray-400 mt-2" />

      <div className="flex  items-center mt-2 py-2">
        <h2 className="text-normal font-semibold w-[30%]">Name</h2>

        <div className="flex justify-between items-center  w-full">
          <div>
            <h2 className="text-normal font-normal px-2">
              {userInfo.userName}
            </h2>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="px-4">
                  Edit
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 mr-4">
                <form>
                  <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      defaultValue={userInfo.userName}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="outline" size="icon" className="px-4">
                      Save
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <hr className="text-gray-400 mt-2" />

      <div className="flex  items-center mt-2 py-2">
        <h2 className="text-normal font-semibold w-[30%]">Email Address</h2>

        <div className="flex justify-between items-center  w-full">
          <div>
            <h2 className="text-normal font-normal px-2">{userInfo.email}</h2>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="px-4">
                  Edit
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 mr-4">
                <form>
                  <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={userInfo.email}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="outline" size="icon" className="px-4">
                      Save
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <hr className="text-gray-400 mt-2" />

      <h2 className="text-xl  font-semibold py-2 mt-4">Preferences</h2>
      <hr className="text-gray-400 mt-2" />

      <div className="flex  items-center mt-2 py-2">
      {currentUser.role === "primeAdmin" && (
        <h2 className="text-normal font-semibold w-[30%]">Choose timezone</h2>  )}
        
        <div className="flex justify-between items-center  w-full">
        {currentUser.role === "primeAdmin" && (
          <div className="w-[30%]">
            <select
              className="border rounded p-2 w-full"
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
            >
              {timeZoneList.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        )}
          <div>
            {currentUser.role === "primeAdmin" && (
              <Button
                className="px-16 w-[30%]"
                variant="outline"
                size="icon"
                onClick={handleTimezoneUpdate}
                disabled={updating || loading}
              >
                {updating ? "Updating..." : "Update Timezone"}
              </Button>
            )}
          </div>
          <h2 className="text-normal font-semibold w-[30%]">
            {" "}
            Current Time Zone: {loading ? "Loading..." : timeZone}
          </h2>
        </div>
      </div>
    </section>
  );
};

export default GeneralSettings;
