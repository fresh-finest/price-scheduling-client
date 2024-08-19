import React from 'react';
import { Card } from 'react-bootstrap';

const ProductDetailView = ({ product,listing }) => {

  const price = listing?.payload?.[0]?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice;
  console.log(price);
  const detailStyles = {
    image: {
      width: '90px',
      maxHeight: '90px',
      objectFit: 'contain',
      marginBottom: '10px',
    },
    card: {
      padding: '15px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      width: '100%',
    },
    title: {
      fontSize: '16px', // Slightly larger for emphasis
      marginBottom: '15px',
    },
    info: {
      marginBottom: '10px',
      fontSize: '14px',
    },
    tag: {
      display: 'inline-block',
      backgroundColor: '#00c0ef',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      marginRight: '8px',
    }
  };

  return (
   <div style={{position:'fixed', width:"450px"}}>
     <Card style={detailStyles.card}>
      
      <Card.Body>
      <div style={{display:"flex", alignItem:"center"}}>
      <Card.Img variant="top" src={product?.AttributeSets[0]?.SmallImage?.URL} style={detailStyles.image} />
      <Card.Title style={detailStyles.title}>{product?.AttributeSets[0]?.Title}</Card.Title>
      </div>
        <div style={{display:"flex"}}>
        <Card.Text style={detailStyles.info}>
          <strong>SKU:</strong> {product?.AttributeSets[0]?.Model}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>, SIN:</strong> {product?.Identifiers?.MarketplaceASIN.ASIN}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>,  Price:</strong> ${price?.Amount}
        </Card.Text>
        </div>
        {/* Additional Information */}
        {/* <Card.Text style={detailStyles.info}>
          <strong>Brand:</strong> {product?.AttributeSets[0]?.Brand}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>Manufacturer:</strong> {product?.AttributeSets[0]?.Manufacturer}
        </Card.Text> */}
        <Card.Text style={detailStyles.info}>
          <strong>BSR:</strong> {product?.SalesRankings[0]?.Rank}
        </Card.Text>
      </Card.Body>
    </Card>
   </div>
  );
};

export default ProductDetailView;
