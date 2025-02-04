import { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import "./ManageUser.css";
import ManageUsersLoadingSkeleton from "../LoadingSkeleton/ManageUsersLoadingSkeleton";

// const BASE_URL = 'http://localhost:3000';
const BASE_URL = `https://api.priceobo.com`;

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "user",
    permissions: { read: true, write: false },
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user`);
      setUsers(response.data.result);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setNewUser({
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });
    } else {
      setNewUser({
        email: "",
        role: "user",
        permissions: { read: true, write: false },
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleRoleChange = async (e, user) => {
    const updatedRole = e.target.value;
    const updatedPermissions =
      updatedRole === "admin" ? { read: true, write: true } : user.permissions;
    try {
      await axios.patch(`${BASE_URL}/api/user/${user._id}/role`, {
        role: updatedRole,
        permissions: updatedPermissions,
      });
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handlePermissionChange = async (e, user) => {
    const { name, checked } = e.target;
    const updatedPermissions = { ...user.permissions, [name]: checked };
    try {
      await axios.patch(`${BASE_URL}/api/user/${user._id}/role`, {
        role: user.role,
        permissions: updatedPermissions,
      });
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Error updating permissions:", err);
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/user/${userToDelete}`);
      fetchUsers(); // Refresh the user list
      setShowConfirmModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update existing user
        await axios.patch(`${BASE_URL}/api/user/${editingUser._id}`, newUser);
      } else {
        // Send invitation
        const response = await axios.post(
          `${BASE_URL}/api/user/invite`,
          newUser
        );
        console.log(response.data); // Handle the response as needed
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };
  if (!users.length)
    return <ManageUsersLoadingSkeleton></ManageUsersLoadingSkeleton>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={() => handleShowModal()}
          style={{ width: "25%", backgroundColor: "black" }}
        >
          Add New User
        </Button>
      </div>
      <table
        style={{
          tableLayout: "fixed",
          marginTop: "10px",
        }}
        className=" userCustomTable table"
      >
        <thead
          style={{
            backgroundColor: "#f0f0f0",
            color: "#333",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          <tr>
            <th
              className="tableHeader"
              style={{
                position: "sticky", // Sticky header
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              User Name
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky", // Sticky header
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Email
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky", // Sticky header
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Role
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky", // Sticky header
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Permissions
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky", // Sticky header
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              {/* <td><img src={user.avatar} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} /></td>
               */}
              <td
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  verticalAlign: "middle",
                  // cursor: "pointer",
                  height: "40px",
                }}
              >
                {user.userName ? (
                  user.userName
                ) : (
                  <span style={{ color: "red" }}>Not Accepted</span>
                )}
              </td>
              <td
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  verticalAlign: "middle",
                  // cursor: "pointer",
                  height: "40px",
                }}
              >
                {user.email}
              </td>
              <td
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  verticalAlign: "middle",
                  // cursor: "pointer",
                  height: "40px",
                }}
              >
                <Form.Control
                  as="select"
                  value={user.role}
                  onChange={(e) => handleRoleChange(e, user)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Control>
              </td>
              <td
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  // cursor: "pointer",
                  height: "40px",
                }}
              >
                <Form.Check
                  type="checkbox"
                  label="Write"
                  name="write"
                  checked={user.permissions.write}
                  onChange={(e) => handlePermissionChange(e, user)}
                  disabled={user.role === "admin"}
                />
              </td>
              <td
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  verticalAlign: "middle",
                  // cursor: "pointer",
                  height: "40px",
                }}
              >
                <Button
                  variant="danger"
                  onClick={() => handleDeleteUser(user._id)}
                  disabled={user.role === "admin"}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Edit User" : "Invite User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="permissions">
              <Form.Check
                type="checkbox"
                label="Write"
                name="write"
                checked={newUser.permissions.write}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    permissions: {
                      ...newUser.permissions,
                      write: e.target.checked,
                    },
                  })
                }
                disabled={newUser.role === "admin"}
              />
            </Form.Group>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleSubmit}
                style={{ width: "25%", backgroundColor: "black" }}
              >
                {editingUser ? "Update User" : "Invite User"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteUser}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ManageUser;