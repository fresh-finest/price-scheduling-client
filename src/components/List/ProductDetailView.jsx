import React, { useEffect, useState } from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import { LuPencilLine } from "react-icons/lu";
import axios from 'axios';
import { useSelector } from 'react-redux';

import EditScheduleFromList from './EditScheduleFromList';

// const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com'
// const BASE_URL = `https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://100.26.185.72:3000`;
const BASE_URL = 'https://price-scheduling-server-2.onrender.com'
// const BASE_URL ='http://localhost:3000'



const daysOptions = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tues', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thurs', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];
const datesOptions = [
  { label: '1st', value: 1 },
  { label: '2nd', value: 2 },
  { label: '3rd', value: 3 },
  { label: '4th', value: 4 },
  { label: '5th', value: 5 },
  { label: '6th', value: 6 },
  { label: '7th', value: 7 },
  { label: '8th', value: 8 },
  { label: '9th', value: 9 },
  { label: '10th', value: 10 },
  { label: '11th', value: 11 },
  { label: '12th', value: 12 },
  { label: '13th', value: 13 },
  { label: '14th', value: 14 },
  { label: '15th', value: 15 },
  { label: '16th', value: 16 },
  { label: '17th', value: 17 },
  { label: '18th', value: 18 },
  { label: '19th', value: 19 },
  { label: '20th', value: 20 },
  { label: '21st', value: 21 },
  { label: '22nd', value: 22 },
  { label: '23rd', value: 23 },
  { label: '24th', value: 24 },
  { label: '25th', value: 25 },
  { label: '26th', value: 26 },
  { label: '27th', value: 27 },
  { label: '28th', value: 28 },
  { label: '29th', value: 29 },
  { label: '30th', value: 30 },
  { label: '31st', value: 31 },
];
const ProductDetailView = ({ product, listing, asin, sku }) => {
  const [priceSchedule, setPriceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null); // Track which schedule is being edited

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || '';

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const getDayLabels = (daysOfWeek) => {
    return daysOfWeek
      .map((day) => daysOptions.find((option) => option.value === day)?.label)
      .join(', ');
  };
  const getDateLabels = (datesOfMonth) => {
    return datesOfMonth
      .map((date) => datesOptions.find((option) => option.value === date)?.label)
      .join(', ');
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const getData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/schedule/${asin}`);
        const sortedData = response.data.result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPriceSchedule(sortedData);

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        setPriceSchedule(data.result || []); 
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching data:", err);
          setError('Error fetching schedule data.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (asin) {
      getData();
    }

    return () => {
      controller.abort(); 
    };
  }, [asin]);

  const handleEdit = (schedule) => {
    setEditSchedule(schedule); // Set the schedule to be edited
  };

  const handleClose = () => {
    setEditSchedule(null); // Close the edit modal
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const price = listing?.payload?.[0]?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice;

  const detailStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    image: {
      width: '90px',
      maxHeight: '90px',
      objectFit: 'contain',
      marginBottom: '10px',
      marginRight: '20px',
    },
    card: {
      padding: '20px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      width: '100%',
    },
    title: {
      fontSize: '16px',
      marginBottom: '15px',
      textAlign: 'left',
    },
    info: {
      fontSize: '14px',
      marginBottom: '5px',
      marginLeft: "10px"
    },
    tableContainer: {
      marginTop: '20px',
      width: '100%',
      maxHeight: '420px', // Set a max height for the table container
      overflowY: 'scroll', // Enable vertical scrolling
      overflowX: 'hidden',
    },
    table: {
      width: '100%',
      marginBottom: 0,
    },
  };

  const now = new Date();

  return (
    <div style={{ width: "100%" }}>
      <Card style={detailStyles.card}>
        <Card.Body>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Card.Img variant="top" src={product?.AttributeSets[0]?.SmallImage?.URL} style={detailStyles.image} />
              <Card.Title style={detailStyles.title}>{product?.AttributeSets[0]?.Title}</Card.Title>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft: "40px" }}>
              <Card.Text style={detailStyles.info}>
                <strong>ASIN:</strong> {product?.Identifiers?.MarketplaceASIN.ASIN}
              </Card.Text>
              <Card.Text style={detailStyles.info}>
                <strong>, SKU:</strong> {product?.AttributeSets[0]?.Model}
              </Card.Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft: "40px" }}>
              <Card.Text style={detailStyles.info}>
                <strong>Price:</strong> ${price?.Amount}
              </Card.Text>
              <Card.Text style={detailStyles.info}>
                <strong>, BSR:</strong> {product?.SalesRankings[0]?.Rank}
              </Card.Text>
            </div>
          </div>

          <h4 style={{ marginTop: '20px', fontWeight: "bold" }}>Schedule Details</h4>
          {priceSchedule.length > 0 ? (
            <div style={detailStyles.tableContainer}>
              <Table striped bordered hover size="sm" style={detailStyles.table}>
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {priceSchedule
                    .filter(sc =>  sc.status !== 'deleted' &&(sc.weekly  || sc.endDate === null || (sc.endDate && new Date(sc.endDate) >= now)))

                    .map((sc) => (
                      <tr key={sc._id}>
                        {sc.weekly ? (
                          <>
                            <td style={{ width: "200px" }} colSpan={2}>
                              Weekly on {getDayLabels(sc.daysOfWeek)} <div style={{display:"flex",justifyContent: "space-between", marginRight:"20px",marginLeft:"20px"}}><p style={{ color: "green" }}>  ${sc.price}</p> { } <span style={{ color: "green" }}> ${sc.currentPrice}</span></div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ width: "200px" }}>{formatDateTime(sc.startDate)} <span style={{ color: "green" }}>Changed Price: ${sc.price}</span></td>
                            <td style={{ width: "200px" }}>
                              {sc.endDate ? (
                                <>
                                  {(formatDateTime(sc.endDate))}
                                  {sc.currentPrice && (
                                    <p style={{ color: "green" }}>
                                      Reverted Price: ${sc.currentPrice}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <span style={{ color: "red" }}>Until Changed</span>
                              )}
                            </td>
                          </>
                        )}
                        <td>
                          <Button 
                            style={{ marginTop: "20px", backgroundColor: "#5AB36D", border: "none" }} 
                            onClick={() => handleEdit(sc)}
                            disabled={!sc.weekly  && (sc.endDate != null && ((sc.endDate && new Date(sc.endDate)) < now)) || (!currentUser?.permissions?.write)} // Disable button if endDate is in the past
                          >
                            <LuPencilLine />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p>No schedule available for this ASIN.</p>
          )}
        </Card.Body>
      </Card>

      {editSchedule && (
        <EditScheduleFromList
          show={!!editSchedule}
          onClose={handleClose}
          asin={asin}
          existingSchedule={editSchedule}
        />
      )}
    </div>
  );
};

export default ProductDetailView;
