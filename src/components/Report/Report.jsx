import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// const baseUrl = useSelector((state) => state.baseUrl.baseUrl);



const BASE_URL = "http://localhost:3000";

// const BASE_URL = `https://api.priceobo.com`;

const Report = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/schedule`);
        setListings(response.data.result);
      } catch (err) {
        setError("Error fetching schedule data");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSkuClick = (sku) => {
    navigate(`/report/${sku}`);
  };

  if (loading) {
    return <p>Loading listings...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Image</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Unit Count</th>
        </tr>
      </thead>
      <tbody>
        {listings.map((listing) => (
          <tr key={listing._id}>
            <td>
              <Image src={listing.imageURL} alt={listing.itemName} width={30} height={30} />
            </td>
            <td  style={{ color: "blue", cursor: "pointer" }}
              onClick={() => handleSkuClick(listing.sku)} >{listing.sku}</td>
            <td>${listing.price ? listing.price.toFixed(2) : "N/A"}</td>
            <td>
              {listing.salesMetrics && listing.salesMetrics.length > 0 ? (
                <>
                  <div> {listing.salesMetrics[0].totalUnits}</div>
                </>
              ) : (
                "No Sales Data"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Report;
