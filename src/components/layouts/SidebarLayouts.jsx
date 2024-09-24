import { useState } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import { RiArrowLeftSLine } from "react-icons/ri";
import { FaListUl, FaRegCalendarAlt } from "react-icons/fa";
import { GoGear, GoHistory } from "react-icons/go";
import { MdOutlineManageAccounts } from "react-icons/md";
import { Link, NavLink, Outlet } from "react-router-dom";
import AccountDropdown from "../shared/ui/AccountDropdown";
import UserDropdown from "../shared/ui/UserDropDown";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import priceoboLogo from "../../assets/images/priceobo-logo.png";

const SidebarLayout = () => {
  const [open, setOpen] = useState(true);

  const Menus = [
    { title: "Calendar", icon: <FaRegCalendarAlt />, path: "/calendar" },
    { title: "List", icon: <FaListUl />, path: "/list" },
    { title: "History", icon: <GoHistory />, path: "/history" },
    {
      title: "Manage User",
      icon: <MdOutlineManageAccounts />,
      path: "/manage",
    },
  ];

  return (
    <section className="relative">
      <div className="flex flex-col h-screen ">
        <div className="absolute right-2 top-2">
          <AccountDropdown />
        </div>
        <div className="flex flex-1 ">
          {/* Sidebar */}
          <div
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

            {/* <Link to="/" className="inline-flex py-2">
              <img
                className={` cursor-pointer block float-left mr-3 w-[30px]   object-cover text-[#2C86F2]`}
                style={{ minWidth: "36px", minHeight: "30px" }}
                src={priceoboIcon}
                alt="priceobo_logo"
              />

              <span
                className={`text-2xl font-semibold text-black flex-1 duration-200 ${
                  !open && "hidden"
                }`}
              >
                priceobo
              </span>
            </Link> */}

            {/* icon with text: works fine */}

            {/* <Link to="/" className="inline-flex py-2">
              <img
                className={` cursor-pointer block float-left mr-3 w-[30px]   object-cover text-[#2C86F2]`}
                style={{ minWidth: "36px", minHeight: "30px" }}
                src={priceoboIcon}
                alt="priceobo_logo"
              />

              <span
                className={`text-3xl font-normal text-black flex-1 duration-200 ${
                  !open && "hidden"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                priceobo
              </span>
            </Link> */}

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
              <li
                className={`text-sm flex items-center gap-x-4 cursor-pointer px-1 py-2 hover:bg-white rounded-md 
                       "bg-white  text-gray-500 font-semibold"
                         "text-gray-500"
                     mt-2`}
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
              </li>

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
