import { useState } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import { RiArrowLeftSLine } from "react-icons/ri";
import { FaChartLine, FaListUl, FaRegCalendarAlt } from "react-icons/fa";
import { GoGear, GoHistory } from "react-icons/go";

import { Link, NavLink, Outlet } from "react-router-dom";
import AccountDropdown from "../shared/ui/AccountDropdown";
import UserDropdown from "../shared/ui/UserDropDown";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import priceoboLogo from "../../assets/images/priceobo-logo.png";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineProduct } from "react-icons/ai";
import { LuGroup } from "react-icons/lu";
import { FaListCheck } from "react-icons/fa6";

import { Cog } from "lucide-react";
import Notifications from "../Notification/Notification";
const SidebarLayout = () => {
  const [open, setOpen] = useState(true);

  const Menus = [
    { title: "Calendar", icon: <FaRegCalendarAlt />, path: "/calendar" },
    { title: "Skus", icon: <AiOutlineProduct />, path: "/list" },
    { title: "Products", icon: <LuGroup />, path: "/product" },
    { title: "Automation", icon: <Cog />, path: "/automation" },
    // { title: "List", icon: <FaListUl />, path: "/list" },
    { title: "Report", icon: <TbReportAnalytics />, path: "/sale-report" },
    { title: "Status", icon: <FaListCheck />, path: "/status" },
    // { title: "Status", icon: <PiChartLineUpLight />, path: "/status" },
    // {
    //   title: "Manage User",
    //   icon: <MdOutlineManageAccounts />,
    //   path: "/manage",
    // },
    { title: "History", icon: <GoHistory />, path: "/history" },
    // { title: "Dashboard", icon: <Cog />, path: "/dashboard" },
  ];

  return (
    <section className="relative">
      <div className="flex flex-col h-screen ">
        <div className="absolute right-[13.5rem] top-2 z-20">
          <Notifications></Notifications>
        </div>
        <div className="absolute right-2 top-2 z-20">
          <AccountDropdown />
        </div>
        <div className="flex flex-1 ">
          {/* Sidebar */}
          <div
            // className={`bg-[#0662BB]  h-screen p-4 relative ${
            className={`bg-[#FBFBFB] h-screen p-4 relative ${
              open ? "w-52" : "w-20"
            } duration-300  shadow flex flex-col sticky top-0 z-50`}
          >
            {/* <BsArrowLeftShort
              onClick={() => setOpen(!open)}
              className={`bg-white text-dark-purple text-2xl rounded-full absolute -right-1 top-12 border border-blue-900 cursor-pointer ${
                !open && "rotate-180"
              }`}
            /> */}
            <RiArrowLeftSLine
              onClick={() => setOpen(!open)}
              className={`bg-white text-dark-purple text-[25px] rounded-full absolute -right-1 top-12 border border-blue-900 cursor-pointer  ${
                !open && "rotate-180"
              }`}
            />

            {/* Image logo with both priceobo icon and priceobo text */}
            {open ? (
              <div className="inline-flex py-3 items-center">
                <img
                  src={priceoboLogo}
                  alt="priceobo Logo"
                  className={` w-40 h-[35px] mt-[-25px] transition-all duration-200 `}
                  // className={`duration-300 ${
                  //   !open ? "w-12 h-12" : "w-40 h-auto"
                  // }`}
                  style={{
                    objectFit: "contain",
                    // overflow: "hidden",
                  }}
                />
              </div>
            ) : (
              <div className="inline-flex py-3 items-center">
                <img
                  src={priceoboIcon}
                  alt="Priceobo Icon"
                  className={` w-[32px] h-[35px]  mt-[-25px] transition-all duration-200 `}
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}

            {/* Sidebar menu */}
            <ul className="flex-grow">
              {Menus.map((menu, index) => (
                <NavLink
                  to={menu.path}
                  key={index}
                  className={({ isActive }) =>
                    `text-sm flex items-center gap-x-4 cursor-pointer px-1 py-2 hover:bg-white rounded-md ${
                      isActive
                        ? "bg-white border text-blue-500 font-semibold"
                        : "text-gray-500"
                    } mt-2`
                  }
                >
                  <span className="text-2xl block float-left">{menu.icon}</span>
                  <span
                    className={`text-base text-black flex-1 duration-200 ${
                      !open && "hidden"
                    }`}
                  >
                    {menu.title}
                  </span>
                </NavLink>
              ))}
            </ul>

            {/* Bottom menu for Settings and Logout */}
            <ul className="mt-auto">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `text-sm flex items-center gap-x-4 cursor-pointer px-1 py-2 hover:bg-white rounded-md ${
                    isActive
                      ? "bg-white border text-blue-500 font-semibold"
                      : "text-gray-500"
                  } mt-2`
                }
              >
                <span className="text-2xl block float-left">
                  <GoGear />
                </span>
                <span
                  className={`text-base text-black flex-1 duration-200 ${
                    !open && "hidden"
                  }`}
                >
                  Settings
                </span>
              </NavLink>

              {/* Passed open state to UserDropdown */}
              <UserDropdown open={open} />
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SidebarLayout;
