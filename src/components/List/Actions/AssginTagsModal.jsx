import { Button, Modal } from "react-bootstrap";
import "./AssignTagsModal.css";
import { MdOutlineClose } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IoIosCloseCircleOutline } from "react-icons/io";
import withReactContent from "sweetalert2-react-content";
import { UploadOutlined } from "@ant-design/icons";
import { Button as antDesignButton, message, Tooltip, Upload } from "antd";
import { FiUpload } from "react-icons/fi";
import { BsFillInfoSquareFill } from "react-icons/bs";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import skuImage from "../../../assets/images/skus.png";
import axios from "axios";

const BASE_URL = "http://192.168.0.102:3000";

const AssginTagsModal = ({
  assignTagsModalOpen,
  handleAssignTagsModalClose,
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploadDisabled, setUploadDisabled] = useState(false);

  const MySwal = withReactContent(Swal);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tag`);
      const data = await response.json();
      setExistingTags(data.tag);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.some((t) => t.tagName === tag.tagName)) {
        return prevSelectedTags;
      }
      return [...prevSelectedTags, tag];
    });
  };
  const handleFileChange = (info) => {
    if (info.fileList.length > 1) {
      message.error("You can't upload more than one file.");
      return;
    }

    const newFileList = [...info.fileList];
    setFileList(newFileList);
    setUploadedFile(
      newFileList.length > 0 ? newFileList[0].originFileObj : null
    );
    setUploadDisabled(newFileList.length > 0);
  };

  const handleFileRemove = () => {
    setFileList([]);
    setUploadedFile(null);
    setUploadDisabled(false);
    message.info("File removed successfully.");
  };

  const handleCancelTag = (tagToRemove) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.filter((tag) => tag.tagName !== tagToRemove.tagName)
    );
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      message.error("Please upload a file first.");
      return;
    }

    if (selectedTags.length === 0) {
      message.error("Please select at least one tag.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const fileName = uploadedFile.name.toLowerCase();
        let skus = [];

        if (fileName.endsWith(".csv")) {
          const csvBuffer = event.target.result;
          const decoder = new TextDecoder("utf-8");
          let csvContent = decoder.decode(csvBuffer);

          if (!csvContent || csvContent.includes("�")) {
            const fallbackDecoder = new TextDecoder("iso-8859-1");
            csvContent = fallbackDecoder.decode(csvBuffer);
          }

          const rows = csvContent.split("\n").map((line) => line.split(","));
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

        // Prepare API payload and send requests
        const promises = skus.map((sku) => {
          const encodedSku = encodeURIComponent(sku);
          const url = `${BASE_URL}/api/product/tag/${encodedSku}`;
          const payload = {
            tags: selectedTags.map((tag) => ({
              tag: tag.tagName,
              colorCode: tag.colorCode,
            })),
          };

          console.log("urlll", url);
          console.log("payload", payload);

          return axios.put(url, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        });

        await Promise.all(promises);

        MySwal.fire({
          title: "Success!",
          text: `Tags assigned to SKUs successfully.`,
          icon: "success",
        });
        setSelectedTags([]);
        setUploadedFile(null);
        setFileList([]);
      } catch (error) {
        console.error("Error processing file or updating tags:", error);

        MySwal.fire({
          title: "Error!",
          text: "Failed to process file or update tags.",
          icon: "error",
        });
      }
    };

    if (uploadedFile.name.toLowerCase().endsWith(".csv")) {
      reader.readAsArrayBuffer(uploadedFile);
    } else {
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  return (
    <Modal
      show={assignTagsModalOpen}
      onHide={handleAssignTagsModalClose}
      dialogClassName="assign-tags-modal"
      enforceFocus={false}
    >
      <Modal.Body>
        <div>
          <h2 className="text-center text-xl font-semibold">Assign Tags</h2>
        </div>
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
          onClick={handleAssignTagsModalClose}
        >
          <MdOutlineClose className="text-xl" />
        </button>

        <div>
          <h3 className="text-base font-semibold">Select Tags</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              alignItems: "center",
              marginTop: "5px",
            }}
          >
            {selectedTags.map((tag, index) => (
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
                {tag.tagName}

                <span
                  onClick={() => handleCancelTag(tag)}
                  className="absolute top-0 right-1 hidden group-hover:block hover:cursor-pointer transition-opacity duration-200 text-white"
                >
                  <IoIosCloseCircleOutline size={18} />
                </span>
              </div>
            ))}

            {/* Separate the FaPlus button in its own container */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Popover className="p-0">
                <PopoverTrigger asChild>
                  <button className="rounded-full bg-[#0662BB] text-white flex justify-center items-center ml-0.5 p-0.5">
                    <FaPlus className="text-xs" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-42 p-3 space-y-3">
                  {existingTags.map((tag, index) => (
                    <div key={index}>
                      <button
                        onClick={() => handleTagClick(tag)}
                        className="rounded-full px-2 py-1 text-xs"
                        style={{
                          backgroundColor: tag.colorCode,
                          color: "white",
                        }}
                      >
                        {tag.tagName}
                      </button>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="mt-1">
          <div className="flex  items-center gap-2">
            <h3 className="text-base font-semibold">Upload File</h3>
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
          </div>
          <Upload
            beforeUpload={() => false}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            onRemove={handleFileRemove}
            fileList={fileList}
          >
            <button className="flex justify-center gap-1 items-center px-2 py-1 border text-sm rounded-sm mt-1">
              <FiUpload size={12} /> Upload (.xlsx, .xls, .csv)
            </button>
          </Upload>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            className="text-sm flex items-center gap-1 "
            style={{
              padding: "8px 20px",
              border: "none",
              backgroundColor: "#0662BB",
              borderRadius: "3px",
            }}
            onClick={handleSave}
            // disabled={loading}
          >
            {/* {loading ? "Loading.." : "Submit"} */}
            Save
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AssginTagsModal;
