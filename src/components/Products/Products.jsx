import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import readXlsxFile from "read-excel-file";
import { IoIosArrowForward, IoMdAdd } from "react-icons/io";
import { PenLine } from "lucide-react";
import {
  addSku,
  bulkmapSku,
  createProduct,
  deleteProduct,
  fetchGroupSaleReport,
  fetchProduct,
  fetchProductBySku,
  fetchSingleProduct,
  searchProduct,
  updateSingleProduct,
  updateSku,
} from "@/api/product";
import CreateProductModal from "./CreateProductModal/CreateProductModal";
import EditSkuModal from "./EditSkuModal/EditSkuModal";
import BulkMappingModal from "./BulkMappingModal/BulkMappingModal";
import AddSkuModal from "./AddSkuModal/AddSkuModal";
import EditProductModal from "./EditProductModal/EditProductModal";
import { RxCross1 } from "react-icons/rx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { MdOutlineClose } from "react-icons/md";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { GoGraph } from "react-icons/go";
// const BASE_URL = `http://localhost:3000`;
const BASE_URL = `https://api.priceobo.com`;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);
// SalesGraph component renders the sales data graph for the last 30 days
const SalesGraph = ({ saleReportData }) => {
  // Calculate the date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Filter the data to only include dates within the last 30 days
  const filteredData = saleReportData.filter((report) => {
    const reportDate = new Date(report._id);
    return reportDate >= thirtyDaysAgo;
  });

  // Sort the filtered data by date (ascending)
  filteredData.sort((a, b) => new Date(a._id) - new Date(b._id));

  // Create labels and data points from the filtered data
  const labels = filteredData.map((report) => report._id);
  const dataPoints = filteredData.map((report) => report.totalSales);

  const data = {
    labels,
    datasets: [
      {
        label: "Total Sales",
        data: dataPoints,
        // backgroundColor: "rgba(75,192,192,0.4)",
        backgroundColor: "rgba(42, 156, 143,1.0)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sales Units vs Date (Last 30 Days)" },
      datalabels: {
        anchor: "end",
        align: "top",
        color: "black",
        font: {
          weight: "bold",
          size: 10,
        },
        formatter: (value) => value,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

function Products() {
  const [products, setProducts] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSkuModalOpen, setSkuModalOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newSku, setNewSku] = useState({ sku: "", uom: "" });
  const [excelData, setExcelData] = useState([]);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [saleReportData, setSaleReportData] = useState([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [editProduct, setEditProduct] = useState({
    name: "",
    title: "",
    imageUrl: "",
    cost: 0,
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    title: "",
    imageUrl: "",
    cost: 0,
  });

  const drawerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsDrawerOpen(false);
      }
    };

    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchProduct();
        const groupProducts = response.data.result;

        const productsWithDetails = await Promise.all(
          groupProducts.map(async (product) => {
            const skuDetails = await Promise.all(
              product.skus.map(async (sku) => {
                console.log(sku);
                const skuResponse = await fetchProductBySku(sku.sku);
                return {
                  ...skuResponse.data.data,
                  uom: sku.uom,
                };
              })
            );

            const totalStock = skuDetails.reduce(
              (sum, sku) => sum + sku.stock,
              0
            );
            let minPrice = Math.min(...skuDetails.map((sku) => sku.price));

            if (minPrice === Infinity) {
              minPrice = 0;
            }
            return {
              id: product._id,
              imageUrl: product.imageUrl,
              name: product.name,
              title: product.title,
              avgCost: product.cost,
              price: minPrice ? minPrice : 0,
              stock: totalStock,
              skus: skuDetails,
            };
          })
        );

        setProducts(productsWithDetails);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      // const response = await axios.get(`http://localhost:3000/api/group/search`, {
      //   params: { uid: searchTerm.trim() },
      // });
      const response = await searchProduct(searchTerm.trim());
      const groupProducts = response.data.result;

      const productsWithDetails = await Promise.all(
        groupProducts.map(async (product) => {
          const skuDetails = await Promise.all(
            product.skus.map(async (sku) => {
              const skuResponse = await fetchProductBySku(sku.sku);
              return {
                ...skuResponse.data.data,
                uom: sku.uom,
              };
            })
          );

          const totalStock = skuDetails.reduce(
            (sum, sku) => sum + sku.stock,
            0
          );
          let minPrice = Math.min(...skuDetails.map((sku) => sku.price));
          if (minPrice === Infinity) minPrice = 0;

          return {
            id: product._id,
            imageUrl: product.imageUrl,
            name: product.name,
            title: product.title,
            avgCost: product.cost,
            price: minPrice,
            stock: totalStock,
            skus: skuDetails,
          };
        })
      );

      setProducts(productsWithDetails);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const response = await createProduct(newProduct);
      if (response.status === 200 || response.status === 201) {
        alert("Product created successfully!");
        setModalOpen(false);
        setNewProduct({
          name: "",
          title: "",
          imageUrl: "",
          cost: 0,
        });

        const fetchProducts = await axios.get(`${BASE_URL}/api/group`);
        setProducts(fetchProducts.data.result);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    window.location.reload(); // or call the original fetchProducts()
  };

  const handleAddSku = async () => {
    try {
      const response = await fetchSingleProduct(selectedProductId);
      const existingSkus = response.data.result.skus || [];
      const updatedSkus = [
        ...existingSkus,
        ...excelData,
        ...(newSku.sku && newSku.uom ? [newSku] : []),
      ];

      await addSku(selectedProductId, updatedSkus);
      alert("SKUs added successfully!");
      setSkuModalOpen(false);
      setExcelData([]);
      setNewSku({ sku: "", uom: "" });

      const fetchProducts = await axios.get(`${BASE_URL}/api/group`);
      setProducts(fetchProducts.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error adding SKUs:", error);
      alert("Failed to add SKUs.");
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      readXlsxFile(file).then((rows) => {
        const data = rows.slice(1).map(([sku, uom]) => ({ sku, uom }));
        setExcelData(data);
      });
    }
  };

  const handleReplaceSku = async () => {
    try {
      if (!newSku.newSku) {
        alert("Please enter a valid new SKU for replacement.");
        return;
      }
      if (!newSku.uom) {
        alert("Please enter a valid UOM for replacement.");
        return;
      }

      const body = { sku: newSku.sku, newSku: newSku.newSku, uom: newSku.uom };

      console.log(body);
      await updateSku(selectedProductId, body);
      alert("SKU replaced successfully!");
      window.location.reload();
      setSkuModalOpen(false);
      const response = await axios.get(`${BASE_URL}/api/group`);
      setProducts(response.data.result);
    } catch (error) {
      console.error("Error replacing SKU:", error);
      alert("Failed to replace SKU. Please try again later.");
    }
  };

  const handleCancelSku = async () => {
    try {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this SKU?"
      );
      if (!confirmCancel) return;

      const body = { sku: newSku.sku };
      await updateSku(selectedProductId, body);
      alert("SKU canceled successfully!");
      setIsModal(false);

      setSkuModalOpen(false);
      const response = await axios.get(`${BASE_URL}/api/group`);
      setProducts(response.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error canceling SKU:", error);
      alert("Failed to cancel SKU. Please try again later.");
    }
  };

  const handleOpenSalesGraph = async (groupId, product) => {
    try {
      const response = await fetchGroupSaleReport(groupId);
      const saleReports = response.data.data.saleReports;
      setSaleReportData(saleReports);
      setTotalSales(response.data.data.sumOfTotalSales);
      setSelectedProductDetails(product);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Error fetching sales report data:", error);
      alert("Failed to fetch sales report data.");
    }
  };

  const handleEditProduct = async () => {
    try {
      await updateSingleProduct(selectedProductId, editProduct);
      alert("Product updated successfully!");
      setEditModalOpen(false);
      const fetchProducts = await fetchProduct();
      setProducts(fetchProducts.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };
  const handleDeleteProduct = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!confirmDelete) return;
      await deleteProduct(selectedProductId);

      alert("Product deleted successfully!");
      setEditModalOpen(false);
      const fetchProducts = await fetchProduct();
      setProducts(fetchProducts.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again later.");
    }
  };

  const handleExcelUploadForBulkMapping = (e) => {
    const file = e.target.files[0];
    if (file) {
      readXlsxFile(file).then((rows) => {
        const data = rows
          .slice(1)
          .map(([name, sku, uom]) => ({ name, sku, uom }));
        setBulkData(data);
      });
    }
  };

  const handleBulkSkuMapping = async () => {
    try {
      if (!bulkData.length) {
        alert(
          "No data found in the uploaded file. Please upload a valid Excel file."
        );
        return;
      }

      setIsLoading(true);
      await bulkmapSku(bulkData);
      alert("Bulk SKU mapping completed successfully!");
      setBulkModalOpen(false);
      setBulkData([]);
      setIsLoading(false);

      const response = await fetchProduct();
      setProducts(response.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error during bulk SKU mapping:", error);
      alert("Failed to map SKUs. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-5 ">
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginBottom: "10px",
          gap: "20px",
        }}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="text-sm flex items-center gap-1 "
          style={{
            padding: "8px 12px",
            border: "none",
            backgroundColor: "#0662BB",
            borderRadius: "3px",
          }}
        >
          <IoMdAdd className="text-[21px]" /> Create Product
        </Button>

        <Button
          className="text-sm flex items-center gap-1 "
          style={{
            padding: "8px 12px",
            border: "none",
            backgroundColor: "#0662BB",
            borderRadius: "3px",
          }}
          onClick={() => setBulkModalOpen(true)}
        >
          Bulk Map SKUs
        </Button>
      </div>

      <div>
        <InputGroup className="max-w-[500px]  z-0 absolute top-[30px]">
          <Form.Control
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="custom-input"
            placeholder="Search by Name or Title"
            style={{ borderRadius: "0px" }}
          />

          <button
            className="px-3 py-2 bg-gray-300"
            onClick={handleSearchSubmit}
            disabled={isSearching}
          >
            <HiMagnifyingGlass />
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-12 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
            >
              <MdOutlineClose />
            </button>
          )}
        </InputGroup>
      </div>
      {/* 
      <div>
        <InputGroup className="max-w-[500px] mt-[15px] z-0">
          <Form.Control
            type="text"
            placeholder="Search by Product Name, Asin or SKU..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            style={{ borderRadius: "0px" }}
            className="custom-input"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-12 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
            >
              <MdOutlineClose />
            </button>
          )}
          <button
            className="px-3 py-2 bg-gray-300"
            onClick={handleSearchSubmit}
            disabled={isSearching}
          >
            <HiMagnifyingGlass />
          </button>
        </InputGroup>
      </div> */}

      <table
        style={{
          tableLayout: "fixed",
        }}
        className="reportCustomTable table"
      >
        <thead
          style={{
            backgroundColor: "#f0f0f0",
            color: "#333",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          <tr>
            <th
              className="tableHeader"
              style={{
                width: "60px",
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            ></th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Image
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Name
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Title
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Avg Cost
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Price
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Stock
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          style={{
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.5",
          }}
        >
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <tr>
                <td
                  style={{
                    height: "40px",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <IoIosArrowForward
                    onClick={() => toggleRowExpansion(product.id)}
                    className={` text-base transition-all cursor-pointer duration-300 ${
                      expandedRows[product.id] ? "rotate-90" : ""
                    }`}
                  ></IoIosArrowForward>
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
                  <img
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "contain",
                      margin: "0 auto",
                    }}
                    src={
                      product.imageUrl ||
                      (product.skus.length > 0 ? product.skus[0].imageUrl : "")
                    }
                    alt=""
                  />
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {product.name}
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {product.title}
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  ${product.avgCost}
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  ${product.price ? product.price : 0}
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {product.stock}
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
                  <div className="flex justify-center items-center gap-1">
                    <Button
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setSkuModalOpen(true);
                      }}
                      className="text-xs flex items-center gap-1 "
                      style={{
                        padding: "5px 9px",
                        border: "none",
                        backgroundColor: "#0662BB",
                        borderRadius: "3px",
                      }}
                    >
                      <IoMdAdd size={15} />
                      SKU
                    </Button>

                    <Button
                      style={{
                        padding: "5px 9px",
                        border: "none",
                        backgroundColor: "#0662BB",
                        borderRadius: "3px",
                      }}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        const productToEdit = products.find(
                          (p) => p.id === product.id
                        );
                        setEditProduct({
                          name: productToEdit.name,
                          title: productToEdit.title,
                          imageUrl: productToEdit.imageUrl,
                          cost: productToEdit.avgCost,
                        });
                        setEditModalOpen(true);
                      }}
                    >
                      <PenLine size={16} className="text-white" />
                    </Button>
                    <Button
                      style={{
                        padding: "5px 9px",
                        border: "none",
                        backgroundColor: "#0662BB",
                        borderRadius: "3px",
                      }}
                      onClick={() => handleOpenSalesGraph(product.id, product)}
                    >
                      {/* View Details */}
                      <GoGraph size={16} className="text-white" />
                    </Button>
                  </div>
                </td>
              </tr>
              {expandedRows[product.id] && (
                <tr>
                  <td colSpan="8">
                    <table
                      style={{
                        tableLayout: "fixed",
                      }}
                      className="reportCustomTable table"
                      width="100%"
                    >
                      <thead
                        style={{
                          backgroundColor: "#f0f0f0",
                          color: "#333",
                          fontFamily: "Arial, sans-serif",
                          fontSize: "14px",
                        }}
                      >
                        <tr>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRight: "2px solid #C3C6D4",
                              width: "5%",
                            }}
                          >
                            Image
                          </th>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRight: "2px solid #C3C6D4",
                              width: "10%",
                            }}
                          >
                            SKU
                          </th>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRight: "2px solid #C3C6D4",
                              width: "16%",
                            }}
                          >
                            Title
                          </th>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRight: "2px solid #C3C6D4",
                              width: "5%",
                            }}
                          >
                            UOM
                          </th>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRight: "2px solid #C3C6D4",
                              width: "7%",
                            }}
                          >
                            Price
                          </th>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRight: "2px solid #C3C6D4",
                              width: "7%",
                            }}
                          >
                            Stock
                          </th>
                          <th
                            className="tableHeader"
                            style={{
                              position: "sticky",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "10%",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.skus.map((sku, index) => (
                          <tr key={index}>
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
                              <img
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  objectFit: "contain",
                                  margin: "0 auto",
                                }}
                                src={sku.imageUrl}
                                alt="SKU"
                              />
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              {sku.sku}
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              {sku.title.length > 10
                                ? `${sku.title.substring(0, 50)}...`
                                : sku.title}
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              {sku.uom}
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              ${sku.price || 0}
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              {sku.stock}
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
                              <div className="flex justify-center items-center gap-1">
                                <Button
                                  className="text-xs flex items-center justify-center gap-1 "
                                  style={{
                                    padding: "5px 9px",
                                    border: "none",
                                    backgroundColor: "#0662BB",
                                    borderRadius: "3px",
                                  }}
                                  onClick={() => {
                                    setSelectedProductId(product.id);
                                    setNewSku({ sku: sku.sku, newSku: "" });
                                    setIsModal(true);
                                  }}
                                >
                                  <PenLine size={15} />
                                  SKU
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Create Product Modal */}
      <CreateProductModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        handleInputChange={handleInputChange}
        handleCreateProduct={handleCreateProduct}
        newProduct={newProduct}
      ></CreateProductModal>

      {/* add skus modal */}

      <AddSkuModal
        isSkuModalOpen={isSkuModalOpen}
        setSkuModalOpen={setSkuModalOpen}
        newSku={newSku}
        setNewSku={setNewSku}
        handleExcelUpload={handleExcelUpload}
        handleAddSku={handleAddSku}
      ></AddSkuModal>

      {/* Edit Product Modal */}
      <EditProductModal
        isEditModalOpen={isEditModalOpen}
        setEditModalOpen={setEditModalOpen}
        editProduct={editProduct}
        setEditProduct={setEditProduct}
        handleEditProduct={handleEditProduct}
        handleDeleteProduct={handleDeleteProduct}
      ></EditProductModal>

      <EditSkuModal
        isModal={isModal}
        setIsModal={setIsModal}
        newSku={newSku}
        handleCancelSku={handleCancelSku}
        handleReplaceSku={handleReplaceSku}
      ></EditSkuModal>

      <BulkMappingModal
        isBulkModalOpen={isBulkModalOpen}
        setBulkModalOpen={setBulkModalOpen}
        handleExcelUploadForBulkMapping={handleExcelUploadForBulkMapping}
        handleBulkSkuMapping={handleBulkSkuMapping}
        isLoading={isLoading}
      ></BulkMappingModal>

      {isDrawerOpen && (
        <div
          ref={drawerRef}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "1000px",
            height: "100%",
            backgroundColor: "#fff",
            borderLeft: "1px solid #ccc",

            padding: "20px",
            overflowY: "auto",
            boxShadow: "-2px 0 5px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => setIsDrawerOpen(false)}
              className="mt-2 bg-white"
              style={{
                border: "none",
                display: "flex",
                alignItems: "center",
                padding: "5px",
              }}
            >
              <RxCross1
                style={{
                  backgroundColor: "white",
                  color: "black",
                  fontSize: "20px",
                }}
              />
            </Button>
          </div>
          {selectedProductDetails && (
            <div style={{ marginBottom: "20px" }}>
              <h4>{selectedProductDetails.name}</h4>
              <p>{selectedProductDetails.title}</p>
            </div>
          )}
          <h3>Sales Report</h3>
          <h4>Total Sales: {totalSales} units</h4>
          <SalesGraph saleReportData={saleReportData} />
        </div>
      )}
    </div>
  );
}

export default Products;
