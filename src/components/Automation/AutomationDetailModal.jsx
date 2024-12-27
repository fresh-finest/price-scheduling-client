import React from "react";
import { Modal } from "react-bootstrap";
import "./AutomationDetailModal.css";
import { MdOutlineClose } from "react-icons/md";

const AutomationDetailModal = ({
  automationDetailModalShow,
  setAutomationDetailModalShow,
  handleAutomationDetailModalClose,
}) => {
  return (
    <div>
      <Modal
        show={automationDetailModalShow}
        onHide={handleAutomationDetailModalClose}
        dialogClassName="automation-detail-modal"
      >
        <Modal.Body>
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleAutomationDetailModalClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AutomationDetailModal;
