import React from "react";
import { Card } from "react-bootstrap";
const ProductDetailLoadingSkeleton = () => {
  const detailStyles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    image: {
      width: "50px",
      maxHeight: "50px",
      objectFit: "contain",
      marginRight: "20px",
    },
    card: {
      // padding: "20px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      height: "91.2vh",
      width: "100%",
      borderRadius: "5px",
    },
    title: {
      fontSize: "14px",
      textAlign: "left",
      fontWeight: "normal",
    },
    info: {
      fontSize: "14px",
      marginBottom: "5px",
      marginLeft: "10px",
    },
    tableContainer: {
      marginTop: "20px",
      width: "100%",
      maxHeight: "420px", // Set a max height for the table container
      // overflowY: "scroll", // Enable vertical scrolling
      overflowX: "hidden",
      padding: "20px",
    },
    table: {
      width: "100%",
      marginBottom: 0,
    },
  };

  return (
    <Card style={detailStyles.card} className=" p-0">
      {
        <Card.Body className="p-0">
          <div>
            <div className="border-b-2 mb-2 py-[8px] ">
              <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
            </div>

            {/* product image and details with asin numbers */}

            <section>
              <div className="px-2.5 pt-1 pb-2 flex gap-2">
                <div
                  className="bg-gray-800/20 animate-pulse"
                  style={{
                    height: "50px",
                    width: "50px",
                  }}
                />
                <div className=" w-full space-y-1">
                  <p className=" bg-gray-800/20 animate-pulse w-[90%] h-3 "></p>
                  <p className=" bg-gray-800/20 animate-pulse w-[95%] h-3 "></p>
                  <p className=" bg-gray-800/20 animate-pulse w-[88%] h-3 "></p>
                </div>
              </div>
              <div className="grid grid-cols-[60px_auto_auto_auto]   mx-[10px] gap-2 ">
                <div
                  style={{ borderRadius: "3px", height: "30px" }}
                  className="row-span-2 bg-gray-800/20 animate-pulse flex justify-center items-center  "
                ></div>

                <div>
                  <span
                    className="bg-gray-800/20 animate-pulse flex justify-around items-center  px-[7px] py-[5px] "
                    style={{
                      cursor: "pointer",
                      height: "30px",
                    }}
                  ></span>
                </div>
                <div>
                  <span
                    className="bg-gray-800/20 animate-pulse flex justify-around items-center  px-[7px] py-[5px] "
                    style={{
                      cursor: "pointer",
                      height: "30px",
                    }}
                  ></span>
                </div>
                <div>
                  <span
                    className="bg-gray-800/20 animate-pulse flex justify-around items-center px-[7px] py-[5px] "
                    style={{
                      cursor: "pointer",
                      height: "30px",
                    }}
                  ></span>
                </div>
                <div className="text-left text-[#505050]">
                  {/* <p className="flex justify-center items-center  gap-2 text-xs">
                    N/A
                  
                  </p> */}
                  <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
                </div>
                <div className="text-center text-xs text-[#505050]">
                  {/* <p className="flex justify-center items-center gap-2 text-xs">
                    wirehouse
                  </p> */}
                  <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
                </div>
                <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-20 h-4 mx-auto"></p>
              </div>
            </section>

            <hr style={{ width: "90%", margin: "0 auto", marginTop: "10px" }} />

            <div className="my-3 mx-[35px]  ">
              {/* <DetailedCalendarView sku1={sku1} /> */}

              <div className="bg-gray-800/20 animate-pulse w-full h-56 rounded-md"></div>
            </div>
            {/* tabs  */}

            <div className="px-2 py-1 m-2 ">
              <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-full h-10 mx-auto rounded-md mb-2"></p>
              <p className="flex  items-center justify-center  bg-gray-800/20 animate-pulse w-full h-16 mx-auto rounded-md"></p>
            </div>
          </div>
        </Card.Body>
      }
    </Card>
  );
};

export default ProductDetailLoadingSkeleton;