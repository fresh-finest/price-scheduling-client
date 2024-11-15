const UpdatePriceFromListSkeleton = () => {
    return (
      <>
        {/* header */}
        <div>
          <div className={`flex justify-start  mx-[10px] pt-3 pb-4 px-3 `}>
            <div
              //   src={product?.AttributeSets[0]?.SmallImage?.URL}
              className="w-[140px] h-[130px] bg-gray-800/10 animate-pulse  mr-[20px]"
  
              // style={detailStyles.image}
            />
            <div className="min-w-[88%]">
              <h1 className="bg-gray-800/10 animate-pulse w-[100%] h-4 "></h1>
              <h1 className="bg-gray-800/10 animate-pulse w-[50%] h-4 mt-2 "></h1>
  
              <div className="flex   gap-2 mt-2 ">
                <div className="flex   gap-2">
                  <div
                    style={{
                      borderRadius: "3px",
                      verticalAlign: "bottom",
                      width: "55px",
                      height: "56px",
                    }}
                    className=" bg-gray-800/10 animate-pulse "
                  >
                    {/* <h2 style={{ fontSize: "13px" }}>price</h2> */}
                  </div>
  
                  <div className="flex flex-col  items-start gap-2">
                    <p className="bg-gray-800/10 animate-pulse w-14 h-4"></p>
  
                    <p className="bg-gray-800/10 animate-pulse w-28 h-7"></p>
                  </div>
  
                  <div className="flex flex-col gap-2">
                    <p className="bg-gray-800/10 animate-pulse w-14 h-4"></p>
  
                    <p className="bg-gray-800/10 animate-pulse w-28 h-7"></p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="bg-gray-800/10 animate-pulse w-14 h-4"></p>
  
                    <p className="bg-gray-800/10 animate-pulse w-28 h-7"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="">
          <div>
            <div className="bg-gray-800/10 animate-pulse w-[96%] mx-auto h-10 rounded-md"></div>
  
            <div className="w-[53%] mx-auto ">
              <div className="bg-gray-800/10 animate-pulse  h-44 rounded-sm mt-4"></div>
  
              <div className="bg-gray-800/10 animate-pulse ml-[3.5%] w-[30%]  h-11 rounded-sm mt-3"></div>
            </div>
  
            <div
              className="bg-gray-800/10 animate-pulse w-[20%] h-[6%] rounded-sm"
              style={{
                width: "20%",
  
                margin: "0 auto",
                display: "block",
                position: "absolute",
                bottom: 22,
                right: 30,
              }}
              type="submit"
            ></div>
          </div>
        </div>
      </>
    );
  };
  
  export default UpdatePriceFromListSkeleton;