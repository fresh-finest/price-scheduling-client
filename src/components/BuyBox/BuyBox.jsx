// BuyBox.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { InputGroup, Form, Pagination } from "react-bootstrap";
import { MdOutlineClose } from "react-icons/md";
import { HiMagnifyingGlass } from "react-icons/hi2";
import BuyBoxTable from "./BuyBoxTable";
import BuyBoxFilter from "./BuyBoxFilter";

// const BASE_URL = "http://192.168.0.8:3000";
const BASE_URL = "https://api.priceobo.com";

const DEFAULT_LIMIT = 50;

const BuyBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // filters
  const [seller, setSeller] = useState("all");      // "all" | "fresh" | "others"
  const [buybox, setBuybox] = useState(null);       // true | false | null

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // const fetchData = useCallback(async (pageNum = 1) => {
  //   setLoading(true);
  //   setErr(null);
  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/buy-box`, {
  //       params: {
  //         page: pageNum,
  //         limit: DEFAULT_LIMIT,
  //         q: searchTerm.trim() || undefined,
  //         seller: seller && seller !== "all" ? seller : undefined,
  //         buybox: typeof buybox === "boolean" ? buybox : undefined,
  //       },
  //     });

  //     const payload = res.data || {};
  //     setItems(payload.result || []);
  //     setTotalPages(payload.pages || 1);
  //     setTotal(payload.total || 0);
  //   } catch (e) {
  //     setErr(e?.message || "Failed to load buy box data");
  //     setItems([]);
  //     setTotalPages(1);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [seller, buybox, searchTerm]);

  const fetchData = useCallback(async (pageNum = 1) => {
  setLoading(true);
  setErr(null);
  try {
    const res = await axios.get(`${BASE_URL}/api/buy-box`, {
      params: {
        page: pageNum,
        limit: DEFAULT_LIMIT,
        q: searchTerm.trim() || undefined,
        seller: seller && seller !== "all" ? seller : undefined,
        buybox: typeof buybox === "boolean" ? buybox : undefined,
      },
    });
    const payload = res.data || {};
    setItems(payload.result || []);
    setTotalPages(payload.pages || 1);
    setTotal(payload.total || 0);
  } catch (e) {
    setErr(e?.message || "Failed to load buy box data");
    setItems([]);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
}, [seller, buybox, searchTerm]);


  // useEffect(() => {
  //   fetchData(1);
  //   setPage(1);
  // }, [fetchData]);

  useEffect(() => {
  fetchData(page);
}, [fetchData, page]);

  const handleSearchClick = () => {
    // fetchData(1);
    setPage(1);
  };
  const handleKeyDown = (e) => e.key === "Enter" && handleSearchClick();
  const handleClearInput = () => {
    setSearchTerm("");
    fetchData(1);
    setPage(1);
  };

  // 👇 NEW: receive filter changes from Cascader
  const handleFilterChange = ({ seller: s, buybox: b }) => {
    setSeller(s ?? "all");
    setBuybox(b ?? null);
    setPage(1);
    // fetchData(1);
  };

  const renderPaginationButtons = () => {
    const maxAround = 1;
    const arr = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - maxAround && i <= page + maxAround)) {
        arr.push(i);
      } else if (arr[arr.length - 1] !== "...") arr.push("...");
    }
    return arr.map((p, idx) =>
      p === "..." ? (
        <Pagination.Ellipsis key={`e${idx}`} disabled />
      ) : (
        <Pagination.Item
          key={p}
          active={p === page}
          onClick={() => {
            if (p !== page) {
              setPage(p);
              fetchData(p);
            }
          }}
        >
          {p}
        </Pagination.Item>
      )
    );
  };

  return (
    <div>
      {/* Search */}
      <div className="w-[500px] absolute top-[11px]">
        <InputGroup className="relative">
          <Form.Control
            type="text"
            placeholder="Search by SKU / ASIN / Title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ borderRadius: 0 }}
            className="custom-input"
          />
          <button className="px-3 py-2 bg-gray-300" onClick={handleSearchClick}>
            <HiMagnifyingGlass />
          </button>
          {searchTerm && (
            <button
              onClick={handleClearInput}
              className="absolute right-16 top-1 p-1 z-10 text-xl rounded transition duration-500 text-black"
            >
              <MdOutlineClose />
            </button>
          )}
        </InputGroup>
      </div>

      {/* Filters */}
      <div className="w-[350px] absolute left-[40vw] top-[13px]">
        <BuyBoxFilter onChange={handleFilterChange} />
      </div>

      {/* Table */}
      <section
        style={{ maxHeight: "91vh", overflowY: "auto", marginTop: 50, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
      >
        <table style={{ tableLayout: "fixed" }} className="reportCustomTable table">
          <thead style={{ backgroundColor: "#f0f0f0", color: "#333", fontFamily: "Arial, sans-serif", fontSize: 14 }}>
            <tr>
              <th className="tableHeader" style={{ width: 100, textAlign: "center", borderRight: "2px solid #C3C6D4" }}>
                Image
              </th>
              <th className="tableHeader" style={{ width: 420, textAlign: "center", borderRight: "2px solid #C3C6D4" }}>
                Product
              </th>
              <th className="tableHeader" style={{ width: 140, textAlign: "center", borderRight: "2px solid #C3C6D4" }}>
                Landed Price
              </th>
              <th className="tableHeader" style={{ width: 200, textAlign: "center", borderRight: "2px solid #C3C6D4" }}>
                Fresh Finest
              </th>
              <th className="tableHeader" style={{ width: 200, textAlign: "center" }}>Other</th>
            </tr>
          </thead>

          {loading ? (
            <tbody><tr><td colSpan={5} style={{ textAlign: "center", padding: 30 }}>Loading…</td></tr></tbody>
          ) : err ? (
            <tbody><tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#b00020" }}>{err}</td></tr></tbody>
          ) : items.length ? (
            <BuyBoxTable rows={items} />
          ) : (
            <tbody><tr><td colSpan={5} style={{ textAlign: "center", padding: 30 }}>No data found</td></tr></tbody>
          )}
        </table>

        {!loading && totalPages > 1 && (
          <Pagination className="flex mb-3 justify-center">
            <Pagination.First onClick={() => page !== 1 && (setPage(1), fetchData(1))} />
            <Pagination.Prev onClick={() => page > 1 && (setPage(page - 1), fetchData(page - 1))} />
            {renderPaginationButtons()}
            <Pagination.Next onClick={() => page < totalPages && (setPage(page + 1), fetchData(page + 1))} />
            <Pagination.Last onClick={() => page !== totalPages && (setPage(totalPages), fetchData(totalPages))} />
          </Pagination>
        )}
      </section>
    </div>
  );
};

export default BuyBox;