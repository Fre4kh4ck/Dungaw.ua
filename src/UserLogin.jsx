import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LOGO from "./assets/Logo.png";
import "../css/style.css";
import { useNavigate } from 'react-router-dom';
import BG from './assets/bg.jpg'


export default function UserLogin() {
    const googleDivRef = useRef(null);
    const navigate = useNavigate();

    const handleCredentialResponse = async (response) => {
        try {
            console.log("GOOGLE RESPONSE:", response);
            const idToken = response?.credential;

            if (!idToken) {
                alert("Google token missing.");
                return;
            }

            const res = await fetch("http://dungaw.ua:4435/google-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
                credentials: "include"
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Login failed");
                return;
            }

            // 1. Save Token for verified users
            localStorage.setItem("token", data.token);
            
            // 2. Save User Data (Ensure they have a role, default to student)
            const userToSave = { ...data.user, role: data.user.role || 'student' };
            localStorage.setItem("user", JSON.stringify(userToSave));
            
            navigate("/home");
        } catch (err) {
            console.error("Google Login Error:", err);
            alert("Login error — see console.");
        }
    };

    // ✅ STEP 1 FIX: Handle Guest Login properly
    const handleGuestLogin = () => {
        // A. Clear any old data so they don't get mixed up
        localStorage.removeItem("token");
        
        // B. Create a "Guest" identity
        const guestUser = {
            name: "Guest Visitor",
            role: "guest" // 🔒 This is the security key
        };
        
        // C. Save it
        localStorage.setItem("user", JSON.stringify(guestUser));

        // D. Send them to Home
        navigate('/home'); 
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
                <div
                    className="col-lg-5 col-sm-12 order-1 order-lg-2 d-flex justify-content-center align-items-center position-relative"
                    style={{
                        minHeight: '100vh',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Layer */}
                    <div
                        style={{
                            backgroundImage: `url(${BG})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            filter: 'blur(8px)',
                            position: 'absolute',
                            top: '-10px',
                            left: '-10px',
                            width: 'calc(100% + 20px)',   
                            height: 'calc(100% + 20px)', 
                            zIndex: 0
                        }}
                    ></div>

                    {/* Foreground Content */}
                    <div style={{ width: '100%', maxWidth: '600px', zIndex: 1 }}>
                        <div className="d-flex justify-content-center">
                            <img
                                src={LOGO}
                                alt="Logo"
                                className="logo-img"
                                style={{ width: '12rem', height: 'auto', marginBottom: '8rem', marginTop: '4rem' }}
                            />
                        </div>

                        <div className="d-flex flex-column align-items-center button-container">
                            <div ref={googleDivRef}></div>

                            <button
                                className="btn btn-outline-danger guest-btn mt-4 text-white"
                                onClick={handleGuestLogin} // ✅ Calls the function above
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}