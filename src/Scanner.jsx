import React, { useState, useEffect, useRef } from 'react'; // ✅ 1. Import useRef
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../css/style.css";
import UALOGO from './assets/Ualogo.png';
import FBLOGO from './assets/fblogo.png'
import INSTALOGO from './assets/instalogo.png'
import STAT from './assets/stat.png'
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Scanner() {
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState("");
    const [verificationStatus, setVerificationStatus] = useState("");

    // ✅ 2. Create the ref *outside* the useEffect
    // This lock will be shared across all re-renders and effect runs
    const isProcessingRef = useRef(false);

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // --- ✅ REBUILT SCANNER LOGIC ---
    useEffect(() => {
        // We no longer define 'let isProcessing' here

        const scanner = new Html5QrcodeScanner(
            "qr-scanner",
            {
                qrbox: { width: 250, height: 250 },
                fps: 10,
            },
            false
        );

        async function onScanSuccess(decodedText) {
            // ✅ 3. Check the ref's '.current' property
            if (isProcessingRef.current) {
                return; // If already processing, stop
            }
            // ✅ 4. Set the ref's '.current' property to lock it
            isProcessingRef.current = true;

            // Pause the scanner
            if (scanner && scanner.getState() === 2 /* SCANNING */) {
                scanner.pause();
            }

            setIsLoading(true);
            setVerificationResult("");
            setVerificationStatus("");

            try {
                const qrData = JSON.parse(decodedText);

                const response = await axios.post("http://dungaw.ua:4435/verify-ticket", {
                    email: qrData.email,
                    eventId: qrData.eventId,
                    ticketId: qrData.ticketId
                });

                const { message, email, status, time } = response.data;
                let timeString = "";
                if (time) {
                    timeString = ` at ${new Date(time).toLocaleTimeString()}`;
                }
                setVerificationResult(`${message} (User: ${email})${timeString}`);
                setVerificationStatus(status);

            } catch (err) {
                if (err.response) {
                    setVerificationResult(err.response.data.message);
                    setVerificationStatus(err.response.data.status || "error");
                } else if (err instanceof SyntaxError) {
                    setVerificationResult("Invalid QR Code: Not a valid ticket format.");
                    setVerificationStatus("error");
                } else {
                    setVerificationResult("Scan failed. Please try again.");
                    setVerificationStatus("error");
                }
            } finally {
                setIsLoading(false);
                // After 2 seconds, resume scanning
                setTimeout(() => {
                    if (scanner && scanner.getState() === 3 /* PAUSED */) {
                        scanner.resume();
                    }
                    // ✅ 5. Release the lock *inside* the timeout
                    isProcessingRef.current = false;
                }, 2000); // 2-second delay
            }
        }

        function onScanFailure(error) {
            // ignore
        }

        scanner.render(onScanSuccess, onScanFailure);

        // Cleanup function
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner on unmount.", error);
            });
        };
    }, []); // Empty dependency array is correct

    // --- Function to get the alert color ---
    const getAlertClass = () => {
        if (verificationStatus === 'success') return 'alert-success';
        if (verificationStatus === 'warning') return 'alert-warning';
        if (verificationStatus === 'error') return 'alert-danger';
        return 'd-none';
    };

    return (
        <>
            {/* ------------------------------------------------------------------- */}
            {/* ------------------- NAVBAR AND SIDEBAR (Unchanged) ----------------- */}
            {/* ------------------------------------------------------------------- */}
            <div className='container-fluid'>
                <nav
                    className="navbar navbar-dark fixed-top d-flex justify-content-between px-3"
                    style={{ zIndex: 1050, height: '7rem', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: '#711212ff' }}
                >
                    <div className="d-flex align-items-center">
                        <img src={UALOGO} className="ua-logo me-2" alt="UA logo" style={{ width: "50px" }} />
                        <div className="text-white">
                            <div className="fw-bold ua-text">University of Antique</div>
                            <div className="smc-text" style={{ fontSize: '0.85rem' }}>Sibalom Main Campus</div>
                        </div>
                    </div>
                    <button className="btn btn-outline-light d-lg-none" onClick={toggleSidebar}>
                        ☰
                    </button>
                </nav>

                <div
                    className={` border-end text-light position-fixed top-0 start-0 h-100 sidebar d-flex flex-column ${sidebarOpen ? "show" : ""}`}
                    style={{ width: '250px', zIndex: 1040, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', backgroundColor: '#711212ff' }}
                >
                    <div className="px-4 pt-4 pb-2 border-bottom d-flex align-items-center gap-2">
                        <img src={UALOGO} alt="UA logo" style={{ width: '40px' }} />
                        <div>
                            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>University of Antique</div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Sibalom Campus</div>
                        </div>
                    </div>

                    <ul className="nav flex-column mt-5 px-3">
                        <li className="nav-item mb-3">
                            <a className="nav-link text-light d-flex align-items-center gap-2 px-3 py-2 rounded" href="/adminEvents">
                                <i className="bi bi-calendar2-event"></i> Events
                            </a>
                        </li>
                        <li className="nav-item mb-3">
                            <a className="nav-link text-light d-flex align-items-center gap-2 px-3 py-2 rounded" href="/accounts">
                                <i className="bi bi-people-fill"></i> Accounts
                            </a>
                        </li>
                        <li className="nav-item mb-3">
                            <a
                                className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
                                href="/manageEvents"
                            >
                                <i className="bi bi-collection"></i> Manage Events
                            </a>
                        </li>

                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded" href="/admin-reports">
                                <i className="bi bi-file-earmark-bar-graph"></i> Event Reports
                            </a>
                        </li>

                        <li className="nav-item mb-2">
                            <a className="nav-link text-light px-3 py-2 d-flex align-items-center gap-2" href="/event-scanner"
                            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
                                <i className="bi bi-qr-code-scan"></i> Scanner
                            </a>
                        </li>
                        <li className="nav-item mb-2 justify-content-center d-flex" style={{marginTop:"20rem"}}>
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg text-center" href="/login">
                                <i className="bi bi-box-arrow-right"></i> Log out
                            </a>
                        </li>
                    </ul>

                    <img
                        src={STAT}
                        alt="Sidebar design"
                        style={{
                            position: "absolute",
                            bottom: "-4.5rem",
                            left: "50%",
                            transform: "translateX(-55%)",
                            width: "400px",
                            opacity: 0.9,
                            zIndex: -1,
                            pointerEvents: "none"
                        }}
                    />
                </div>
            </div>

            <div className="container-fluid"
                style={{
                    marginTop: '7rem',
                    marginLeft: isLargeScreen ? "250px" : "0",
                    transition: "all 0.3s ease-in-out",
                    padding: "2rem 2rem 2rem 10rem"
                }}
            >
                <div className="row">
                    <div className="col-lg-8 col-md-10">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-header text-white" style={{ backgroundColor: "#711212ff" }}>
                                <h4 className="mb-0 fw-bold"><i className="bi bi-qr-code-scan me-2"></i>Event Attendance Scanner</h4>
                            </div>
                            <div className="card-body p-4 text-center">
                                <div id="qr-scanner" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>

                                <hr className="my-4" />

                                <h5 className="text-muted">Scan Result</h5>
                                {isLoading ? (
                                    <div className="spinner-border text-danger" role="status">
                                        <span className="visually-hidden">Verifying...</span>
                                    </div>
                                ) : (
                                    <div className={`alert ${getAlertClass()} fw-bold fs-5 mt-3`} role="alert">
                                        {verificationResult || "Awaiting scan..."}
                                    </div>
                                )}
                                <button
                                    className="btn text-white fw-semibold px-4 mt-3"
                                    style={{ backgroundColor: "#711212ff" }}
                                    onClick={() => window.location.reload()}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>Reset Scanner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}