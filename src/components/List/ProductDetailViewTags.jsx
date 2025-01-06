import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = "http://192.168.0.102:3000";

const ProductDetailViewTags = ({ tags, sku }) => {
  const handleCancelTag = async (tag) => {
    try {
      const url = `${BASE_URL}/api/product/tag/${sku}/cancel`;

      const response = await axios.put(url, {
        tag: tag.tag,
        colorCode: tag.colorCode,
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Removed!",
          text: `Tag "${tag.tag}" removed successfully!`,
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: `Failed to remove tag "${tag.tag}". Please try again.`,
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error canceling tag:", error.message);

      Swal.fire({
        title: "Error!",
        text: "An error occurred. Please try again.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
      {tags?.map((tag, index) => (
        <div
          key={index}
          className="rounded-full px-1 py-1 text-xs text-center"
          style={{
            backgroundColor: tag.colorCode,
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: "16px",
          }}
        >
          {tag.tag}
          {/* Cross Icon */}
          <span
            onClick={() => handleCancelTag(tag)}
            style={{
              marginLeft: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "white",
            }}
          >
            ✕
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProductDetailViewTags;
