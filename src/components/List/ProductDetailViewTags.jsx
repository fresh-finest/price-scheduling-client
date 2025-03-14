import axios from "axios";
import Swal from "sweetalert2";
import { IoIosCloseCircleOutline, IoMdClose } from "react-icons/io";
// const BASE_URL = "http://192.168.0.102:3000";
const BASE_URL = `https://api.priceobo.com`;

const ProductDetailViewTags = ({ tags, sku, setTagsUpdated }) => {
  const handleCancelTag = async (tag) => {
    try {
      const encodedSku = encodeURIComponent(sku);
      const url = `${BASE_URL}/api/product/tag/${encodedSku}/cancel`;

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
        setTagsUpdated(true);
      } else {
        Swal.fire({
          title: "Error!",
          text: `Failed to remove tag "${tag.tag}". Please try again.`,
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
        setTagsUpdated(false);
      }
    } catch (error) {
      console.error("Error canceling tag:", error.message);

      setTagsUpdated(false);

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
          className="rounded-full px-3 py-1 text-xs text-center relative group"
          style={{
            backgroundColor: tag.colorCode,
            color: "white",
            display: "flex",
            alignItems: "center",

            borderRadius: "16px",
          }}
        >
          {tag.tag}

          <span
            onClick={() => handleCancelTag(tag)}
            className="absolute top-0 right-1 hidden group-hover:block hover:cursor-pointer transition-opacity duration-200 text-white"
          >
            <IoIosCloseCircleOutline size={18} />
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProductDetailViewTags;
