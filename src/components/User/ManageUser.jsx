import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Modal, Container } from 'react-bootstrap';
import axios from 'axios';

const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com';
// const BASE_URL = 'http://localhost:3000';

function ManageUser() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ userName: '', email: '', password: '', designation: '', role: 'user', permissions: { read: true, write: false } });
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
            setNewUser(user);
        } else {
            setNewUser({ userName: '', email: '', password: '', designation: '', role: 'user', permissions: { read: true, write: false } });
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
        const updatedPermissions = updatedRole === 'admin' ? { read: true, write: true } : user.permissions;
        try {
            await axios.patch(`${BASE_URL}/api/user/${user._id}/role`, { role: updatedRole, permissions: updatedPermissions });
            fetchUsers(); // Refresh the user list
        } catch (err) {
            console.error("Error updating role:", err);
        }
    };

    const handlePermissionChange = async (e, user) => {
        const { name, checked } = e.target;
        const updatedPermissions = { ...user.permissions, [name]: checked };
        try {
            await axios.patch(`${BASE_URL}/api/user/${user._id}/role`, { role: user.role, permissions: updatedPermissions });
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
                // Create new user
                await axios.post(`${BASE_URL}/api/user`, newUser);
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving user:", err);
        }
    };

    return (
        <Container style={{ marginTop: "100px" }}>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
                <Button onClick={() => handleShowModal()} style={{width:"25%", backgroundColor:"black"}} >Add New User</Button>
            </div>
            <Table bordered hover responsive style={{ marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Permissions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td><img src={user.avatar} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} /></td>
                            <td>{user.userName}</td>
                            <td>{user.email}</td>
                            <td>
                                <Form.Control
                                    as="select"
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(e, user)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </Form.Control>
                            </td>
                            <td>
                                <Form.Check
                                    type="checkbox"
                                    label="Write"
                                    name="write"
                                    checked={user.permissions.write}
                                    onChange={(e) => handlePermissionChange(e, user)}
                                    disabled={user.role === 'admin'}
                                />
                            </td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDeleteUser(user._id)}
                                    disabled={user.role === 'admin'}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingUser ? 'Edit User' : 'Add User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="userName">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="userName"
                                value={newUser.userName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        {!editingUser && (
                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        )}
                        <Form.Group controlId="designation">
                            <Form.Label>Designation</Form.Label>
                            <Form.Control
                                type="text"
                                name="designation"
                                value={newUser.designation}
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
                                onChange={(e) => setNewUser({ ...newUser, permissions: { ...newUser.permissions, write: e.target.checked } })}
                                disabled={newUser.role === 'admin'}
                            />
                        </Form.Group>
                        <div style={{display:"flex",justifyContent:"center"}}>
                            <Button onClick={handleSubmit} style={{width:"25%", backgroundColor:"black"}}>
                                {editingUser ? 'Update User' : 'Create User'}
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
                    Are you sure you want to delete this user? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteUser}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ManageUser;
