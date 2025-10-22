import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { FiSave, FiTrash, FiUpload } from "react-icons/fi";
import { PenLine } from "lucide-react";
import Swal from "sweetalert2";
import { ColorPicker, Divider, Row, Col } from "antd";
import { cyan, green, red, generate, presetPalettes } from "@ant-design/colors";
import { theme } from "antd";
import { Tooltip } from "antd";
import { BsFillInfoSquareFill } from "react-icons/bs";

import withReactContent from "sweetalert2-react-content";

import * as XLSX from "xlsx";
import "./ExistingTags.css";

import skuImage from "../../../assets/images/skus.png";

const BASE_URL = `https://api.priceobo.com`;

const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map(([label, colors]) => ({
    label,
    colors,
  }));

const ExistingTags = ({ tagsDataFetch, setTagsDataFetch }) => {
  const { token } = theme.useToken();
  const [tags, setTags] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({
    tagName: "",
    colorCode: "",
  });
  const [file, setFile] = useState(null);
  const MySwal = withReactContent(Swal);

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    green,
    cyan,
  });

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tag`);
      setTags(response.data.tag);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (tagsDataFetch) {
      fetchTags();
      setTagsDataFetch(false);
    }
  }, [tagsDataFetch]);

  const customPanelRender = (_, { components: { Picker, Presets } }) => (
    <Row justify="space-between" wrap={false}>
      <Col span={12}>
        <Presets />
      </Col>
      <Divider type="vertical" style={{ height: "auto" }} />
      <Col flex="auto">
        <Picker />
      </Col>
    </Row>
  );

  const handleEditClick = (index, tag) => {
    setEditingRow(index);
    setEditValues({ tagName: tag.tagName, colorCode: tag.colorCode });
  };

  const handleUploadClick = (tag) => {
    MySwal.fire({
      title: "Upload File",
      html: (
        <div>
          <p className="flex justify-center items-center gap-1">
            <Tooltip
              placement="bottom"
              title={
                <div>
                  <p className="text-lg">
                    Supported formats: <strong>.xlsx, .xls, .csv</strong>
                  </p>
                  <p className="text-base">
                    Please ensure the file contains valid SKUs in the first
                    column.
                  </p>
                  <img
                    src={skuImage}
                    alt="Information Screenshot"
                    style={{
                      maxWidth: "100%",
                      border: "1px solid #ccc",
                      marginTop: "10px",
                    }}
                  />
                </div>
              }
              overlayClassName="custom-tooltip"
            >
              <BsFillInfoSquareFill className="text-[#0D6EFD] hover:cursor-pointer" />
            </Tooltip>
            Upload a file for the tag: <strong>{tag.tagName}</strong>
          </p>
        </div>
      ),
      input: "file",
      inputAttributes: {
        accept: ".xlsx, .xls, .csv",
      },
      showCancelButton: true,
      confirmButtonText: "Upload",
      preConfirm: () => {
        const input = Swal.getInput();
        return (
          input.files[0] || Swal.showValidationMessage("Please select a file!")
        );
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const file = result.value;
        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const fileName = file.name.toLowerCase();
            let skus = [];

            if (fileName.endsWith(".csv")) {
              const csvBuffer = event.target.result;
              const decoder = new TextDecoder("utf-8"); // Default to UTF-8
              let csvContent = decoder.decode(csvBuffer);

              // Try different encodings if UTF-8 fails
              if (!csvContent || csvContent.includes("�")) {
                const fallbackDecoder = new TextDecoder("iso-8859-1"); // Common encoding for Macintosh/MS-DOS
                csvContent = fallbackDecoder.decode(csvBuffer);
              }

              const rows = csvContent
                .split("\n")
                .map((line) => line.split(","));
              skus = rows.map((row) => row[0].trim()).filter(Boolean);
            } else {
              const data = new Uint8Array(event.target.result);
              const workbook = XLSX.read(data, { type: "array" });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

              skus = rows.map((row) => row[0]).filter(Boolean);
            }

            if (skus.length === 0) {
              MySwal.fire({
                title: "Error!",
                text: "No SKUs found in the file.",
                icon: "error",
              });
              return;
            }

            const promises = skus.map((sku) => {
              const encodedSku = encodeURIComponent(sku); // Encode the SKU
              const url = `${BASE_URL}/api/product/tag/${encodedSku}`; // Use encoded SKU in the URL
              const payload = {
                tags: [
                  {
                    tag: tag.tagName,
                    colorCode: tag.colorCode,
                  },
                ],
              };

              return axios.put(url, payload);
            });

            await Promise.all(promises);

            MySwal.fire({
              title: "Success!",
              text: `Tags updated for ${skus.length} SKUs.`,
              icon: "success",
            });
          } catch (error) {
            console.error("Error processing file or updating tags:", error);
            MySwal.fire({
              title: "Error!",
              text: "Failed to process file or update tags.",
              icon: "error",
            });
          }
        };

        if (file.name.toLowerCase().endsWith(".csv")) {
          reader.readAsArrayBuffer(file); // Read CSV as ArrayBuffer for encoding detection
        } else {
          reader.readAsArrayBuffer(file); // Read Excel as ArrayBuffer
        }
      }
    });
  };

  // const handleUploadClick = (tag) => {
  //   MySwal.fire({
  //     title: "Upload File",
  //     html: (
  //       <div>
  //         <p className="flex justify-center items-center gap-1">
  //           <Tooltip
  //             placement="bottom"
  //             title={
  //               <div>
  //                 <p className="text-lg">
  //                   Supported formats: <strong>.xlsx, .xls, .csv</strong>
  //                 </p>
  //                 <p className="text-base">
  //                   Please ensure the file contains valid SKUs in the first
  //                   column.
  //                 </p>
  //                 <img
  //                   src="https://mcusercontent.com/e006191206c6952a765463cfb/images/0f69dc40-1826-00b3-c827-3cfae98a1e8f.png"
  //                   alt="Information Screenshot"
  //                   style={{
  //                     maxWidth: "100%",
  //                     border: "1px solid #ccc",
  //                     marginTop: "10px",
  //                   }}
  //                 />
  //               </div>
  //             }
  //             overlayClassName="custom-tooltip"
  //           >
  //             <BsFillInfoSquareFill className="text-[#0D6EFD] hover:cursor-pointer" />
  //           </Tooltip>
  //           Upload a file for the tag: <strong>{tag.tagName}</strong>
  //         </p>
  //       </div>
  //     ),
  //     input: "file",
  //     inputAttributes: {
  //       accept: ".xlsx, .xls, .csv",
  //     },
  //     showCancelButton: true,
  //     confirmButtonText: "Upload",
  //     preConfirm: () => {
  //       const input = Swal.getInput();
  //       return (
  //         input.files[0] || Swal.showValidationMessage("Please select a file!")
  //       );
  //     },
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const file = result.value;
  //       const reader = new FileReader();

  //       reader.onload = async (event) => {
  //         try {
  //           const fileName = file.name.toLowerCase();
  //           let skus = [];

  //           if (fileName.endsWith(".csv")) {
  //             const csvContent = event.target.result;
  //             const rows = csvContent
  //               .split("\n")
  //               .map((line) => line.split(","));
  //             skus = rows.map((row) => row[0].trim()).filter(Boolean);
  //           } else {
  //             const data = new Uint8Array(event.target.result);
  //             const workbook = XLSX.read(data, { type: "array" });
  //             const firstSheetName = workbook.SheetNames[0];
  //             const worksheet = workbook.Sheets[firstSheetName];
  //             const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //             skus = rows.map((row) => row[0]).filter(Boolean);
  //           }

  //           if (skus.length === 0) {
  //             MySwal.fire({
  //               title: "Error!",
  //               text: "No SKUs found in the file.",
  //               icon: "error",
  //             });
  //             return;
  //           }

  //           const promises = skus.map((sku) => {
  //             const encodedSku = encodeURIComponent(sku); // Encode the SKU
  //             const url = `${BASE_URL}/api/product/tag/${encodedSku}`; // Use encoded SKU in the URL
  //             const payload = {
  //               tags: [
  //                 {
  //                   tag: tag.tagName,
  //                   colorCode: tag.colorCode,
  //                 },
  //               ],
  //             };

  //             return axios.put(url, payload);
  //           });

  //           await Promise.all(promises);

  //           MySwal.fire({
  //             title: "Success!",
  //             text: `Tags updated for ${skus.length} SKUs.`,
  //             icon: "success",
  //           });
  //         } catch (error) {
  //           console.error("Error processing file or updating tags:", error);
  //           MySwal.fire({
  //             title: "Error!",
  //             text: "Failed to process file or update tags.",
  //             icon: "error",
  //           });
  //         }
  //       };

  //       if (file.name.toLowerCase().endsWith(".csv")) {
  //         reader.readAsText(file);
  //       } else {
  //         reader.readAsArrayBuffer(file);
  //       }
  //     }
  //   });
  // };

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };

  // Handle Save Request
  const handleSave = async (tagId) => {
    try {
      await axios.put(`${BASE_URL}/api/tag/${tagId}`, editValues);
      Swal.fire({
        title: "Updated!",
        text: "Tag has been updated.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      fetchTags(); // Refresh data
      setEditingRow(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating tag:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update tag.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // Handle Delete Request
  const handleDeleteTag = (tagId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeleteLoading(true);
        try {
          await axios.delete(`${BASE_URL}/api/tag/${tagId}`);
          Swal.fire({
            title: "Deleted!",
            text: "Tag has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setDeleteLoading(false);
          fetchTags(); // Refresh data
        } catch (error) {
          console.error("Error deleting tag:", error);
          setDeleteLoading(false);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete tag.",
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  return (
    <section className="px-2 py-3 w-[70%] mt-3">
      <h2 className="text-center text-lg font-semibold">Existing Tags</h2>
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
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Tag Name
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
              Tag Color
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
        <tbody>
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <tr key={index}>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editingRow === index ? (
                    <Form.Control
                      type="text"
                      className="update-custom-input text-sm text-center"
                      value={editValues.tagName}
                      onChange={(e) => handleInputChange(e, "tagName")}
                    />
                  ) : (
                    tag.tagName
                  )}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editingRow === index ? (
                    <ColorPicker
                      value={editValues.colorCode}
                      presets={presets}
                      panelRender={customPanelRender}
                      onChange={(color) =>
                        setEditValues({
                          ...editValues,
                          colorCode: color.toHexString(),
                        })
                      }
                      showText={(color) => <span>{color.toHexString()}</span>}
                    />
                  ) : (
                    <span
                      style={{
                        backgroundColor: tag.colorCode,
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                      }}
                      className="shadow-sm mx-auto"
                    ></span>
                  )}
                </td>
                <td>
                  <div className="flex justify-center items-center">
                    {editingRow === index ? (
                      <button
                        onClick={() => handleSave(tag._id)}
                        className="py-1 px-2 rounded-sm bg-[#0662BB] text-white mr-1"
                      >
                        <FiSave size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(index, tag)}
                        className="py-1 px-2 rounded-sm bg-[#0662BB] text-white mr-1"
                      >
                        <PenLine size={20} />
                      </button>
                    )}
                    <Button
                      onClick={() => handleDeleteTag(tag._id)}
                      disabled={deleteLoading}
                      variant="danger"
                      className="rounded-sm"
                    >
                      <FiTrash />
                    </Button>

                    <div className="flex justify-end ">
                      {/* Upload Button */}
                      <label htmlFor="file-upload">
                        <button
                          onClick={() => handleUploadClick(tag)}
                          className="ml-2 flex justify-center gap-1  items-center px-2 py-1 border text-sm rounded-sm"
                        >
                          <FiUpload size={12} /> Upload (.xlsx, .xls, .csv)
                        </button>
                      </label>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ textAlign: "center", padding: "10px" }} colSpan="3">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ExistingTags;