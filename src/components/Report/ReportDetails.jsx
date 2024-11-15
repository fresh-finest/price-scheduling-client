import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Table, Button, ButtonGroup, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ReportDetails = () => {
  const { sku } = useParams();
  const [reportsdata, setReportsdata] = useState([]);
  const [filter, setFilter] = useState('single'); // default filter

  // Fetch data from the API
  useEffect(() => {
    fetch(`http://localhost:3000/api/report/${sku}`)
      .then(response => response.json())
      .then(data => setReportsdata(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [sku]);

  // Conditional rendering based on filter
  const filteredReports = reportsdata?.filter(report => {
    if (filter === 'weekly') return report.weekly;
    if (filter === 'monthly') return report.monthly;
    return !report.weekly && !report.monthly;
  });

  return (
    <Container>
      <Row className="justify-content-end mt-3">
        <Col xs="auto">
          <ButtonGroup>
            <Button variant="outline-primary" onClick={() => setFilter('single')}>By Single</Button>
            <Button variant="outline-primary" onClick={() => setFilter('weekly')}>By Week</Button>
            <Button variant="outline-primary" onClick={() => setFilter('monthly')}>By Month</Button>
          </ButtonGroup>
        </Col>
      </Row>
      
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Interval</th>
            <th>Price</th>
            <th>Unit Count</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(report => (
            <tr key={report._id}>
              <td>{report.interval}</td>
              <td>${report.price}</td>
              <td>{report.unitCount}</td>
             
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ReportDetails;
