import { BsClipboardCheck } from "react-icons/bs";
import { FaArrowUp, FaRegStar, FaStar } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";
import { MdCheck } from "react-icons/md";

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
  handleSaleDetailsModalShow,
}) => {
  return (
    <tr className="hover:cursor-pointer">
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
            src={product.imageUrl || "https://via.placeholder.com/50"}
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
        }}
      >
        {product.itemName || "Unknown Product"}

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
          {`${percentageChange}%`}
          {percentageChange !== 0 && percentageChange !== "0.00" && (
            <span>
              {percentageChange > 0 ? <FaArrowUp /> : <FaArrowDownLong />}
            </span>
          )}
        </div>
      </td>
      {/* <td
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          height: "40px",
          textAlign: "center",
          verticalAlign: "middle",
          color:
            percentageChange > 0
              ? "green"
              : percentageChange < 0
              ? "red"
              : "black",
        }}
      >
        <button
          onClick={() => handleSaleDetailsModalShow(product.sellerSku)}
          className="bg-[#0662BB] text-white rounded drop-shadow-sm  gap-1  px-2 py-1"
        >
          See Details
        </button>
      </td> */}
    </tr>
  );
};

export default SaleReportTableRow;
