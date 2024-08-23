import React, { useEffect, useState } from 'react';
import { Card, Table, Button } from 'react-bootstrap';

import EditScheduleFromList from './EditScheduleFromList';

const ProductDetailView = ({ product, listing, asin }) => {
  const [priceSchedule, setPriceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null); // Track which schedule is being edited

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://dps-server-b829cf5871b7.herokuapp.com/api/schedule/${asin}`, {
          method: "GET",
          signal,
        });

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
      marginleft:"10px"
    },
    table: {
      marginTop: '20px',
      width: '100%',
    },
  };

  return (
    <div style={{ width: "100%" }}>
      <Card style={detailStyles.card}>
        <Card.Body>
          <div >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Card.Img variant="top" src={product?.AttributeSets[0]?.SmallImage?.URL} style={detailStyles.image} />
          <Card.Title style={detailStyles.title}>{product?.AttributeSets[0]?.Title}</Card.Title>
          </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft:"40px" }}>
              
              <Card.Text style={detailStyles.info}>
                <strong>ASIN:</strong> {product?.Identifiers?.MarketplaceASIN.ASIN}
              </Card.Text>
              <Card.Text style={detailStyles.info}>
                <strong>, SKU:</strong> {product?.AttributeSets[0]?.Model}
              </Card.Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft:"40px" }}>
            <Card.Text style={detailStyles.info}>
                <strong>Price:</strong> ${price?.Amount}
              </Card.Text>
              <Card.Text style={detailStyles.info}>
                <strong>,  BSR:</strong> {product?.SalesRankings[0]?.Rank}
              </Card.Text>
            </div>
          </div>

          <h4 style={{ marginTop: '20px',fontWeight:"bold" }}>Schedule Details</h4>
          {priceSchedule.length > 0 ? (
            <Table striped bordered hover size="sm" style={detailStyles.table}>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {priceSchedule.map((sc) => (
                  <tr key={sc._id}>
                    <td style={{width:"200px"}}>{new Date(sc.startDate).toLocaleString()} <span style={{color:"green"}}>Changed Price: ${sc.price}</span></td>
                    <td style={{width:"200px"}}>
                  {sc.endDate ? (
                    < >
                      {new Date(sc.endDate).toLocaleString()}
                      {sc.currentPrice && (
                        <p style={{color: "green" }}>
                          Reverted Price: ${sc.currentPrice}
                        </p>
                      )}
                    </>
                  ) : (
                    <span style={{color:"red"}}>Until Changed</span>
                  )}
                </td>
                    <td>
                      <Button variant="secondary" style={{marginTop:"20px"}} onClick={() => handleEdit(sc)}>
                        Update 
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
