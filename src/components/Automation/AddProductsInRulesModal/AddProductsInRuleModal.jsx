import { Button, Modal } from "react-bootstrap";
import "./AddProductsInRuleModal.css";
import { MdOutlineClose } from "react-icons/md";
import { Checkbox, Input } from "antd";
import { IoIosSearch } from "react-icons/io";
import { ClipLoader } from "react-spinners";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button as ShadCdnButton } from "@/components/ui/button";

const BASE_URL = "http://192.168.0.109:3000";
// const BASE_URL = `https://api.priceobo.com`;

const AddProductsInRuleModal = ({
  addProductsInRuleModalOpen,
  handleAddProductsInRuleModalClose,
}) => {
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [searchingError, setSearchingError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);

  // Ref for debounce timer
  const debounceTimer = useRef(null);

  const fetchProducts = async (query) => {
    if (!query) {
      setSearchedProducts([]);
      return;
    }
    setLoading(true);
    setSearchingError("");
    try {
      const response = await axios.get(`${BASE_URL}/api/product/${query}`);
      console.log(response.data.data.listings);
      setSearchedProducts(response.data.data.listings);
      setLoading(false);
    } catch (err) {
      setSearchingError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchProducts(value);
    }, 300);
  };

  const handleAddSelectedProducts = (products) => {
    selectedProducts(products);
    handleAddProductsInRuleModalClose();
    setSelectedProducts([]);
    setSearchedProducts("");
  };

  const handleAddButtonClick = () => {
    handleAddSelectedProducts(selectedProducts);
  };

  const handleCheckboxChange = (product, checked) => {
    console.log("product", product);
    console.log("checked", checked);
    if (checked) {
      setSelectedProducts((prevSelectedProducts) => [
        ...prevSelectedProducts,
        product,
      ]);
    } else {
      setSelectedProducts((prevSelectedProducts) =>
        prevSelectedProducts.filter(
          (item) => item.sellerSku !== product.sellerSku
        )
      );
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div>
      <Modal
        show={addProductsInRuleModalOpen}
        onHide={handleAddProductsInRuleModalClose}
        dialogClassName="add-products-rule-modal"
      >
        <Modal.Body>
          <div>
            <h2 className="text-center text-xl font-semibold">Add Products</h2>
          </div>
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleAddProductsInRuleModalClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>

          {/* Search Input */}
          <div className="mt-2">
            <Input
              placeholder="Search Products by Asin/Sku"
              prefix={<IoIosSearch />}
              onChange={(e) => handleSearch(e.target.value)}
              className=""
            />
          </div>

          {loading && (
            <p className="mt-4 text-center">
              {" "}
              <ClipLoader
                color="#0E6FFD"
                loading={true}
                cssOverride={{
                  margin: "0 auto",
                  borderWidth: "3px",
                }}
                size={40}
                // thickness={5}
                width={100}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </p>
          )}

          {searchingError && (
            <p className="mt-2 text-red-500 text-center">{searchingError}</p>
          )}

          {!loading && (
            <div className="mt-4 h-[45vh] overflow-y-auto">
              {searchedProducts.length > 0 ? (
                <div className="space-y-3">
                  {searchedProducts.map((product, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          onChange={(e) =>
                            handleCheckboxChange(product, e.target.checked)
                          }
                          checked={selectedProducts.some(
                            (selectedProduct) =>
                              selectedProduct.sellerSku === product.sellerSku
                          )}
                        ></Checkbox>
                        <img
                          src={product.imageUrl}
                          className="w-[30px] h-[40px] object-cover"
                          alt="product_image"
                        />
                        <div className="space-y-1">
                          <h3 title={product.itemName}>
                            {product.itemName.split(" ").length > 10
                              ? product.itemName
                                  .split(" ")
                                  .slice(0, 10)
                                  .join(" ") + "..."
                              : product.itemName}
                          </h3>

                          <div className="flex gap-2">
                            <span className="px-2 py-1 border text-xs">
                              {product.asin1}
                            </span>
                            <span className="px-2 py-1 border text-xs">
                              {product.sellerSku}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !loading &&
                !searchingError && (
                  <p className="mt-2 text-center">No products found.</p>
                )
              )}
            </div>
          )}
        </Modal.Body>
        <div className="  bg-white shadow-sm px-3 py-2 border-t-[1px] ">
          <section className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium">
                {selectedProducts.length} Products Selected
              </h3>{" "}
            </div>
            <div className="flex gap-2">
              <ShadCdnButton
                onClick={handleAddProductsInRuleModalClose}
                variant="outline"
                className="text-sm flex items-center gap-1 mt-2"
                style={{
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "",
                  borderRadius: "3px",
                }}
              >
                Cancel
              </ShadCdnButton>
              <Button
                onClick={handleAddButtonClick}
                className="text-sm flex items-center gap-1 mt-2"
                style={{
                  padding: "8px 25px",
                  border: "none",
                  backgroundColor: "#0662BB",
                  borderRadius: "3px",
                }}
                disabled={selectedProducts.length === 0}
              >
                Add
              </Button>
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
};

export default AddProductsInRuleModal;
