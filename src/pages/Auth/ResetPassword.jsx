import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

// const BASE_URL = 'http://localhost:3000';
const BASE_URL ='http://dynamic-price-schedule.us-east-1.elasticbeanstalk.com';


function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Extract the token from the URL query params
    const emailFromUrl = searchParams.get('email'); // Extract the email from the URL query params
    const [email, setEmail] = useState(emailFromUrl || ''); // Use the email from the URL or empty if not present
    const [userName, setUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }
    }, [emailFromUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match");
            return;
        }

        console.log('Token being sent:', token); // Log the token for debugging

        try {
            const response = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
                token,  // Pass the token in the request body
                userName,
                newPassword,
                confirmNewPassword,
                email,
                
            });

            setSuccess(response.data.message);
            setError('');

            // Redirect to login or another page after successful reset
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
            setSuccess('');
        }
    };

    return (
        <div className="reset-password-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label> Your are invited by {email}</label>
                    {/* <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        readOnly={!!emailFromUrl} // Make it read-only if it was provided via the URL
                    /> */}
                </div>
                <div className="form-group">
                    {/* <label>Username:</label> */}
                    <input
                    style={{marginBottom:"5px"}}
                        type="text"
                        className="form-control"
                        placeholder='Enter Your Name'
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    {/* <label>New Password:</label> */}
                    <input
                    style={{marginBottom:"5px"}}
                        type="password"
                        className="form-control"
                        placeholder='New Password'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    {/* <label>Confirm New Password:</label> */}
                    <input
                        type="password"
                        className="form-control"
                        placeholder='Confirmed New Password'
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <button type="submit"  style={{width:"150px", backgroundColor:"black", marginTop:"10px"}} className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}

export default ResetPassword;
