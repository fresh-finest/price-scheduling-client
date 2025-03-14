import { Button, Form, Modal } from "react-bootstrap";
import "./EditSkuModal.css";
import { MdOutlineClose } from "react-icons/md";

const EditSkuModal = ({
  isModal,
  setIsModal,
  newSku,
  setNewSku,
  handleCancelSku,
  handleReplaceSku,
}) => {
  return (
    <Modal
      dialogClassName="edit-sku-modal"
      show={isModal}
      onHide={() => setIsModal(false)}
    >
      <Modal.Body>
        <div>
          <h2 className="text-center text-xl font-semibold">Edit SKU</h2>
        </div>
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
          onClick={() => setIsModal(false)}
        >
          <MdOutlineClose className="text-xl" />
        </button>
        <Form>
          <Form.Group className="my-3">
            <Form.Control
              className="update-custom-input "
              placeholder="Current SKU"
              type="text"
              value={newSku.sku}
              readOnly
              disabled
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              className="update-custom-input "
              type="text"
              placeholder="New SKU (Optional for Replace)"
              value={newSku.newSku || ""}
              onChange={(e) => setNewSku({ ...newSku, newSku: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              className="update-custom-input "
              type="number"
              placeholder="UOM (Unit of Measure)"
              value={newSku.uom || ""}
              onChange={(e) =>
                setNewSku({ ...newSku, uom: parseInt(e.target.value, 10) })
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleCancelSku}>
          Cancel SKU
        </Button>
        <Button variant="primary" onClick={handleReplaceSku}>
          Replace SKU
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSkuModal;
