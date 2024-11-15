import React from "react";

const HistoryLoadingSkeleton = () => {
  return (
    <div>
      <div className="">
        <div className=" ">
          <div className="min-w-[500px] absolute top-[11px] mb-3 bg-gray-800/20 h-10 animate-pulse"></div>
        </div>

        <div className="absolute top-[11px] right-[15.5%] w-[180px] bg-gray-800/20 h-8 animate-pulse"></div>
      </div>

      <section
        className=" rounded-md  bg-gray-800/10 animate-pulse"
        style={{
          maxHeight: "91vh",
          overflowY: "auto",
          marginTop: "50px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table
          // hover
          // responsive
          style={{
            tableLayout: "fixed",
          }}
          className=" historyCustomTable table"
        >
          <thead
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            <tr>
              <th
                style={{
                  width: "20px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              ></th>
              <th
                style={{
                  width: "60px",
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
                  width: "255px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-32 h-4 mx-auto"></p>
              </th>
              <th
                style={{
                  width: "60px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                // className="tableHeader"
                style={{
                  width: "200px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
              </th>
              <th
                // className="tableHeader"
                style={{
                  width: "90px",
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
                  width: "60px",
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
              .map((item, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      style={{
                        height: "50px",

                        margin: "20px 0",
                      }}
                    >
                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      ></td>

                      <td
                        style={{
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
                        />
                      </td>

                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",

                          height: "40px",
                          textAlign: "start",
                          verticalAlign: "middle",
                        }}
                      >
                        <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-full h-4 mx-auto mb-1"></p>
                        <div className="flex  gap-2">
                          <p className="  bg-gray-800/20 animate-pulse w-28 h-6 "></p>
                          <p className="  bg-gray-800/20 animate-pulse w-28 h-6 "></p>
                        </div>
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",
                          // cursor: "pointer",
                          height: "40px",
                        }}
                      >
                        <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-12 h-4 mx-auto mb-1"></p>
                      </td>
                      {/* duration */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",

                          width: "50px",
                        }}
                      >
                        <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-[80%] h-7 mx-auto mb-1"></p>
                      </td>

                      {/* user */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",

                          height: "40px",
                        }}
                      >
                        <div>
                          <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-12 h-4 mx-auto mb-1"></p>
                          <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-[50%] h-4 mx-auto mb-1"></p>
                        </div>
                      </td>

                      {/* action */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div>
                          <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-6 mx-auto mb-1"></p>
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default HistoryLoadingSkeleton;