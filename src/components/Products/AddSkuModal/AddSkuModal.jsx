import { Button, Form, Modal } from "react-bootstrap";
import "./AddSkuModal.css";
import { MdOutlineClose } from "react-icons/md";
import { Tooltip } from "antd";
import { BsFillInfoSquareFill } from "react-icons/bs";
import addSkuImage from "../../../assets/images/add_sku.png";
import { TbFileDownload } from "react-icons/tb";
import * as XLSX from "xlsx";
const AddSkuModal = ({
  isSkuModalOpen,
  setSkuModalOpen,
  newSku,
  setNewSku,
  handleExcelUpload,
  handleAddSku,
}) => {
  const handleDownloadTemplate = () => {
    const headers = [["sku", "uom"]];

    const ws = XLSX.utils.aoa_to_sheet(headers);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SKU_Template");

    XLSX.writeFile(wb, "sku.xlsx");
  };
  return (
    <Modal
      dialogClassName="add-sku-modal"
      show={isSkuModalOpen}
      onHide={() => setSkuModalOpen(false)}
    >
      <div>
        <h2 className="text-center text-xl font-semibold my-2">Add SKUs</h2>
      </div>
      <button
        className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
        onClick={() => setSkuModalOpen(false)}
      >
        <MdOutlineClose className="text-xl" />
      </button>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal">SKU</Form.Label>
            <Form.Control
              className="update-custom-input "
              type="text"
              placeholder="Enter SKU"
              name="sku"
              value={newSku.sku}
              onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal">UOM</Form.Label>
            <Form.Control
              className="update-custom-input "
              type="text"
              placeholder="Enter UOM"
              name="uom"
              value={newSku.uom}
              onChange={(e) => setNewSku({ ...newSku, uom: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal flex justify-start items-center gap-1 ">
              Or Upload Excel
              <Tooltip
                placement="bottom"
                title={
                  <div>
                    <p className="text-lg">
                      Supported formats: <strong>.xlsx</strong>
                    </p>
                    <p className="text-base">
                      Please ensure the file contains valid SKUs in the first
                      column.
                    </p>
                    <img
                      src={addSkuImage}
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
              <button
                type="button"
                className="inline"
                onClick={handleDownloadTemplate}
              >
                <TbFileDownload className="text-xl" />
              </button>
            </Form.Label>
            <Form.Control
              className="update-custom-input "
              type="file"
              accept=".xlsx"
              onChange={handleExcelUpload}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          className="text-sm flex items-center gap-1 "
          style={{
            padding: "8px 20px",
            border: "none",
            backgroundColor: "#d33 ",
            borderRadius: "3px",
          }}
          variant="secondary"
          onClick={() => setSkuModalOpen(false)}
        >
          Cancel
        </Button>
        <Button
          className="text-sm flex items-center gap-1 "
          style={{
            padding: "8px 20px",
            border: "none",
            backgroundColor: "#0662BB",
            borderRadius: "3px",
          }}
          onClick={handleAddSku}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSkuModal;
