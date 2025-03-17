import { Button, Form, Modal } from "react-bootstrap";
import "./AddSkuModal.css";
import { MdOutlineClose } from "react-icons/md";
const AddSkuModal = ({
  isSkuModalOpen,
  setSkuModalOpen,
  newSku,
  setNewSku,
  handleExcelUpload,
  handleAddSku,
}) => {
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
            <Form.Label className="text-sm font-normal">
              Or Upload Excel
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
          //   disabled={isLoading}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSkuModal;
