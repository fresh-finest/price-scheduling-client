import { DatePicker, Space } from "antd";

const SaleDetailsProductDetailSkeleton = () => {
  return (
    <div className="flex max-w-[50%]  px-2 py-2 rounded  mt-[-8px] gap-2 ">
      {/* <img
        className="object-cover"
        width="70px"
        height="40px"
        alt="product image"
      /> */}
      <div className="bg-gray-800/20 animate-pulse w-[60px] h-[70px] "></div>
      <div className="w-full">
        <h3 className="bg-gray-800/20 animate-pulse w-[100%] h-4"></h3>
        <h3 className="bg-gray-800/20 animate-pulse w-[80%] h-4 mt-1"></h3>
        <div className="flex items-center justify-start  gap-1 mt-1">
          <p className="w-[6%] h-7 bg-gray-800/20 animate-pulse "></p>
          <p className="w-[10%] h-7 bg-gray-800/20 animate-pulse "></p>
          <p className="w-[10%] h-7 bg-gray-800/20 animate-pulse "></p>
        </div>
      </div>

      <div className="absolute top-[10px]  right-[17%]">
        <div className="w-40 h-9 bg-gray-800/20 animate-pulse"></div>
      </div>
    </div>
  );
};

export default SaleDetailsProductDetailSkeleton;