import { Button, Form, Modal } from "react-bootstrap";
import "./BulkMappingModal.css";
import { MdOutlineClose } from "react-icons/md";
import { Tooltip } from "antd";
import { BsFillInfoSquareFill } from "react-icons/bs";
import skuImage from "../../../assets/images/skus.png";
const BulkMappingModal = ({
  isBulkModalOpen,
  setBulkModalOpen,
  handleExcelUploadForBulkMapping,
  handleBulkSkuMapping,
  isLoading,
}) => {
  return (
    <Modal
      show={isBulkModalOpen}
      onHide={() => setBulkModalOpen(false)}
      dialogClassName="bulk-mapping-modal"
    >
      <Modal.Body>
        <div>
          <h2 className="text-center text-xl font-semibold">Bulk Map SKUs</h2>
        </div>
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
          onClick={() => setBulkModalOpen(false)}
        >
          <MdOutlineClose className="text-xl" />
        </button>
        <Form>
          <Form.Group className="">
            <div className="flex items-center my-3 gap-2">
              <h3 className="text-base font-semibold">Upload Excel File</h3>
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
            <Form.Control
              type="file"
              accept=".xlsx"
              onChange={handleExcelUploadForBulkMapping}
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
          onClick={() => setBulkModalOpen(false)}
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
          onClick={handleBulkSkuMapping}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkMappingModal;
