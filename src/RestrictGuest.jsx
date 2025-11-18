import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RestrictGuest = () => {
    let user = null;
    
    // 1. Try to get the user from storage
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Error parsing user data:", error);
        user = null;
    }

    // 2. THE SECURITY CHECK
    // If the user is logged in AND their role is 'guest'
    if (user && user.role === 'guest') {
        // Kick them back to Home
        return <Navigate to="/home" replace />;
    }

    // 3. If they are NOT a guest (e.g. they are a Google user or Admin), let them pass.
    return <Outlet />;
};

export default RestrictGuest;