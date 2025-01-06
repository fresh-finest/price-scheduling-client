import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { PenLine } from "lucide-react";
import { FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";

const BASE_URL = "http://192.168.0.102:3000";
// const BASE_URL = `https://api.priceobo.com`;

const ExistingTags = ({ tagsDataFetch, setTagsDataFetch }) => {
  const [tags, setTags] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tag`);
      console.log("response", response);
      setTags(response.data.tag);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  console.log("tags data fetch from existings tags", tagsDataFetch);

  useEffect(() => {
    if (tagsDataFetch) {
      fetchTags();
      setTagsDataFetch(false);
    }
  }, [tagsDataFetch]);

  console.log("tags", tags);

  const deleteTag = async (tagId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/tag/${tagId}`);

      return response.data;
    } catch (error) {
      console.error(
        "Error deleting tag:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const handleDeleteTag = (tagId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeleteLoading(true);
        try {
          await deleteTag(tagId);

          Swal.fire({
            title: "Deleted!",
            text: "Tags has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setDeleteLoading(false);
          fetchTags();
        } catch (error) {
          const errorMessage = error.response
            ? error.response.data.error
            : error.message;

          console.error(error);
          setDeleteLoading(false);
          Swal.fire({
            title: "Error!",
            text: `Failed to delete tags: ${errorMessage}`,
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  return (
    <section className="px-2 py-3  w-[70%] mt-3">
      <div>
        <h2 className="text-center text-lg font-semibold">Existing Tags</h2>
      </div>

      <section
        className="mt-3"
        // style={{
        //   maxHeight: "91vh",
        //   overflowY: "auto",
        //   marginTop: "50px",
        //   boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        // }}
      >
        <table
          style={{
            tableLayout: "fixed",
          }}
          className="reportCustomTable table"
        >
          <thead
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            <tr>
              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Tag Name
              </th>
              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Tag Color
              </th>

              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tags && tags.length > 0 ? (
              tags.map((tag, index) => (
                <tr key={index}>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: `${tag.colorCode}`,
                        padding: "5px",
                        borderRadius: "5px",
                        color: "white",
                      }}
                    >
                      {tag.tagName}
                    </span>
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span

                    //   className={`bg-[${`${tag.colorCode}`}] px-2 py-1 rounded-sm`}
                    >
                      {tag.colorCode}
                    </span>

                    {/* <span className="bg-[#69b1ff]"> hello</span> */}
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div className="flex justify-center items-center">
                      <button
                        className={`py-1 px-2 rounded-sm mr-1 ${"bg-[#0662BB]"}`}
                      >
                        <PenLine size={20} className="text-white" />
                      </button>

                      <Button
                        onClick={() => handleDeleteTag(tag._id)}
                        disabled={deleteLoading}
                        variant="danger"
                        size="md"
                        className="rounded-sm"
                      >
                        <FiTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </section>
  );
};

export default ExistingTags;
