import { useState } from "react";
import { Card } from "react-bootstrap";
import { BsClipboardCheck } from "react-icons/bs";
import { FaRankingStar } from "react-icons/fa6";
import { MdCheck } from "react-icons/md";
import { PiWarehouse } from "react-icons/pi";

const ProductDetailsWithNumbers = ({
  product,
  channelStockValue,
  fulfillmentChannel,
  price,
  asin,
  sku1,
  fnSku,
  updatePriceModal,
}) => {
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [copiedfnSkuIndex, setCopiedfnSkuIndex] = useState(null);

  const handleCopy = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "asin") {
          setCopiedAsinIndex(text);
          setTimeout(() => setCopiedAsinIndex(null), 2000);
        } else if (type === "sku") {
          setCopiedSkuIndex(text);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        } else {
          setCopiedfnSkuIndex(text);
          setTimeout(() => setCopiedfnSkuIndex(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div>
      <div
        className={`flex justify-start  mx-[10px] ${
          updatePriceModal ? "pt-2 px-1" : "p-1"
        }`}
        // style={{
        //   display: "flex",
        //   alignItems: "start",
        //   margin: "0 10px",
        // }}
      >
        <Card.Img
          variant="top"
          // src={product?.AttributeSets[0]?.SmallImage?.URL}
          src={
            product?.AttributeSets?.[0]?.SmallImage?.URL ||
            "https://beautyrepublicfdl.com/wp-content/uploads/2020/06/placeholder-image-600x450.jpg" // Provide a fallback if the URL is not available
          }
          className={`${
            updatePriceModal
              ? "max-w-[120px] max-h-[120px] object-fill"
              : "max-w-[50px] max-h-[50px]  object-fit"
          }  mr-[20px]`}
          // style={detailStyles.image}
        />
        <div className={`${updatePriceModal ? "min-w-[90%]" : "min-w-[85%]"}`}>
          <Card.Title
            className={`${
              updatePriceModal ? "text-[16px]" : "text-[14px]"
            }  text-left font-normal`}
          >
            {product?.AttributeSets?.[0]?.Title || product?.itemName}
          </Card.Title>
          {updatePriceModal && (
            <div className="flex   gap-2 mt-2 ">
              <div className="flex   gap-2">
                <div
                  style={{
                    borderRadius: "3px",
                    height: "",
                    verticalAlign: "bottom",
                    width: "50px",
                  }}
                  className=" bg-blue-500 text-white flex justify-center items-center "
                >
                  <h2 style={{ fontSize: "13px" }}>
                    ${parseFloat(price).toFixed(2)}
                  </h2>
                </div>

                <div className="flex flex-col  items-start gap-2">
                  <div>
                    <div className="text-left text-[#505050]">
                      <p className="flex justify-center items-center  gap-2 text-xs">
                        <FaRankingStar style={{ fontSize: "16px" }} />{" "}
                        {product?.SalesRankings?.[0]?.Rank
                          ? "#" +
                            new Intl.NumberFormat().format(
                              product.SalesRankings[0].Rank
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span
                    className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
                    style={{
                      cursor: "pointer",
                      // display: "inline-flex",
                      // alignItems: "stretch",
                    }}
                  >
                    {asin}{" "}
                    {copiedAsinIndex ? (
                      <MdCheck
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          color: "green",
                        }}
                      />
                    ) : (
                      <BsClipboardCheck
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(asin, "asin");
                        }}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      />
                    )}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="  text-xs text-[#505050]">
                    <p className="flex justify-start items-center gap-2 text-xs">
                      {" "}
                      <PiWarehouse style={{ fontSize: "16px" }} />
                      {new Intl.NumberFormat().format(channelStockValue)}
                    </p>
                  </div>

                  <span
                    className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
                    style={{
                      cursor: "pointer",
                      // display: "inline-flex",
                      // alignItems: "stretch",
                    }}
                  >
                    {sku1}{" "}
                    {copiedSkuIndex ? (
                      <MdCheck
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          color: "green",
                        }}
                      />
                    ) : (
                      <BsClipboardCheck
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(sku1, "sku");
                        }}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      />
                    )}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div>
                    <div className="text-start text-xs text-[#505050]">
                      <span>
                        {fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA"}
                      </span>
                    </div>
                  </div>
                  <span
                    className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
                    style={{
                      cursor: "pointer",
                      // display: "inline-flex",
                      // alignItems: "stretch",
                    }}
                  >
                    {fnSku}{" "}
                    {copiedfnSkuIndex ? (
                      <MdCheck
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          color: "green",
                        }}
                      />
                    ) : (
                      <BsClipboardCheck
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(fnSku, "fnSku");
                        }}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      />
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!updatePriceModal && (
        <div className="grid grid-cols-[60px_auto_auto_auto]   mx-[10px] gap-2 ">
          <div
            style={{ borderRadius: "3px", height: "30px" }}
            className="row-span-2 bg-blue-500 text-white flex justify-center items-center  "
          >
            <h2 style={{ fontSize: "13px" }}>
              ${parseFloat(price).toFixed(2)}
            </h2>
          </div>

          <div>
            <span
              className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
              style={{
                cursor: "pointer",
                // display: "inline-flex",
                // alignItems: "stretch",
              }}
            >
              {asin}{" "}
              {copiedAsinIndex ? (
                <MdCheck
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    color: "green",
                  }}
                />
              ) : (
                <BsClipboardCheck
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(asin, "asin");
                  }}
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                />
              )}
            </span>
          </div>
          <div>
            <span
              className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
              style={{
                cursor: "pointer",
                // display: "inline-flex",
                // alignItems: "stretch",
              }}
            >
              {sku1}{" "}
              {copiedSkuIndex ? (
                <MdCheck
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    color: "green",
                  }}
                />
              ) : (
                <BsClipboardCheck
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(sku1, "sku");
                  }}
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                />
              )}
            </span>
          </div>
          <div>
            <span
              className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
              style={{
                cursor: "pointer",
                // display: "inline-flex",
                // alignItems: "stretch",
              }}
            >
              {fnSku}{" "}
              {copiedfnSkuIndex ? (
                <MdCheck
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    color: "green",
                  }}
                />
              ) : (
                <BsClipboardCheck
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(fnSku, "fnSku");
                  }}
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                />
              )}
            </span>
          </div>
          <div className="text-left text-[#505050]">
            <p className="flex justify-center items-center  gap-2 text-xs">
              <FaRankingStar style={{ fontSize: "16px" }} />{" "}
              {product?.SalesRankings?.[0]?.Rank
                ? "#" +
                  new Intl.NumberFormat().format(product.SalesRankings[0].Rank)
                : "N/A"}
            </p>
          </div>
          <div className="text-center text-xs text-[#505050]">
            <p className="flex justify-center items-center gap-2 text-xs">
              {" "}
              <PiWarehouse style={{ fontSize: "16px" }} />
              {new Intl.NumberFormat().format(channelStockValue)}
            </p>
          </div>
          <div className="text-center text-xs text-[#505050]">
            <span>{fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsWithNumbers;