import React from "react";

const SaleReportLoadingSkeleton = () => {
  return (
    <div className="">
      {/* <div className=" ">
        <div className="min-w-[500px] absolute top-[11px] mb-3 bg-gray-800/20 h-10 animate-pulse"></div>
      </div> */}

      <section
        className=" rounded-md  bg-gray-800/10 animate-pulse"
        style={{
          // maxHeight: "91vh",
          // overflowY: "auto",
          // marginTop: "50px",
          // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table
          style={{
            tableLayout: "fixed",
          }}
          className="statusCustomTable table"
        >
          <thead
            style={{
              //   backgroundColor: "#f0f0f0",
              color: "#333",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            <tr>
              <th
                style={{
                  width: "70px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                style={{
                  width: "120px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                style={{
                  width: "270px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                style={{
                  // width: "100px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                style={{
                  // width: "100px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                style={{
                  width: "140px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              fontSize: "12px",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.5",
            }}
          >
            {Array(14)
              .fill(null)
              .map((job, index) => (
                <tr key={index}>
                  <td
                    style={{
                      // cursor: "pointer",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      className="bg-gray-800/20 animate-pulse"
                      style={{
                        height: "50px",
                        width: "50px",
                        margin: "0 auto",
                        objectFit: "contain",
                      }}
                      // src={item?.imageUrl ? item?.imageUrl : ""}
                    />
                  </td>
                  <td
                    style={{
                      padding: "15px 0",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      // cursor: "pointer",
                      height: "40px",
                      textAlign: "start",
                      verticalAlign: "middle",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-full h-4 mx-auto"></p>
                  </td>
                  <td
                    style={{
                      padding: "15px 0",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
                  </td>
                  <td
                    style={{
                      padding: "15px 0",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-[90%] h-4 mx-auto"></p>
                  </td>
                  <td
                    style={{
                      padding: "15px 0",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
                  </td>
                
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SaleReportLoadingSkeleton;