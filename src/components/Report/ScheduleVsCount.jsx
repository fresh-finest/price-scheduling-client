import { BsFillInfoSquareFill } from "react-icons/bs";
import SalesDetailsBarChart from "../Graph/SalesDetailsBarChart";
import ScheduleSalesDetailsBarChart from "../Graph/ScheduleSalesDetailsBarChart";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

const ScheduleVsCount = ({
  view,
  scheduleSalesData,
  showScheduleSalesTable,
  setShowScheduleSalesTable,
}) => {
  const filterScheduleSalesData = scheduleSalesData.filter((sc) => {
    if (view === "day") {
      return sc.scheduleType === "single";
    } else if (view === "week") {
      return sc.scheduleType === "weekly";
    } else if (view === "month") {
      return sc.scheduleType === "monthly";
    }
  });

 
  const formatDate = (interval) => {
    // Split the interval into start and end times
    const [start, end] = interval.split(" - ");

    // Helper to safely parse and format date and time
    const formatDateTime = (dateString) => {
      const date = new Date(dateString.trim());
      if (isNaN(date.getTime())) {
        // Handle invalid date string
        console.error(`Invalid date string: ${dateString}`);
        return "Invalid date";
      }

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true, // 12-hour format
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    // Format start and end times
    const formattedStart = formatDateTime(start);
    const formattedEnd = formatDateTime(end);

    return `${formattedStart} - ${formattedEnd}`;
  };

  console.log("schedule sales data", scheduleSalesData);

  return (
    <Card className="mt-[1.5rem]  ">
      {scheduleSalesData.length ? (
        <div>
          <ScheduleSalesDetailsBarChart
            view={view}
            scheduleSalesData={scheduleSalesData}
          ></ScheduleSalesDetailsBarChart>
          <div className="flex justify-end mx-2 mb-1">
            <Button
              variant="outline"
              onClick={() => setShowScheduleSalesTable(!showScheduleSalesTable)}
            >
              {showScheduleSalesTable ? "Hide Table" : "View Data in Table"}
            </Button>
          </div>
          <section
            className={`transition-all duration-500 ${
              showScheduleSalesTable
                ? "h-full opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <table
              style={{
                tableLayout: "fixed",
              }}
              className="reportCustomTable table"
            >
              <thead>
                <tr>
                  <th
                    className="tableHeader"
                    style={{
                      position: "sticky",
                      textAlign: "center",
                      verticalAlign: "middle",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    {view === "day"
                      ? "Date"
                      : view === "week"
                      ? "Week"
                      : "Month"}
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      position: "sticky",
                      textAlign: "center",
                      verticalAlign: "middle",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    Price
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      position: "sticky",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody
                style={{
                  fontSize: "13px",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: "1.5",
                }}
              >
                {scheduleSalesData.length > 0 ? (
                  scheduleSalesData.map((item, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                

                        {formatDate(item?.interval)}
                      </td>
                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {/* {parseFloat(
                      view === "day" ? item.amount : item.averageAmount
                    ).toFixed(2)} */}
                        ${item.price}
                      </td>
                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        

                        {item.unitCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No Sales Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      ) : (
        <div className="h-[40vh] flex flex-col justify-center items-center">
          <p className="text-2xl flex  justify-center">
            <BsFillInfoSquareFill className="text-[#0D6EFD]" />
          </p>
          <h5 className="text-base">On Schedule Report Is not Available!</h5>
        </div>
      )}
    </Card>
  );
};

export default ScheduleVsCount;