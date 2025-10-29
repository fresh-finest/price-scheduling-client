// BuyBoxFilter.jsx
import React, { useMemo, useState } from "react";
import { Cascader } from "antd";

const BuyBoxFilter = ({ onChange }) => {
  const options = useMemo(
    () => [
      { label: "Sellers", value: "seller", children: [
        { label: "Fresh Finest", value: "fresh" },
        { label: "Others", value: "others" },
      ]},
      { label: "Buy Box", value: "buybox", children: [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ]},
    ],
    []
  );

  const [value, setValue] = useState([]);

  const handleChange = (next) => {
    const latestMap = next.reduce((acc, path) => {
      if (Array.isArray(path) && path.length >= 2) acc[path[0]] = path[1];
      return acc;
    }, {});
    const normalized = Object.entries(latestMap).map(([k, v]) => [k, v]);
    setValue(normalized);

    onChange?.({
      seller: latestMap.seller ?? "all",
      buybox:
        latestMap.buybox === "true" ? true :
        latestMap.buybox === "false" ? false : null,
    });
  };

  return (
    <Cascader
      style={{ width: "100%" }}
      options={options}
      multiple
      value={value}
      onChange={handleChange}
      allowClear
      showCheckedStrategy={Cascader.SHOW_CHILD}
      maxTagCount={999}
      placeholder="Filter by Sellers / Buy Box"
    />
  );
};

export default BuyBoxFilter;
