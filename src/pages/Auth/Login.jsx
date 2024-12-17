import { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import "./Login.css";
import priceoboLogo from "../../assets/images/priceobo-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";

const BASE_URL = `https://api.priceobo.com`;
// const BASE_URL = `http://localhost:3000`;
const Login = () => {
  const [formData, setFormData] = useState({});

  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart()); // Dispatch as a function

      const res = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        // credentials: 'include',
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok || data.success === false) {
        // Check response status and structure
        dispatch(signInFailure(data.message || "Login failed"));
        return;
      }

      dispatch(signInSuccess(data));
      navigate("/calendar");
    } catch (error) {
      dispatch(signInFailure(error.message));
      console.log(error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col md={12}>
          <Card className="p-5 shadow">
            <Card.Body className="login-container">
              <Card.Title className="text-center">
                <div className="flex justify-center items-center mb-[20px] mt-[40px]">
                  <img
                    src={priceoboLogo}
                    alt="Priceobo Logo"
                    className="mb-4 object-cover"
                  />
                </div>
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    id="email"
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    id="password"
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicCheckbox" className="mt-3">
                  <Form.Check type="checkbox" label="Remember me" />
                </Form.Group>

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-100 mt-3 bg-[#0D6EFD] hover:bg-[#0D6EFD]"
                >
                  {loading ? "Loading..." : "Login"}
                </Button>

                <div className="text-center mt-3">
                  <a href="/forgot-password">Forgot password?</a>
                </div>
              </Form>
              {error && (
                <p className="text-red-500" style={{ color: "red" }}>
                  {error}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;