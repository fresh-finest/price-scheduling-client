import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    // If the user is not logged in, redirect to the login page
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If the user's role is not in the allowedRoles, redirect to a Not Found page or Unauthorized page
    return <Navigate to="/not-found" />;
  }

  return children;
};

export default PrivateRoute;
