// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate} from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // This navigates to the previous page
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1>404</h1>
      <h3>Page Not Found</h3>
      <br/>
      <div>
        <Button variant="primary" onClick={handleGoBack} className="me-2">Go Back</Button>
      </div>
    </Container>
  );
};

export default NotFound;
