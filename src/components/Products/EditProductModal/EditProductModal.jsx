import { Button, Form, Modal } from "react-bootstrap";
import "./EditProductModal.css";
import { MdOutlineClose } from "react-icons/md";
import { FiTrash } from "react-icons/fi";

const EditProductModal = ({
  isEditModalOpen,
  setEditModalOpen,
  editProduct,
  setEditProduct,
  handleEditProduct,
  handleDeleteProduct,
}) => {
  return (
    <Modal
      dialogClassName="edit-product-modal"
      show={isEditModalOpen}
      onHide={() => setEditModalOpen(false)}
    >
      <div>
        <h2 className="text-center text-xl font-semibold my-2">Edit Product</h2>
      </div>
      <button
        className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
        onClick={() => setEditModalOpen(false)}
      >
        <MdOutlineClose className="text-xl" />
      </button>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal">Name</Form.Label>
            <Form.Control
              type="text"
              className="update-custom-input "
              placeholder="Enter product name"
              name="name"
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal">Title</Form.Label>
            <Form.Control
              type="text"
              className="update-custom-input "
              placeholder="Enter product title"
              name="title"
              value={editProduct.title}
              onChange={(e) =>
                setEditProduct({ ...editProduct, title: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal">Image URL</Form.Label>
            <Form.Control
              type="text"
              className="update-custom-input "
              placeholder="Enter product image URL"
              name="imageUrl"
              value={editProduct.imageUrl}
              onChange={(e) =>
                setEditProduct({ ...editProduct, imageUrl: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-sm font-normal">Cost</Form.Label>
            <Form.Control
              type="number"
              className="update-custom-input "
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
        <Button
          className="text-sm flex items-center gap-1 "
          style={{
            padding: "8px 20px",
            border: "none",
            borderRadius: "3px",
          }}
          variant="secondary"
          onClick={() => setEditModalOpen(false)}
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
          onClick={handleEditProduct}
        >
          Save
        </Button>
        {/* <Button variant="danger" onClick={handleDeleteProduct}>
          Delete Product
        </Button> */}

        <Button
          onClick={handleDeleteProduct}
          style={{
            padding: "9px 20px",
          }}
          variant="danger"
          size="md"
          className="rounded-sm"
        >
          <FiTrash />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
