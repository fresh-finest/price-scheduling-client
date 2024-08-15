import React from 'react';
import { Card } from 'react-bootstrap';

const ProductDetailView = ({ product }) => {
  const detailStyles = {
    image: {
      width: '100%',
      maxHeight: '200px',
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
      fontWeight: 'bold',
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
      <Card.Img variant="top" src={product?.AttributeSets[0]?.SmallImage?.URL} style={detailStyles.image} />
      <Card.Body>
        <Card.Title style={detailStyles.title}>{product?.AttributeSets[0]?.Title}</Card.Title>
        <Card.Text style={detailStyles.info}>
          <strong>SKU:</strong> {product?.AttributeSets[0]?.Model}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>ASIN:</strong> {product?.Identifiers?.MarketplaceASIN.ASIN}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>Price:</strong> ${product?.AttributeSets[0]?.ListPrice?.Amount}
        </Card.Text>
        {/* Additional Information */}
        <Card.Text style={detailStyles.info}>
          <strong>Brand:</strong> {product?.AttributeSets[0]?.Brand}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>Manufacturer:</strong> {product?.AttributeSets[0]?.Manufacturer}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>Ranking:</strong> #{product?.SalesRankings[0]?.Rank} in {product?.SalesRankings[0]?.ProductCategoryId}
        </Card.Text>
      </Card.Body>
    </Card>
   </div>
  );
};

export default ProductDetailView;
