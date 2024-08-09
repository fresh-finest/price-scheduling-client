import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function NavScrollExample() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <Navbar.Brand href="#" style={{ color: 'white' }}>Fresh Finest</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/list" style={{ color: 'white' }}>List</Nav.Link>
            <Nav.Link as={NavLink} to="/calendar" style={{ color: 'white' }}>Calendar View</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/login" style={{ color: 'white' }}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;
