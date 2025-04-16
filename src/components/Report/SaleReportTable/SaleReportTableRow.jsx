import { BsClipboardCheck } from "react-icons/bs";
import { FaArrowUp, FaRegStar, FaStar } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";
import { MdCheck } from "react-icons/md";
import NoImage from '../../../assets/images/noimage.png';
import { Tooltip } from "antd";

const SaleReportTableRow = ({
  product,
  toggleFavorite,
  index,
  handleCopy,
  copiedAsinIndex,
  copiedSkuIndex,
  currentUnits,
  previousUnits,
  percentageChange,
  handleRowClick, 
  selectedValue, 
  isAsinMode, 
  handleSaleDetailsModalShow
}) => {

  const isSelected =
  selectedValue &&
  (isAsinMode
    ? product.asin1 === selectedValue
    : product.sellerSku === selectedValue);

  
    

  return (
  
  <tr onClick={() => handleRowClick(product)}   >
      <td

        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          cursor: "pointer",
          backgroundColor: isSelected ? "#F1F1F2" : "",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.sellerSku, product.isFavourite, index);
            }}
            style={{
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
              transform: product.isFavourite ? "scale(1.1)" : "scale(1)",
            }}
          >
            {product.isFavourite ? (
              <FaStar
                style={{
                  color: "#879618a3",
                  fontSize: "20px",
                }}
              />
            ) : (
              <FaRegStar style={{ color: "gray", fontSize: "16px" }} />
            )}
          </span>
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
          cursor: "pointer",
          backgroundColor: isSelected ? "#F1F1F2" : "",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <img
            src={product.imageUrl || NoImage}
            alt="Product"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "contain",
              borderRadius: "5px",
              display: "block",
              imageRendering: "auto",
            }}
          />
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
          cursor: "pointer",
          backgroundColor: isSelected ? "#F1F1F2" : "",
        }}
      >
        {/* <Tooltip placement="bottom" title={product.itemName}>
        {product.itemName || "Unknown Product"}

        </Tooltip> */}

        <Tooltip placement="bottom" title={product.itemName}>

      <span
  style={{
    display: "inline-block",
    maxWidth: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {product.itemName || "Unknown Product"}
</span>


        </Tooltip>




        <div className="details mt-[5px]">
          <span
            className="bubble-text"
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "stretch",
            }}
          >
            {product.asin1}{" "}
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
                  handleCopy(product.asin1, "asin", index);
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
            {product.sellerSku}{" "}
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
                  handleCopy(product.sellerSku, "sku", index);
                }}
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              />
            )}
          </span>{" "}
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
          cursor: "pointer",
          backgroundColor: isSelected ? "#F1F1F2" : "",
        }}
      >
        {currentUnits}
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          cursor: "pointer",
          backgroundColor: isSelected ? "#F1F1F2" : "",
        }}
      >
        {previousUnits}
      </td>
      <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          cursor: "pointer",
          backgroundColor: isSelected ? "#F1F1F2" : "",
          color:
            percentageChange > 0
              ? "green"
              : percentageChange < 0
              ? "red"
              : "black",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {`${percentageChange.toFixed(2)}%`}
          {percentageChange !== 0 && percentageChange !== "0.00" && (
            <span>
              {percentageChange > 0 ? <FaArrowUp /> : <FaArrowDownLong />}
            </span>
          )}
        </div>
      </td>
    
    
    </tr>

    
  );
};

export default SaleReportTableRow;
