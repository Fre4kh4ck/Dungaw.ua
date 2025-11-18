import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const [isValid, setIsValid] = useState(null); // null = loading state
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        const res = await fetch("http://dungaw.ua:4435/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok && data.valid) {
          setIsValid(true);
        } else {
          // invalid token or expired
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setIsValid(false);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        setIsValid(false);
      }
    };

    verifyToken();
  }, [token]);

  if (isValid === null) return <div>Loading...</div>; // prevent flash
  if (!token || !role || !isValid) return <Navigate to="/admin" replace />;

  const normalizedRole = role.trim().toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.trim().toLowerCase());

  if (!normalizedAllowed.includes(normalizedRole)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
