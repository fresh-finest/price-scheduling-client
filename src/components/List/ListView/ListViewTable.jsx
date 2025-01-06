import React from "react";
import { Button } from "react-bootstrap";
import { BsClipboardCheck } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { MdCheck } from "react-icons/md";

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

  console.log("item", item);

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
          <span
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
          </span>
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
            {item.tags.map((tag, tagIndex) => (
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
