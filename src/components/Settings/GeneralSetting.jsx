import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import React, { useState } from "react";
import TimezoneSelect from "react-timezone-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const GeneralSettings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const userInfo = {
    userName: currentUser.userName,
    email: currentUser.email,
  };
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

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
        <h2 className="text-normal font-semibold w-[30%]">Choose timezone</h2>

        <div className="flex justify-between items-center  w-full">
          <div className="w-[30%]">
            <TimezoneSelect
              value={selectedTimezone}
              onChange={setSelectedTimezone}
            />
          </div>
        </div>
      </div>
      <div>
        {/* <div className="">
          <TimezoneSelect
            value={selectedTimezone}
            onChange={setSelectedTimezone}
          />
        </div> */}
        {/* <h3>Output:</h3>
        <div
          style={{
            backgroundColor: "#ccc",
            padding: "20px",
            margin: "20px auto",
            borderRadius: "5px",
            maxWidth: "600px",
          }}
        >
          <pre
            style={{
              margin: "0 20px",
              fontWeight: 500,
              fontFamily: "monospace",
            }}
          >
            {JSON.stringify(selectedTimezone, null, 2)}
          </pre>
        </div> */}
      </div>
    </section>
  );
};

export default GeneralSettings;