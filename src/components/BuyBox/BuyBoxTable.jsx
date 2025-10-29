import React, { useState } from "react";
import { BsClipboardCheck } from "react-icons/bs";
import { MdCheck } from "react-icons/md";

const yesImg =
  "https://cdn.shopify.com/s/files/1/0861/1106/0252/files/Tik.webp?v=1761140163";
const noImg =
  "https://cdn.shopify.com/s/files/1/0861/1106/0252/files/X.webp?v=1761139490";

// ✅ Min price finder
function minPrice(arr = []) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const nums = arr
    .map((x) => (x?.listingPrice != null ? Number(x.listingPrice) : NaN))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return Math.min(...nums);
}

// ✅ Buy Box status checker
function anyBuyBox(arr = []) {
  return Array.isArray(arr) && arr.some((x) => x?.IsBuyBox === true);
}

const BuyBoxTable = ({ rows }) => {
  // copy feedback state (store row id of last-copied asin/sku)
  const [copiedAsinId, setCopiedAsinId] = useState(null);
  const [copiedSkuId, setCopiedSkuId] = useState(null);

  const handleCopy = (e, text, type, id) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "asin") {
          setCopiedAsinId(id);
          setTimeout(() => setCopiedAsinId(null), 2000);
        } else {
          setCopiedSkuId(id);
          setTimeout(() => setCopiedSkuId(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <tbody style={{ fontSize: 12, fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      {rows.map((r) => {
        const hasFresh = Array.isArray(r.fresFinest) && r.fresFinest.length > 0;
        const hasOther = Array.isArray(r.otherSeller) && r.otherSeller.length > 0;

        const freshMin = hasFresh ? minPrice(r.fresFinest) : null;
        const otherMin = hasOther ? minPrice(r.otherSeller) : null;

        const freshHasBB = hasFresh ? anyBuyBox(r.fresFinest) : false;
        const otherHasBB = hasOther ? anyBuyBox(r.otherSeller) : false;

        return (
          <tr key={r._id}>
            {/* Product Image */}
            <td style={{ height: 60, textAlign: "center", verticalAlign: "middle" }}>
              {r.image ? (
                <img
                  src={r.image}
                  alt={r.title || r.sku}
                  style={{
                    width: 50,
                    height: 50,
                    margin: "0 auto",
                    objectFit: "contain",
                  }}
                />
              ) : (
                ""
              )}
            </td>

            {/* Product Title + ASIN + SKU (with copy) */}
            <td style={{ verticalAlign: "middle" }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={r.title}
              >
                {r.title || "—"}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* ASIN bubble */}
                <span className="bubble-text" style={{ display: "inline-flex", alignItems: "center" }}>
                  {r.asin || "—"}
                  {r.asin ? (
                    copiedAsinId === r._id ? (
                      <MdCheck
                        style={{ marginLeft: 8, color: "green", fontSize: 16, cursor: "default" }}
                        aria-label="ASIN copied"
                        title="Copied!"
                      />
                    ) : (
                      <BsClipboardCheck
                        onClick={(e) => handleCopy(e, r.asin, "asin", r._id)}
                        style={{ marginLeft: 8, fontSize: 16, cursor: "pointer" }}
                        aria-label="Copy ASIN"
                        title="Copy ASIN"
                      />
                    )
                  ) : null}
                </span>

                {/* SKU bubble */}
                <span className="bubble-text" style={{ display: "inline-flex", alignItems: "center" }}>
                  {r.sku || "—"}
                  {r.sku ? (
                    copiedSkuId === r._id ? (
                      <MdCheck
                        style={{ marginLeft: 8, color: "green", fontSize: 16, cursor: "default" }}
                        aria-label="SKU copied"
                        title="Copied!"
                      />
                    ) : (
                      <BsClipboardCheck
                        onClick={(e) => handleCopy(e, r.sku, "sku", r._id)}
                        style={{ marginLeft: 8, fontSize: 16, cursor: "pointer" }}
                        aria-label="Copy SKU"
                        title="Copy SKU"
                      />
                    )
                  ) : null}
                </span>
              </div>
            </td>

            {/* Landed Price */}
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                fontWeight: 600,
              }}
            >
              {r.landedPrice ? `$${Number(r.landedPrice).toFixed(2)}` : ""}
            </td>

            {/* Fresh Column */}
            <td style={{ textAlign: "center", verticalAlign: "middle" }}>
              {hasFresh ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <img
                      src={freshHasBB ? yesImg : noImg}
                      alt={freshHasBB ? "BuyBox True" : "BuyBox False"}
                      style={{ width: 25, height: 25, objectFit: "contain" }}
                    />
                    <span style={{ fontSize: 12 }}>Buy Box</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {freshMin != null ? `$${freshMin.toFixed(2)}` : "—"}
                  </div>
                </>
              ) : (
                ""
              )}
            </td>

            {/* Other Column */}
            <td style={{ textAlign: "center", verticalAlign: "middle" }}>
              {hasOther ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <img
                      src={otherHasBB ? yesImg : noImg}
                      alt={otherHasBB ? "BuyBox True" : "BuyBox False"}
                      style={{ width: 25, height: 25, objectFit: "contain" }}
                    />
                    <span style={{ fontSize: 12 }}>Buy Box</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {otherMin != null ? `$${otherMin.toFixed(2)}` : "—"}
                  </div>
                </>
              ) : (
                ""
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default BuyBoxTable;
