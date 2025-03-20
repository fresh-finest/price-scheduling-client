import React, { useEffect, useRef, useState } from "react";
import { MdDownload } from "react-icons/md";

import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import readXlsxFile from "read-excel-file";
import { RxCross1 } from "react-icons/rx";
import * as XLSX from "xlsx";
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
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { color } from "@mui/system";
import ChartDataLabels from "chartjs-plugin-datalabels";

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
        backgroundColor: "rgba(42, 156, 143,1.0)"
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sales Units vs Date (Last 30 Days)" },
      datalabels:{
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          weight: 'bold',
          size: 10,
        },
        formatter:(value)=>value
      }
    },
  };

  return <Bar data={data} options={options} />;
};



const downloadTemplate = () => {
  const wsData = [["name", "sku", "uom"]]; // Column headers only
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "SKUs");
  XLSX.writeFile(workbook, "skus.xlsx");
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
  const [isBulkModalOpen, setBulkModalOpen] = useState(false); // Bulk mapping modal state
  const [bulkData, setBulkData] = useState([]); // Data from the Excel file
  const [isLoading, setIsLoading] = useState(false);
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

  // New state for handling the sales graph drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saleReportData, setSaleReportData] = useState([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [totalSales,setTotalSales] = useState(0);


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
  // Fetch group products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const response = await axios.get(`${BASE_URL}/api/group`);
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

  const handleCreateProduct = async () => {
    try {
      // const response = await axios.post(`${BASE_URL}/api/group`, newProduct);
      const response = await createProduct(newProduct);
      if (response.status === 200 || response.status === 201) {
        alert("Product created successfully!");
        setModalOpen(false);
        setNewProduct({
          name: "",
          title: "",
          cost: 0,
        });
        // Refresh the product list after adding a new product
        const fetchProducts = await axios.get(`${BASE_URL}/api/group`);
        setProducts(fetchProducts.data.result);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  /*
  // Handle SKU addition
  const handleAddSku = async () => {
    try {
      // const response = await axios.get(
      //   `${BASE_URL}/api/group/${selectedProductId}`
      // );

      const response = await fetchSingleProduct(selectedProductId);
      const existingSkus = response.data.result.skus || [];
      const updatedSkus = [
        ...existingSkus,
        ...excelData,
        ...(newSku.sku && newSku.uom ? [newSku] : []),
      ];

      // await axios.put(`${BASE_URL}/api/group/${selectedProductId}`, {
      //   skus: updatedSkus,
      // });

      await addSku(selectedProductId,updatedSkus);
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
  */

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

      // Fetch updated product list
      const fetchProducts = await fetchProduct();
      const updatedProducts = fetchProducts.data.result.map((product) => {
        if (product._id === selectedProductId) {
          return {
            ...product,
            imageUrl:
              product.imageUrl ||
              (updatedSkus.length > 0 ? updatedSkus[0].imageUrl : ""),
          };
        }
        return product;
      });

      setProducts(updatedProducts);
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
        const data = rows.slice(1).map(([sku, uom]) => ({ sku, uom })); // Skip header row
        setExcelData(data);
      });
    }
  };

  const handleReplaceSku = async () => {
    try {
      if (!newSku.uom) {
        alert("Please enter a valid UOM for replacement.");
        return;
      }

      const body = { sku: newSku.sku, newSku: newSku.sku, uom: newSku.uom };

      console.log(body);
      // await axios.put(`${BASE_URL}/api/group/${selectedProductId}/sku`, body);
      await updateSku(selectedProductId, body);
      alert("SKU updated successfully!");
      window.location.reload();
      // Close modal and refresh product list
      setSkuModalOpen(false);
      const response = await axios.get(`${BASE_URL}/api/group`);
      setProducts(response.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error replacing SKU:", error);

    }
  };

  const handleCancelSku = async () => {
    try {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this SKU?"
      );
      if (!confirmCancel) return;

      const body = { sku: newSku.sku };

      // await axios.put(`${BASE_URL}/api/group/${selectedProductId}/sku`, body);
      await updateSku(selectedProductId, body);
      alert("SKU canceled successfully!");
      setIsModal(false);

      // Close modal and refresh product list
      setSkuModalOpen(false);
      const response = await axios.get(`${BASE_URL}/api/group`);
      setProducts(response.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error canceling SKU:", error);
    }
  };

  // Handle editing a product
  const handleEditProduct = async () => {
    try {
      // await axios.put(
      //   `${BASE_URL}/api/group/${selectedProductId}`,
      //   editProduct
      // );
      await updateSingleProduct(selectedProductId, editProduct);
      alert("Product updated successfully!");
      setEditModalOpen(false);

      // Refresh products
      // const fetchProducts = await axios.get(`${BASE_URL}/api/group`);
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
      // Confirm before deleting
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!confirmDelete) return;

      // Send DELETE request to the server
      // await axios.delete(`${BASE_URL}/api/group/${selectedProductId}`);
      await deleteProduct(selectedProductId);

      alert("Product deleted successfully!");
      setEditModalOpen(false);

      // Refresh the product list after deletion
      // const fetchProducts = await axios.get(`${BASE_URL}/api/group`);
      const fetchProducts = await fetchProduct();
      setProducts(fetchProducts.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again later.");
    }
  };

  // Handle Excel upload for bulk SKU mapping
  const handleExcelUploadForBulkMapping = (e) => {
    const file = e.target.files[0];
    if (file) {
      readXlsxFile(file).then((rows) => {
        const data = rows
          .slice(1)
          .map(([name, sku, uom]) => ({ name, sku, uom })); // Skip header row
        setBulkData(data);
      });
    }
  };

  // Handle bulk SKU mapping
  const handleBulkSkuMapping = async () => {
    try {
      if (!bulkData.length) {
        alert(
          "No data found in the uploaded file. Please upload a valid Excel file."
        );
        return;
      }

      setIsLoading(true); // Show loading state
      // await axios.put("/api/group", bulkData);
      await bulkmapSku(bulkData);
      alert("Bulk SKU mapping completed successfully!");
      setBulkModalOpen(false);
      setBulkData([]);
      setIsLoading(false);

      // Refresh the product list after mapping
      const response = await fetchProduct();
      setProducts(response.data.result);
      window.location.reload();
    } catch (error) {
      console.error("Error during bulk SKU mapping:", error);
      alert("Failed to map SKUs. Please try again later.");
      setIsLoading(false);
    }
  };
  // New function to open the sales graph drawer
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
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
  
          const totalStock = skuDetails.reduce((sum, sku) => sum + sku.stock, 0);
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
  
  const handleClearSearch = () => {
    setSearchTerm("");
    window.location.reload(); // or call the original fetchProducts()
  };
  
  return (
    <div className="mt-5 ml-5">
      <div
        style={{
          display: "flex",
          // justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Button
          style={{ marginRight: "20px" }}
          variant="primary"
          onClick={() => setModalOpen(true)}
        >
          Create Product
        </Button>
        <Button variant="success" onClick={() => setBulkModalOpen(true)}>
          Bulk Map SKUs
        </Button>

      </div>

      <div style={{ marginBottom: "15px" }}>
  <input
    type="text"
    value={searchTerm}
    onChange={handleSearchChange}
    placeholder="Search by Name or Title"
    style={{ padding: "6px 10px", width: "250px", marginRight: "10px" }}
  />
  <Button variant="primary" onClick={handleSearchSubmit} disabled={isSearching}>
    {isSearching ? "Searching..." : "Search"}
  </Button>
  {searchTerm && (
    <Button
      variant="outline-secondary"
      style={{ marginLeft: "10px" }}
      onClick={handleClearSearch}
    >
      Clear
    </Button>
  )}
</div>
      {/* Create Product Modal */}
      <Modal show={isModalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product title"
                name="title"
                value={newProduct.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            {/* <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product image URL"
                name="imageUrl"
                value={newProduct.imageUrl}
                onChange={handleInputChange}
              />
            </Form.Group> */}
            <Form.Group className="mb-3">
              <Form.Label>Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter product cost"
                name="cost"
                value={newProduct.cost}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateProduct}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isSkuModalOpen} onHide={() => setSkuModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add SKUs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter SKU"
                name="sku"
                value={newSku.sku}
                onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>UOM</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter UOM"
                name="uom"
                value={newSku.uom}
                onChange={(e) => setNewSku({ ...newSku, uom: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Or Upload Excel</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx"
                onChange={handleExcelUpload}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSkuModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSku}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={isEditModalOpen} onHide={() => setEditModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                name="name"
                value={editProduct.name}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product title"
                name="title"
                value={editProduct.title}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, title: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product image URL"
                name="imageUrl"
                value={editProduct.imageUrl}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, imageUrl: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter product cost"
                name="cost"
                value={editProduct.cost}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, cost: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditProduct}>
            Save Changes
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isModal} onHide={() => setIsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit SKU</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New SKU (Optional for Replace)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new SKU"
                value={newSku.newSku || newSku.sku}
                onChange={(e) =>
                  setNewSku({ ...newSku, newSku: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>UOM (Unit of Measure)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter UOM"
                value={newSku.uom || ""}
                onChange={(e) =>
                  setNewSku({ ...newSku, uom: parseInt(e.target.value, 10) })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleCancelSku}>
            Cancel SKU
          </Button>
          <Button variant="primary" onClick={handleReplaceSku}>
            Replace SKU
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Mapping Modal */}
      <Modal show={isBulkModalOpen} onHide={() => setBulkModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Map SKUs</Modal.Title>
          <Button variant="outline-primary" size="sm" onClick={downloadTemplate}>
          <MdDownload />

</Button>

        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Upload Excel File</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx"
                onChange={handleExcelUploadForBulkMapping}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setBulkModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkSkuMapping}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Title</th>
            <th>Avg Cost</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <tr>
                <td>
                  <img
                    src={
                      product.imageUrl ||
                      (product.skus.length > 0 ? product.skus[0].imageUrl : "")
                    }
                    alt=""
                    width="30"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.title}</td>
                <td>${product.avgCost}</td>
                <td>${product.price ? product.price : 0}</td>
                <td>{product.stock}</td>
                <td>
                  <Button
                    variant="link"
                    onClick={() => toggleRowExpansion(product.id)}
                  >
                    {expandedRows[product.id] ? "Hide SKUs" : "Show SKUs"}
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setSkuModalOpen(true);
                    }}
                  >
                    Add SKU
                  </Button>
                  <Button
                    variant="link"
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
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => handleOpenSalesGraph(product.id, product)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
              {expandedRows[product.id] && (
                <tr>
                  <td colSpan="7">
                    <table border="1" width="100%">
                      <thead>
                        <tr>
                          <th style={{ width: "5%" }}>Image</th>
                          <th style={{ width: "10%" }}>SKU</th>
                          <th style={{ width: "23%" }}>Title</th>
                          <th style={{ width: "5%" }}>UOM</th>
                          <th style={{ width: "7%" }}>Price</th>
                          <th style={{ width: "7%" }}>Stock</th>
                          <th style={{ width: "10%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.skus.map((sku, index) => (
                          <tr key={index}>
                            <td>
                              <img src={sku.imageUrl} alt="SKU" width="30" />
                            </td>
                            <td>{sku.sku}</td>
                            <td>
                              {sku.title.length > 10
                                ? `${sku.title.substring(0, 50)}...`
                                : sku.title}
                            </td>
                            <td>{sku.uom}</td>
                            <td>${sku.price || 0}</td>
                            <td>{sku.stock}</td>
                            <td>
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSelectedProductId(product.id);
                                  setNewSku({ sku: sku.sku, newSku: "" });
                                  setIsModal(true);
                                }}
                              >
                                Edit SKU
                              </Button>
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
              onClick={() =>setIsDrawerOpen(false)}
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
              <h4 >{selectedProductDetails.name}</h4>
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
