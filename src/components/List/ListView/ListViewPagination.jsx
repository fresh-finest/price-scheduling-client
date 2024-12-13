import React from "react";
import { Pagination } from "react-bootstrap";

const ListViewPagination = ({
  handlePageChange,
  currentPage,
  totalPages,
  renderPaginationButtons,
}) => {
  return (
    <Pagination className=" flex mb-3 justify-center">
      <Pagination.First onClick={() => handlePageChange(1)} />
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
      />
      {renderPaginationButtons()}
      <Pagination.Next
        onClick={() =>
          handlePageChange(
            currentPage < totalPages ? currentPage + 1 : totalPages
          )
        }
      />
      <Pagination.Last onClick={() => handlePageChange(totalPages)} />
    </Pagination>
  );
};

export default ListViewPagination;