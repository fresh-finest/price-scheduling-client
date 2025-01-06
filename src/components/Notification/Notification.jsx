import { useState } from "react";

import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tooltip,
} from "antd";
import { FaRegBell, FaRegUser } from "react-icons/fa";
import "./Notification.css";
import { Dropdown, Offcanvas } from "react-bootstrap";

import { IoClose } from "react-icons/io5";
import { Switch } from "antd";
import { BsThreeDots } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";
const { Option } = Select;

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopOverOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const onSwitchChange = (checked) => {
    console.log(`switch to ${checked}`);
  };

  return (
    <>
      <Tooltip placement="bottom" title="Notifications">
        <div
          onClick={showDrawer}
          className="hover:bg-gray-100 cursor-pointer px-3 py-2 hover:rounded-md "
        >
          <FaRegBell className="text-xl" />
        </div>
      </Tooltip>

      <Offcanvas
        show={open}
        onHide={onClose}
        placement="end"
        className="px-2 py-3"
      >
        <div className="">
          <div className="flex justify-between items-center  w-full">
            <h2 className="text-2xl font-medium flex-1">Notifications</h2>

            <div className="flex items-center gap-3">
              <div className=" px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                <BsThreeDots className="" />
              </div>

              <Tooltip placement="bottom" title="Close">
                <div
                  onClick={onClose}
                  className=" px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <IoClose className="text-md" />
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 mt-3">
            <Input
              placeholder="Search Notifications"
              prefix={<IoIosSearch />}
              className="w-[75%]"
            />

            <div className="flex items-center justify-center  gap-1">
              <Switch size="small" onChange={onSwitchChange} />
              <h4 className="text-sm">Unread Only</h4>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-normal my-3">Last 7 Days</h3>

            {/* have to change this dynamically */}
            {/* <div className="text-sm flex justify-between items-center">
              <div className="flex items-center ">
                <img
                  className="h-7 w-7 rounded-full"
                  src="https://files.monday.com/use1/photos/62875891/thumb_small/62875891-user_photo_initials_2024_07_01_13_40_16.png?1719841216"
                  alt=""
                />
                <h2 className="flex ">
                  {" "}
                  <span className="font-semibold"> Bipro Barai </span>
                  <span className="flex items-center gap-1 text-blue-500 mx-1">
                    <FaRegUser /> Assigned you{" "}
                  </span>
                  to the item &quot;Integrate updated api wit UI&quot;
                </h2>
              </div>

              <div>
                <h3>2 months ago</h3>
              </div>
            </div> */}

            <div className="flex justify-between gap-3 items-center p-1 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex items-center flex-1 ">
                <img
                  className="h-9 w-9 rounded-full mr-3"
                  src="https://files.monday.com/use1/photos/62875891/thumb_small/62875891-user_photo_initials_2024_07_01_13_40_16.png?1719841216"
                  alt="User Profile"
                />
                <h2 className="text-sm flex flex-wrap border-red-300">
                  <span className="font-semibold inline-block">
                    Bipro Barai
                  </span>
                  <span className="flex items-center text-blue-500 ml-2">
                    <FaRegUser /> Assigned you
                  </span>
                  to the item &quot;Integrate updated API with UI&quot;
                </h2>
              </div>
              <div className="text-xs text-gray-500 flex flex-wrap">
                2 days ago
              </div>
            </div>
          </div>
        </div>
      </Offcanvas>
    </>
  );
};

export default Notifications;
