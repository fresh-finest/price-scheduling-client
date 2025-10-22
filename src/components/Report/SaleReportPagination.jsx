import React from "react";
import { Pagination } from "react-bootstrap";
import SaleReport from "./SaleReport";

const SaleReportPagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageItems = [];
  const visiblePages = 5; // Number of pages to display at a time

  const createEllipsis = (key) => <Pagination.Ellipsis key={key} disabled />;

  // Generate pagination items
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // Always show the first page
      i === totalPages || // Always show the last page
      (i >= currentPage - 2 && i <= currentPage + 2) // Show current and 2 neighbors
    ) {
      pageItems.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    } else if (
      (i === currentPage - 3 && currentPage > 4) || // Ellipsis before the current range
      (i === currentPage + 3 && currentPage < totalPages - 3) // Ellipsis after the current range
    ) {
      pageItems.push(createEllipsis(`ellipsis-${i}`));
    }
  }

  return (
    <Pagination className="justify-content-center pb-3">
      <Pagination.First
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      />
      <Pagination.Prev
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      {pageItems}
      <Pagination.Next
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <Pagination.Last
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
};

export default SaleReportPagination;