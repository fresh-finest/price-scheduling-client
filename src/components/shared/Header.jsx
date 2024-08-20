import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';


import {
 
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  
} from "../../redux/user/userSlice";

function Header() {

  
  const { currentUser, error } = useSelector((state) => state.user);
  const role = currentUser.role;

  let adminRole = false;

  if(role==="admin"){
    adminRole= true;
  }
  console.log(role)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("https://dps-server-b829cf5871b7.herokuapp.com/api/auth/logout");
      const data = await res.json();
      if (data.success === false) {
        signOutUserFailure(data.message);
        return;
      }
      dispatch(signOutUserSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <Navbar.Brand href="#" style={{ color: 'white' }}>Fresh Finest</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/list" style={{ color: 'white' }}>List</Nav.Link>
            <Nav.Link as={NavLink} to="/calendar" style={{ color: 'white' }}>Calendar View</Nav.Link>
            <Nav.Link as={NavLink} to="/history" style={{ color: 'white' }}>History</Nav.Link>
            {adminRole && (
            <nav>
            <Nav.Link as={NavLink} to="/manage" style={{ color: 'white' }}>Manage User</Nav.Link>
            </nav>
          )

          }
          </Nav>
          <Nav>
            {/* <Nav.Link as={NavLink} to="/" style={{ color: 'white' }}>Logout</Nav.Link>
             */}
             <span onClick={handleSignOut} className="text-red-700 cursor-pointer" style={{color:"red", cursor:"pointer"}}>
           Logout
        </span>
          </Nav>
         
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
