import { Switch } from "antd";

const NotificationSettings = () => {
  // const onChange = (e) => {
  //   console.log(`checked = ${e.target.checked}`);
  // };

  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };

  const notifications = [
    // {
    //   title: "Account out of sync",
    //   description:
    //     "We'll notify you when one of your financial accounts need to be linked again.",
    // },
    {
      title: "New Products",
      description:
        "You'll get notified when new products are added to your account.",
    },
    {
      title: "Sale Report",
      description:
        "Get notified when your sales report is generated and available for review.",
    },
    {
      title: "Stock Low & High",
      description:
        "Receive alerts when product stock levels are running low or replenished.",
    },
    {
      title: "Pricing",
      description:
        "Stay updated on price changes, promotions, and adjustments to your products.",
    },
  ];

  return (
    <section className="mt-3 ml-2">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="flex gap-10 text-md font-semibold justify-center items-center mr-32">
          <h4>Email</h4>
          <h4>Push</h4>
        </div>
      </div>
      <hr className="text-gray-400 mt-2" />

      {notifications.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between py-3">
            <div>
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="text-normal py-1">{item.description}</p>
            </div>
            <div className="flex gap-16 text-md font-semibold justify-center items-center mr-[7.6rem]">
              {/* <Checkbox onChange={onChange} /> */}
              {/* <Checkbox onChange={onChange} /> */}
              <Switch size="small" onChange={onChange} />
              <Switch size="small" onChange={onChange} />
            </div>
          </div>
          <hr className="text-gray-400 mt-2" />
        </div>
      ))}
    </section>
  );
};

export default NotificationSettings;
