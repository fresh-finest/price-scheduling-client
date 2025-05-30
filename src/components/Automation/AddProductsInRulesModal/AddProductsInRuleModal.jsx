import { Button, Modal } from "react-bootstrap";
import "./AddProductsInRuleModal.css";
import { MdOutlineClose } from "react-icons/md";
import { Checkbox, Input } from "antd";
import { IoIosSearch } from "react-icons/io";
import { ClipLoader } from "react-spinners";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button as ShadCdnButton } from "@/components/ui/button";
import Swal from "sweetalert2";
import { ta } from "date-fns/locale";
// import { BASE_URL } from "@/utils/baseUrl";

// const BASE_URL = `https://api.priceobo.com`;
const BASE_URL = `http://192.168.0.15:3000`;
// const BASE_URL = `http://localhost:3000`;

const AddProductsInRuleModal = ({
  addProductsInRuleModalOpen,
  setAddProductsInRuleModalOpen,
  ruleId,
  ruleType,
}) => {
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [searchingError, setSearchingError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addProductLoading, setAddProductsLoading] = useState(false);
  const [saleChecked, setSaleChecked] = useState(false);

  const [loading, setLoading] = useState(false);

  // Ref for debounce timer
  const debounceTimer = useRef(null);

  const fetchProducts = async (query) => {
    if (!query) {
      setSearchedProducts([]);
      return;
    }
    setLoading(true);
    setSearchedProducts([]);
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
  const handleAddProductsInRuleModalClose = () => {
    setAddProductsInRuleModalOpen(false);
    setSelectedProducts([]);
    setDisplayedProducts([]);
    setSearchedProducts([]);
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

  const handleAddButtonClick = async () => {
    const invalidProducts = displayedProducts.filter(
      (product) =>
        !product.maxPrice ||
        isNaN(parseFloat(product.maxPrice)) ||
        !product.minPrice ||
        isNaN(parseFloat(product.minPrice)) ||
        parseFloat(product.minPrice) > parseFloat(product.maxPrice)
    );

    if (invalidProducts.length > 0) {
      Swal.fire({
        title: "Validation Error!",
        text: "Please provide valid Max Price and Min Price for all products. Min Price cannot be greater than Max Price.",
        icon: "error",
        showConfirmButton: true,
      });
      return;
    }

    const requestBody = {
      products: displayedProducts.map((product) => ({
        sku: product.sellerSku,
        title: product.itemName,
        imageUrl: product.imageUrl,
        maxPrice: parseFloat(product.maxPrice) || product.price,
        minPrice: parseFloat(product.minPrice) || product.price,
        sale: saleChecked,
      targetQuantity:
      ["quantity-cycling", "age-by-day"].includes(ruleType)
        ? product.targetQuantity
        : null,
  })),
      hitAutoPricing: true,
    };

    console.log("Payload:", requestBody);

    try {
      setAddProductsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/automation/rules/${ruleId}/products`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      Swal.fire({
        title: "Products added successfully!",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      setAddProductsLoading(false);
      handleAddProductsInRuleModalClose();
    } catch (error) {
      console.error("API Error:", error);
      setAddProductsLoading(false);
      Swal.fire({
        title: "Something Went Wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setAddProductsLoading(false);
    }
  };

  const handleCheckboxChange = async (product, checked) => {
    if (checked) {
       const encodedSku = encodeURIComponent(product.sellerSku);
      try {
        const response = await axios.get(`${BASE_URL}/api/automation/active/${encodedSku}`);
        if (response.data.success && response.data.job) {
          const result = await axios.get(`${BASE_URL}/api/automation/rule/${response.data.job.ruleId}`);
          Swal.fire({
            title: "Already Added!",
            text: `This product is already active in automation (SKU: ${product.sellerSku} in ${result.data.rule.ruleId}.)`,
            icon: "info",
            confirmButtonText: "Okay",
          });
          return;
        }
      } catch (err) {
        // If 404 or not active, continue adding
        console.log("Product not active in any rule, proceeding...");
      }
  
      const newProduct = {
        ...product,
        maxPrice: "",
        minPrice: "",
        ...(ruleType === "quantity-cycling" && { targetQuantity: "" }),
      };
      setSelectedProducts((prev) => [...prev, newProduct]);
      setDisplayedProducts((prev) => [...prev, newProduct]);
    } else {
      setSelectedProducts((prev) =>
        prev.filter((item) => item.sellerSku !== product.sellerSku)
      );
      setDisplayedProducts((prev) =>
        prev.filter((item) => item.sellerSku !== product.sellerSku)
      );
    }
  };
  
  const handleInputChange = (sku, field, value) => {
    setDisplayedProducts((prev) =>
      prev.map((item) =>
        item.sellerSku === sku ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaleCheckboxChange = (e) => {
    setSaleChecked(e.target.checked);
  };

  const renderSelectedProducts = () => (
    <div
      className={`px-1 py-3 ${
        displayedProducts.length ? "border border-gray-300" : ""
      } h-[45vh] overflow-y-auto`}
    >
      {displayedProducts.map((product) => (
        <div
          key={product.sellerSku}
          className="flex items-center gap-4 p-2 border-b"
        >
          <img
            src={product.imageUrl}
            className="w-[40px] h-[40px] object-cover rounded"
            alt="product_image"
          />

          <div className="flex-grow">
            <h3 className="text-sm font-medium truncate max-w-[200px]">
              {product.itemName}
            </h3>
            <div className="flex gap-1">
              <p className="text-xs border px-2 py-1 rounded-xs">
                {product.sellerSku}
              </p>
              <p className="text-xs border px-2 py-1 rounded-xs">
                {product.asin1}
              </p>
            </div>
          </div>

          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            ${product.price || "0.00"}
          </span>

          <Input
            placeholder="Max Price"
            value={product.maxPrice}
            onChange={(e) =>
              handleInputChange(product.sellerSku, "maxPrice", e.target.value)
            }
            className="w-[20%]"
          />

          <Input
            placeholder="Min Price"
            value={product.minPrice}
            onChange={(e) =>
              handleInputChange(product.sellerSku, "minPrice", e.target.value)
            }
            className="w-[20%]"
          />
        
       {["quantity-cycling", "age-by-day"].includes(ruleType) && (

            <Input
              placeholder="Target Quantity"
              type="number"
              min={1}
              value={product.targetQuantity}
              onChange={(e) =>
                handleInputChange(
                  product.sellerSku,
                  "targetQuantity",
                  e.target.value
                )
              }
              className="w-[20%]"
            />
          )}

          <Checkbox className="w-[50%]" onChange={handleSaleCheckboxChange}>
            On Sale
          </Checkbox>

          <button
            onClick={() => {
              setDisplayedProducts((prev) =>
                prev.filter((item) => item.sellerSku !== product.sellerSku)
              );

              setSelectedProducts((prev) =>
                prev.filter((item) => item.sellerSku !== product.sellerSku)
              );
            }}
            className="text-gray-500 hover:text-gray-600"
          >
            &#x2715;
          </button>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  console.log("searched products", searchedProducts);

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
            <div className="mt-4 flex gap-4">
              <div
                className={`${
                  searchedProducts.length ? "w-[55%] border" : "w-full"
                }  h-[45vh] overflow-y-auto  p-2`}
              >
                {searchedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {searchedProducts.map((product, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Checkbox
                          onChange={(e) =>
                            handleCheckboxChange(product, e.target.checked)
                          }
                          checked={selectedProducts.some(
                            (p) => p.sellerSku === product.sellerSku
                          )}
                        />
                        <img
                          src={product.imageUrl}
                          className="w-[30px] h-[40px] object-cover"
                          alt="product_image"
                        />
                        {/* <h3 className="text-sm">{product.itemName}</h3> */}
                        <div className="flex-grow">
                          <h3 className="text-sm font-medium truncate max-w-[400px]">
                            {product.itemName.length > 50
                              ? `${product.itemName.substring(0, 100)}...`
                              : product.itemName}
                          </h3>

                          {/* Display ASIN and SKU */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs border px-2 py-1 rounded-xs">
                              {product.asin1}
                            </span>
                            <span className="text-xs border px-2 py-1 rounded-xs">
                              {product.sellerSku}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-center">No products found.</p>
                )}
              </div>
              {renderSelectedProducts()}
            </div>
          )}
        </Modal.Body>
        <div className="  bg-white shadow-sm px-3 py-2 border-t-[1px] ">
          <section className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium">
                {displayedProducts.length} Products Selected
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
                disabled={selectedProducts.length === 0 || addProductLoading}
              >
                {addProductLoading ? "Loading..." : "Add"}
              </Button>
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
};

export default AddProductsInRuleModal;