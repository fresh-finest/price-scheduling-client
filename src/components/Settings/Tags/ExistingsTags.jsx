import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { FiSave, FiTrash } from "react-icons/fi";
import { PenLine } from "lucide-react";
import Swal from "sweetalert2";
import { ColorPicker, Divider, Row, Col } from "antd";
import { cyan, green, red, generate, presetPalettes } from "@ant-design/colors";
import { theme } from "antd";

const BASE_URL = "http://192.168.0.102:3000";

const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map(([label, colors]) => ({
    label,
    colors,
  }));

const ExistingTags = ({ tagsDataFetch, setTagsDataFetch }) => {
  const { token } = theme.useToken();
  const [tags, setTags] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({
    tagName: "",
    colorCode: "",
  });

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    green,
    cyan,
  });

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tag`);
      setTags(response.data.tag);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (tagsDataFetch) {
      fetchTags();
      setTagsDataFetch(false);
    }
  }, [tagsDataFetch]);

  const customPanelRender = (_, { components: { Picker, Presets } }) => (
    <Row justify="space-between" wrap={false}>
      <Col span={12}>
        <Presets />
      </Col>
      <Divider type="vertical" style={{ height: "auto" }} />
      <Col flex="auto">
        <Picker />
      </Col>
    </Row>
  );

  const handleEditClick = (index, tag) => {
    setEditingRow(index);
    setEditValues({ tagName: tag.tagName, colorCode: tag.colorCode });
  };

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };

  // Handle Save Request
  const handleSave = async (tagId) => {
    try {
      await axios.put(`${BASE_URL}/api/tag/${tagId}`, editValues);
      Swal.fire({
        title: "Updated!",
        text: "Tag has been updated.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      fetchTags(); // Refresh data
      setEditingRow(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating tag:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update tag.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // Handle Delete Request
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
          await axios.delete(`${BASE_URL}/api/tag/${tagId}`);
          Swal.fire({
            title: "Deleted!",
            text: "Tag has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setDeleteLoading(false);
          fetchTags(); // Refresh data
        } catch (error) {
          console.error("Error deleting tag:", error);
          setDeleteLoading(false);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete tag.",
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  return (
    <section className="px-2 py-3 w-[70%] mt-3">
      <h2 className="text-center text-lg font-semibold">Existing Tags</h2>
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
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editingRow === index ? (
                    <Form.Control
                      type="text"
                      className="update-custom-input text-sm text-center"
                      value={editValues.tagName}
                      onChange={(e) => handleInputChange(e, "tagName")}
                    />
                  ) : (
                    tag.tagName
                  )}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editingRow === index ? (
                    // <ColorPicker
                    //   value={editValues.colorCode}
                    //   onChange={(color) =>
                    //     setEditValues({
                    //       ...editValues,
                    //       colorCode: color.toHexString(),
                    //     })
                    //   }
                    //   showText={(color) => <span>{color.toHexString()}</span>}
                    // />

                    <ColorPicker
                      value={editValues.colorCode}
                      presets={presets}
                      panelRender={customPanelRender}
                      onChange={(color) =>
                        setEditValues({
                          ...editValues,
                          colorCode: color.toHexString(),
                        })
                      }
                      showText={(color) => <span>{color.toHexString()}</span>}
                    />
                  ) : (
                    <span
                      style={{
                        backgroundColor: tag.colorCode,
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                      }}
                      className="shadow-sm mx-auto"
                    >
                      {/* {tag.colorCode.toUpperCase()} Displays the color code */}
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex justify-center items-center">
                    {editingRow === index ? (
                      <button
                        onClick={() => handleSave(tag._id)}
                        className="py-1 px-2 rounded-sm bg-[#0662BB] text-white mr-1"
                      >
                        <FiSave size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(index, tag)}
                        className="py-1 px-2 rounded-sm bg-[#0662BB] text-white mr-1"
                      >
                        <PenLine size={20} />
                      </button>
                    )}
                    <Button
                      onClick={() => handleDeleteTag(tag._id)}
                      disabled={deleteLoading}
                      variant="danger"
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
              <td style={{ textAlign: "center", padding: "10px" }} colSpan="3">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ExistingTags;
