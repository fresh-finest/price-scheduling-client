import { useState } from "react";

const ListLoadingSkeleton = () => {
  const [columnWidths, setColumnWidths] = useState([
    80, 80, 350, 80, 90, 110, 90, 90,
  ]);
  return (
    <>
      <div>
        <div className="relative ">
          <div className="min-w-[500px] absolute top-[-7px] mb-3 bg-gray-800/20 h-10 animate-pulse"></div>
        </div>

        <div
          className="bg-gray-800/20 h-10 animate-pulse w-20"
          style={{
            borderRadius: "2px",

            border: "none",
            position: "absolute ",
            top: "10px",
            right: "545px",
          }}
        ></div>
      </div>

      <section style={{ display: "flex", gap: "10px" }}>
        <div style={{ paddingRight: "3px", width: "70%" }}>
          <div
            className=" rounded-md  bg-gray-800/10 "
            style={{
              overflowY: "auto",
              marginTop: "50px",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              maxHeight: "91vh",
            }}
          >
            <table
              style={{ width: "100%", tableLayout: "fixed" }}
              className="listCustomTable  table "
            >
              <thead
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "13px",

                  top: 0,
                }}
              >
                <tr className="">
                  <th
                    className=""
                    style={{
                      width: `${columnWidths[0]}px`,
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
                  </th>
                  <th
                    className=""
                    style={{
                      width: `${columnWidths[1]}px`,
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
                  </th>

                  <th
                    style={{
                      width: `${columnWidths[2]}px`,
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
                  </th>
                  <th
                    style={{
                      width: `${columnWidths[3]}px`,
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                  </th>
                  <th
                    style={{
                      width: `${columnWidths[4]}px`,
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                  </th>
                  <th
                    style={{
                      width: `${columnWidths[5]}px`,

                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                  </th>
                  <th
                    style={{
                      width: `${columnWidths[6]}px`,
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                    <div
                      style={{
                        position: "relative",
                        float: "right",
                        marginRight: "10px",
                      }}
                    ></div>
                  </th>
                  <th
                    style={{
                      width: `${columnWidths[7]}px`,
                      position: "relative",
                      textAlign: "center",
                    }}
                  >
                    <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
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
                {Array(10)
                  .fill(null)
                  .map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        height: "40px",
                        margin: "20px 0",
                      }}
                      className={`borderless spacer-row `}
                    >
                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-14 h-4 mx-auto"></p>
                      </td>
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
                          alt=""
                        />
                      </td>

                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <p className="flex  items-start justify-start   bg-gray-800/20 animate-pulse w-full h-4 mx-auto"></p>
                        <div className="flex  justify-start items-start gap-2 mt-[5px]">
                          <p className="bg-gray-800/20 animate-pulse w-16 h-5 "></p>{" "}
                          <p className="bg-gray-800/20 animate-pulse w-16 h-5 "></p>{" "}
                          <p className="bg-gray-800/20 animate-pulse w-16 h-5 "></p>{" "}
                        </div>
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",

                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",

                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",

                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                      </td>
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
                        <p className="flex  items-center justify-center   bg-gray-800/20 animate-pulse w-12 h-4 mx-auto"></p>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          className=" bg-gray-800/20 animate-pulse w-10 h-10 mx-auto"
                          style={{
                            // padding: "8px 12px",
                            border: "none",
                            borderRadius: "3px",
                            zIndex: 1,
                          }}
                        ></div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          // className="fixed"
          style={{
            paddingLeft: "0px",
            marginTop: "20px",
            paddingRight: "0px",
            width: "32%",
            // position: "fixed",
            // top: "20px",
            // right: "10px",
            height: "93vh ",
            // overflowX: "auto",
          }}
        >
          {
            <div
              style={{
                paddingTop: "30px",
                height: "93vh",
                display: "flex",
              }}
            >
              <div
                style={{
                  // padding: "20px",
                  width: "100%",
                  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p className="text-2xl flex  justify-center  ">
                  <div className="bg-gray-800/20 animate-pulse w-10 h-10"></div>
                </p>
                <h5 className="bg-gray-800/20 animate-pulse w-40 h-5 "></h5>
              </div>
            </div>
          }
        </div>
      </section>
    </>
  );
};

export default ListLoadingSkeleton;