import SalesDetailsBarChart from "../Graph/SalesDetailsBarChart";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

const PriceVsCount = ({
  view,
  salesData,
  showTable,
  setShowTable,
  startDate,
  endDate,
  formatDate,
  handleViewChange,
  handleIdentifierTypeChange,
  identifierType,
  scheduleSalesData,
}) => {
  return (
    <Card className="mt-[1.5rem] relative ">
      <div className="absolute top-1 right-[5.8%]">
        <Button
          className={` ${
            identifierType === "sku"
              ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
              : ""
          }`}
          onClick={() => handleIdentifierTypeChange("sku")}
          variant="outline"
        >
          SKU
        </Button>
      </div>
      <div className="absolute top-1 right-2">
        <Button
          className={` ${
            identifierType === "asin"
              ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
              : ""
          }`}
          onClick={() => handleIdentifierTypeChange("asin")}
          variant="outline"
        >
          ASIN
        </Button>
      </div>

      <SalesDetailsBarChart
        view={view}
        salesData={salesData}
        scheduleSalesData={scheduleSalesData}
      ></SalesDetailsBarChart>
      <div className="flex justify-end mx-2 mb-1 gap-2">
        <Button
          onClick={() => handleViewChange("day")}
          variant="outline"
          className={`w-[80px] justify-center ${
            view === "day"
              ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
              : ""
          }`}
        >
          By Day
        </Button>
        <Button
          onClick={() => handleViewChange("week")}
          variant="outline"
          className={`w-[80px] justify-center ${
            view === "week"
              ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
              : ""
          }`}
        >
          By Week
        </Button>
        <Button
          onClick={() => handleViewChange("month")}
          variant="outline"
          className={`w-[80px] justify-center ${
            view === "month"
              ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
              : ""
          }`}
        >
          By Month
        </Button>
        <Button variant="outline" onClick={() => setShowTable(!showTable)}>
          {showTable ? "Hide Table" : "View Data in Table"}
        </Button>
      </div>
      <section
        className={`transition-all duration-500 ${
          showTable ? "h-full opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
        style={
          {
            // maxHeight: "91vh",
            // overflowY: "auto",
            // marginTop: "20px",
            // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          }
        }
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
                {view === "day" || (startDate && endDate)
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
            {salesData.length > 0 ? (
              salesData.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {view === "day" || (startDate && endDate)
                      ? formatDate(item.date)
                      : view === "week"
                      ? item.week
                      : item.month}
                  </td>
                  <td
                    style={{
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {parseFloat(
                      view === "day" || (startDate && endDate)
                        ? item.amount
                        : item.averageAmount
                    ).toFixed(2)}
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
    </Card>
  );
};
export default PriceVsCount;