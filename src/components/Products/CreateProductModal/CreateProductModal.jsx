import { Button, Form, Modal } from "react-bootstrap";
import "./CreateProductModal.css";
import { MdOutlineClose } from "react-icons/md";

const CreateProductModal = ({
  isModalOpen,
  setModalOpen,
  handleInputChange,
  handleCreateProduct,
  newProduct,
}) => {
  return (
    <Modal
      dialogClassName="create-product-modal"
      show={isModalOpen}
      onHide={() => setModalOpen(false)}
    >
      <Modal.Body>
        <div>
          <h2 className="text-center text-xl font-semibold">Create Product</h2>
        </div>
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
          onClick={() => setModalOpen(false)}
        >
          <MdOutlineClose className="text-xl" />
        </button>
        <Form>
          <Form.Group className="my-3">
            <Form.Control
              className="update-custom-input "
              type="text"
              placeholder="Product Name"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              className="update-custom-input "
              type="text"
              placeholder="Product Title"
              name="title"
              value={newProduct.title}
              onChange={handleInputChange}
            />
          </Form.Group>
          {/* <Form.Group className="mb-3">
            <Form.Control
              className="update-custom-input"
              type="text"
              placeholder="Enter product image URL"
              name="imageUrl"
              value={newProduct.imageUrl}
              onChange={handleInputChange}
            />
          </Form.Group> */}
          <Form.Group className="mb-3">
            <Form.Control
              className="update-custom-input"
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
        <Button
          onClick={handleCreateProduct}
          className="text-sm flex items-center gap-1 "
          style={{
            padding: "8px 20px",
            border: "none",
            backgroundColor: "#0662BB",
            borderRadius: "3px",
          }}
          // disabled={loading}
          // type="submit"
        >
          {/* {loading ? "Loading.." : "Submit"} */}
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateProductModal;
