import React, { useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { BsClipboardCheck, BsHeart, BsHeartFill } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IoMdAdd, IoMdCheckmark } from "react-icons/io";
import { MdCheck } from "react-icons/md";

const BASE_URL = `http://192.168.0.8:3000`;
// const BASE_URL = `https://api.priceobo.com`;

const ListViewTable = ({
  index,
  itemRefs,
  handleProductSelect,
  item,
  selectedRowIndex,
  noImage,
  handleCopy,
  copiedSkuIndex,
  copiedAsinIndex,
  copiedfnSkuIndex,
  handleUpdate,
  currentUser,
  selectedTimePeriod,
  getUnitCountForTimePeriod,
  selectedDay,
}) => {

  const getUnitsForSelectedTime = (salesMetrics, selectedDay) => {
    const metric = salesMetrics.find((m) => m.time === selectedDay.value);
    return metric ? metric.totalUnits : "N/A";
  };

  const [isFavorite, setIsFavorite] = useState(item.isFavourite); // Local state to manage favorite status

  const toggleFavorite = async (sku, currentFavoriteStatus) => {
    setIsFavorite(!currentFavoriteStatus);

    try {
      await axios.put(`${BASE_URL}/api/product/favourite/${sku}`, {
        isFavourite: !currentFavoriteStatus,
      });
    } catch (error) {
      console.error("Error updating favorite status:", error.message);
      // Revert the UI if the API call fails
      setIsFavorite(currentFavoriteStatus);
    }
  };

  return (
    <tr
      key={index}
      ref={(el) => (itemRefs.current[index] = el)} // Store reference to each row element
      onClick={() =>
        handleProductSelect(
          item?.price,
          item.sellerSku,
          item.asin1,
          item.fnSku,
          index,
          item.fulfillmentChannel,
          item.quantity,
          item.fulfillableQuantity,
          item.pendingTransshipmentQuantity,
          item
        )
      }
      style={{
        cursor: "pointer",
        height: "40px",
        margin: "20px 0",
      }}
      className={`borderless spacer-row ${
        selectedRowIndex === index ? "selected-row" : ""
      }`}
    >
      <td
        style={{
          cursor: "pointer",

          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
          display: "flex", // Enable flexbox
          alignItems: "center", // Vertically center
          justifyContent: "center", // Horizontally center
          border: "none", // Remove the border from the cell
          padding: "0", // Remove padding from the cell
          height: "85px",
        }}
      >
        <span
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.sellerSku, isFavorite);
          }}
          style={{
            textAlign: "center",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            transform: isFavorite ? "scale(1.1)" : "scale(1)",
          }}
        >
       {/* "#879618a3" */}
          {isFavorite ? (
            <FaStar style={{ color:"#879618a3", fontSize: "20px" }} />
          ) : (
            <FaRegStar style={{ color: "gray", fontSize: "16px" }} />
          )}
        </span>
      </td>

      <td
        className={` ${selectedRowIndex === index ? "selected-row" : ""}`}
        style={{
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        {/* {item.status} */}

        <div>{item.status}</div>
      </td>

      <td
        className={` ${selectedRowIndex === index ? "selected-row" : ""}`}
        style={{
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
       

        <div className=" flex justify-center items-center">
          <div className="flex flex-col justify-center items-center gap-1">
            {item.buybox ? <img className="w-[25px] h-[25px] object-contain" src="https://cdn.shopify.com/s/files/1/0861/1106/0252/files/Tik.webp?v=1761140163" alt="right" />: <img className="w-[25px] h-[25px] object-contain" src="https://cdn.shopify.com/s/files/1/0861/1106/0252/files/X.webp?v=1761139490" alt="wrong" /> }

          { item?.offerPrice ?<h4> ${item?.offerPrice}</h4> : <h4> ${item?.price}</h4> }
          </div>
        </div>
      </td>

      <td
        style={{
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        <img
          style={{
            height: "50px",
            width: "50px",
            margin: "0 auto",
            objectFit: "contain",
          }}
          src={item?.imageUrl ? item.imageUrl : noImage}
          alt=""
        />
      </td>

      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        {item.itemName}
        <div className="details mt-[5px]">
          <span
            className="bubble-text"
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "stretch",
            }}
          >
            {item.asin1}{" "}
            {copiedAsinIndex === index ? (
              <MdCheck
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  color: "green",
                  fontSize: "16px",
                }}
              />
            ) : (
              <BsClipboardCheck
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.asin1, "asin", index);
                }}
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              />
            )}
          </span>{" "}
          <span
            className="bubble-text"
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {item.sellerSku}{" "}
            {copiedSkuIndex === index ? (
              <MdCheck
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  color: "green",
                  fontSize: "16px",
                }}
              />
            ) : (
              <BsClipboardCheck
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.sellerSku, "sku", index);
                }}
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              />
            )}
          </span>{" "}
          {/* <span
            className="bubble-text"
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {item?.fnSku ? item.fnSku : "N/A"}{" "}
            {item?.fnSku &&
              (copiedfnSkuIndex === index ? (
                <MdCheck
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    color: "green",
                    fontSize: "16px",
                  }}
                />
              ) : (
                <BsClipboardCheck
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item?.fnSku, "fnSku", index);
                  }}
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                />
              ))}
          </span> */}
        </div>
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        ${parseFloat(item?.price).toFixed(2)}
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        {item.fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA"}
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        {item.tags && item.tags.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: "5px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {item?.tags?.slice(0, 2)?.map((tag, tagIndex) => (
              <span
                className="text-xs rounded-full"
                key={tagIndex}
                style={{
                  padding: "2px 6px",
                  backgroundColor: tag?.colorCode,

                  color: "white",
                }}
              >
                {tag?.tag}
              </span>
            ))}
          </div>
        ) : (
          " "
        )}
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        <span>
          {item.fulfillmentChannel === "DEFAULT"
            ? item?.quantity != null
              ? item.quantity
              : "N/A"
            : item?.fulfillableQuantity != null &&
              item?.pendingTransshipmentQuantity != null
            ? item?.fulfillableQuantity + item?.pendingTransshipmentQuantity
            : "N/A"}
        </span>
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center",
          verticalAlign: "middle",
          cursor: "pointer",
          height: "40px",
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
        }}
      >
        {item.salesMetrics
          ? getUnitsForSelectedTime(item.salesMetrics, selectedDay)
          : "N/A"}
      </td>
      <td
        style={{
          backgroundColor: selectedRowIndex === index ? "#F1F1F2" : "",
          textAlign: "center",
          verticalAlign: "middle",
        }}
      >
        <Button
          className="updatePriceBtn"
          style={{
            padding: "8px 12px",
            border: "none",
            backgroundColor: "#0662BB",
            borderRadius: "3px",
            zIndex: 1,
          }}
          onClick={(e) =>
            handleUpdate(
              item?.price,
              item?.sellerSku,
              item?.asin1,
              item?.fnSku,
              item?.fulfillmentChannel,
              item?.quantity,
              item?.fulfillableQuantity,
              item?.pendingTransshipmentQuantity,
              index,
              e
            )
          }
          disabled={!currentUser?.permissions?.write}
        >
          <IoMdAdd />
        </Button>
      </td>
    </tr>
  );
};

export default ListViewTable;
