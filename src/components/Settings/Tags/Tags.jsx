import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { cyan, generate, green, presetPalettes, red } from "@ant-design/colors";
import { Col, ColorPicker, Divider, Row, Space, theme } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import ExistingsTags from "./ExistingsTags";
import { set } from "lodash";

// const BASE_URL = "http://192.168.0.102:3000";
const BASE_URL = `https://api.priceobo.com`;

// Generate Preset Colors
const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map(([label, colors]) => ({
    label,
    colors,
  }));

const Tags = () => {
  const { token } = theme.useToken();
  const [tagName, setTagName] = useState("");
  const [color, setColor] = useState(token.colorPrimary);
  const [loading, setLoading] = useState(false);
  const [tagsDataFetch, setTagsDataFetch] = useState(false);

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    green,
    cyan,
  });

  // Custom Panel Render
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tagName,
      colorCode: color.toHexString ? color.toHexString() : color,
    };

    console.log("payload", payload);

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/api/tag`, payload);
      console.log("response", response);
      if (response.data) {
        Swal.fire({
          title: "Tag created successfully!",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        });

        setLoading(false);
        setTagsDataFetch(true);
        setTagName("");
        setColor(token.colorPrimary);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error creating tag:", error);
      setTagsDataFetch(false);

      Swal.fire({
        title: error && error.message,
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-3 ml-2">
      <div>
        <h2 className="text-xl  font-semibold">Tags</h2>
        <hr className="text-gray-400 mt-2" />
      </div>
      <div className="flex gap-3">
        <form
          onSubmit={handleSubmit}
          className="mt-3 px-3 py-3 shadow-sm w-[450px] h-[200px] rounded-md"
        >
          <h3 className="text-lg text-center font-semibold mb-2">Create Tag</h3>

          <Form.Control
            className="update-custom-input"
            type="text"
            value={tagName} // Bind input value to state
            placeholder="Tag Name"
            onChange={(e) => setTagName(e.target.value)}
            required
          />
          <div className="flex justify-start items-center gap-2 mt-2">
            <ColorPicker
              value={color}
              styles={{ popupOverlayInner: { width: 480 } }}
              presets={presets}
              panelRender={customPanelRender}
              showText={(color) => (
                <span>{color.toHexString ? color.toHexString() : color}</span>
              )}
              onChange={setColor}
            />
          </div>

          <div className="w-full flex justify-end mt-3">
            <Button
              className="text-sm flex items-center gap-1"
              disabled={loading}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor: "#0662BB",
                borderRadius: "3px",
              }}
              type="submit"
            >
              {loading ? "Loading.." : "Submit"}
            </Button>
          </div>
        </form>

        <ExistingsTags
          tagsDataFetch={tagsDataFetch}
          setTagsDataFetch={setTagsDataFetch}
        ></ExistingsTags>
      </div>
    </section>
  );
};

export default Tags;