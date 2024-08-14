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
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    info: {
      marginBottom: '5px',
      fontSize: '14px',
    },
    tag: {
      display: 'inline-block',
      backgroundColor: '#00c0ef',
      color: '#fff',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '12px',
      marginRight: '5px',
    }
  };

  return (
    <Card style={detailStyles.card}>
      <Card.Img variant="top" src={product.payload.AttributeSets[0].SmallImage.URL} style={detailStyles.image} />
      <Card.Body>
        <Card.Title style={detailStyles.title}>{product.payload.AttributeSets[0].Title}</Card.Title>
        <Card.Text style={detailStyles.info}>
          <strong>SKU:</strong> {product.payload.AttributeSets[0].Model}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>ASIN:</strong> {product.payload.Identifiers.MarketplaceASIN.ASIN}
        </Card.Text>
        <Card.Text style={detailStyles.info}>
          <strong>Price:</strong> ${product.payload.AttributeSets[0].ListPrice.Amount}
        </Card.Text>
      
      </Card.Body>
    </Card>
  );
};

export default ProductDetailView;
