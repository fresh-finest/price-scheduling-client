import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";

import ManageUserByAdmin from "@/pages/ManageUserByAdmin";
import GeneralSetting from "./GeneralSetting";
import SecuritySettting from "./SecuritySettting";
import BillingSettings from "./BillingSetting";
import NotificationSetting from "./NotificationSetting";



const SettingsView = () => {
  const { currentUser } = useSelector((state) => state.user);
  const userInfo = {
    userName: currentUser.userName,
    email: currentUser.email,
  };

  const [activeTab, setActiveTab] = useState("general");

  return (
    <section>
      <div className="mt-[-5px]">
        <h2 className="text-3xl mb-1">{userInfo.userName} </h2>
        <h5 className="text-sm text-gray-500">
          Manage your personal details and users here
        </h5>
      </div>

      {/* Separate Buttons for Tabs */}
      <div className="flex gap-1 mt-3">
        <Button
          //   className={`${
          //     activeTab === "general"
          //       ? "border font-semibold"
          //       : "hover:bg-gray-100"
          //   } px-3 py-1 rounded-md`}
          variant={activeTab === "general" ? "outline" : "ghost"}
          onClick={() => setActiveTab("general")}
        >
          General
        </Button>
        <Button
          variant={activeTab === "security" ? "outline" : "ghost"}
          onClick={() => setActiveTab("security")}
        >
          Security
        </Button>
        <Button
          variant={activeTab === "manageUser" ? "outline" : "ghost"}
          onClick={() => setActiveTab("manageUser")}
        >
          Users
        </Button>
        <Button
          variant={activeTab === "billing" ? "outline" : "ghost"}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </Button>
        <Button
          variant={activeTab === "notification" ? "outline" : "ghost"}
          onClick={() => setActiveTab("notification")}
        >
          Notifications
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="mt-2">
          <GeneralSetting/>
        </div>
      )}
      {activeTab === "security" && (
        <div className="mt-2">
          <SecuritySettting/>
          </div>
      )}
      {activeTab === "billing" && (
        <div className="mt-2">
          <BillingSettings/>
        </div>
      )}
      {activeTab === "notification" && (
        <div className="mt-2">
          <NotificationSetting></NotificationSetting>
        </div>
      )}

      {activeTab === "manageUser" && (
        <div className="mt-2">
          <ManageUserByAdmin />
        </div>
      )}
    </section>
  );
};

export default SettingsView;