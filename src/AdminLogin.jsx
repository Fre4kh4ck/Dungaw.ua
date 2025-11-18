import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LOGO from "../src/assets/Logo.png";
import "../css/style.css";
import SUBAY from "../src/assets/Subay.png";

export default function AdminLogin() {
  const googleDivRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const username = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    if (!username || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const res = await fetch('http://dungaw.ua:4435/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('🧾 Backend response:', data);

      if (!res.ok) {
       
        alert(data.message || 'Login failed');
        return;
      }

      // ✅ Save token and role to localStorage
      const rawRole = data.user?.role || data.role || '';
      const role = rawRole.trim().toLowerCase();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);

      // ✅ Check allowed roles
      if (role === 'admin' || role === 'co-admin') {
        navigate('/adminEvents');
      } else {
        alert(`Unauthorized role: ${role}`);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Error connecting to the server');
    }
  };

  const handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token:", response.credential);
  };

  useEffect(() => {
    if (window.google && googleDivRef.current) {
      window.google.accounts.id.initialize({
        client_id: '934203088661-jtnhip516m0nfqb14sdbkmuntqcuu1r5.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: 'outline',
        size: 'large',
        width: '300',
      });
    }
  }, []);

  return (
    <div className="container-fluid">
      <div className="row" style={{ height: '100vh' }}>
        {/* Left Side */}
        <div
          className="col-lg-7 col-sm-12 order-2 order-lg-1 d-flex flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: '#711212ff',
            paddingBottom: '5rem',
            height: '100%',
          }}
        >
          <h1 className="custom-size text-white fw-bold m-0 font-serif">
            Welcome to
          </h1>
          <h2 className="custom-size-1 text-white mt-3 mb-5 font-sans">
            DUNGAW
          </h2>
          <h3 className="custom-size-2 text-white text-center mt-5">
            Smart Campus companion. Stay updated with events, discover <br />
            course promotions, get instant help through our built-in chat. <br /> <br />
            Everything you need, all in one place.
          </h3>
        </div>

        {/* Right Side */}
        <div className="col-lg-5 col-sm-12 order-1 order-lg-2 d-flex justify-content-center align-items-center">
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div className="d-flex justify-content-center">
              <img
                src={LOGO}
                alt="Logo"
                className="logo-img"
                style={{ width: '12rem', height: 'auto', marginBottom: '5rem', marginTop: '4rem' }}
              />
            </div>

            <div className="responsive-form">
              <div className="form-floating mb-4">
                <input
                  ref={emailRef}
                  type="email"
                  className="form-control form-control-lg"
                  id="floatingInput"
                  placeholder="name@example.com"
                />
                <label htmlFor="floatingInput">Email address</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  ref={passwordRef}
                  type="password"
                  className="form-control form-control-lg"
                  id="floatingPassword"
                  placeholder="Password"
                />
                <label htmlFor="floatingPassword">Password</label>
              </div>
            </div>

            <div className="d-flex justify-content-center mb-5">
              <button
                className="btn btn-danger btn-lg login-bt"
                onClick={handleLogin}  // ✅ hook up login logic
              >
                Login
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
