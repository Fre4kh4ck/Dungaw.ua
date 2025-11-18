import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "react-calendar/dist/Calendar.css"
import "../css/style.css";
import UALOGO from './assets/Ualogo.png';
import FBLOGO from './assets/fblogo.png'
import INSTALOGO from './assets/instalogo.png'
import STAT from './assets/stat.png'
import BG1 from './assets/bg1.jpeg'
import Loop from './Loop';
import axios from 'axios';
import Tick from './Tick';

export default function Events() {
    useEffect(() => {
        Tick(GetEvents);
    }, []);

    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, sendData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("");


    // Modal state for View Info
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleViewInfo = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
    };

    // Modal state for Join button
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinedEvent, setJoinedEvent] = useState(null);

    // ✅ New states for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [eventToJoin, setEventToJoin] = useState(null);

    // ✅ NEW STATE: To store the QR code data URL
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    const handleJoinEvent = (event) => {
        setEventToJoin(event);
        setShowConfirmModal(true);
    };


    // ✅ MODIFIED: This function now handles everything
    const confirmJoinEvent = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const userEmail = user?.email;

        if (!userEmail) {
            alert("Cannot join — user not logged in.");
            return;
        }

        try {
            // ✅ SINGLE API CALL: This one endpoint will
            // 1. Save join to DB
            // 2. Generate unique ticketId
            // 3. Generate QR code
            // 4. Send email with QR code
            // 5. Return QR code to display here
            const response = await axios.post("http://dungaw.ua:4435/join-event", {
                email: userEmail,
                eventId: eventToJoin.EventID,
                eventName: eventToJoin.EventName // Pass eventName for the email
            });

            // Get the QR code URL from the backend response
            const { qrCodeDataURL } = response.data;

            // Save it to state to show in the modal
            if (qrCodeDataURL) {
                setQrCodeUrl(qrCodeDataURL);
            }

            // Show success
            setShowConfirmModal(false);
            setJoinedEvent(eventToJoin);
            setShowJoinModal(true);
            setEventToJoin(null);
        } catch (err) {
            console.error("Join event error:", err.response?.data || err);
            // Handle "Already joined" error from backend
            if (err.response?.data?.message === "Already joined this event") {
                alert("You have already joined this event.");
            } else {
                alert("Failed to join event. Please try again.");
            }
            setShowConfirmModal(false); // Close confirm modal on error
        }
    };


    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setEventToJoin(null);
    };

    // ✅ MODIFIED: Clear QR code when closing success modal
    const handleCloseJoinModal = () => {
        setShowJoinModal(false);
        setJoinedEvent(null);
        setQrCodeUrl(""); // Reset the QR code URL
    };

    // ✅ FIX: Add this new helper function
    const formatDate = (dateString) => {
        if (!dateString) {
            return "N/A";
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date"; // Handle cases where dateString is not a valid date
        }
        return date.toDateString();
    };

    // ✅ NEW FUNCTION FOR DATE RANGE
    const formatEventDateRange = (startDateString, endDateString) => {
        if (!startDateString) {
            return "N/A";
        }

        const startDate = new Date(startDateString);
        if (isNaN(startDate.getTime())) {
            return "Invalid Date";
        }

        const options = { month: 'short', day: 'numeric' };

        // 1. Check if end date exists
        if (!endDateString) {
            return startDate.toLocaleDateString('en-US', options); // e.g., "Nov 24"
        }

        const endDate = new Date(endDateString);
        if (isNaN(endDate.getTime())) {
            return startDate.toLocaleDateString('en-US', options); // Invalid end date
        }

        // 2. Check if they are the same day
        if (startDate.toDateString() === endDate.toDateString()) {
            return startDate.toLocaleDateString('en-US', options); // e.g., "Nov 24"
        }

        // 3. They are different days, check for same month
        if (startDate.getMonth() === endDate.getMonth()) {
            const startDay = startDate.getDate();
            const endDay = endDate.getDate();
            const month = startDate.toLocaleString('default', { month: 'short' });
            return `${month} ${startDay}-${endDay}`; // e.g., "Nov 24-28"
        } else {
            // 4. Different months
            // e.g., "Nov 28 - Dec 2"
            return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
        }
    };


    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const FetchEvents = async () => {
        const res = await axios.get("http://dungaw.ua:4435/events");
        sendData(res.data);
    }

    const GetEvents = () => {
        return FetchEvents();
    }

    const filteredEvents = data.filter((event) => {
        const name = event.EventName || event.eventName || event.event_name || "";
        const category = event.EventCategory || event.eventCategory || event.event_category || "";
        const location = event.EventLocation || event.eventLocation || event.event_location || "";
        const venue = event.EventVenue || event.eventVenue || event.event_venue || "";

        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept =
            selectedDept === "" || event.EventDept === selectedDept;

        const isApproved = event.EventStatus === "Approved";

        // ✅ DATE LOGIC: Filter out past events
        // 1. Get current date and set time to 00:00:00 so we show events happening TODAY
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Get the event date (Use EndDate, fallback to StartDate if EndDate is null)
        const eventDateStr = event.EventEndDate || event.EventStartDate;
        const eventDate = new Date(eventDateStr);

        // 3. check if eventDate is valid and matches the condition
        // Logic: Event Date must be greater than or equal to Today
        const isUpcoming = !isNaN(eventDate.getTime()) && eventDate >= today;

        // ✅ Add isUpcoming to the return statement
        return matchesSearch && matchesDept && isApproved && isUpcoming;
    });


    return (
        <>
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
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center gap-2 active fw-semibold text-light border-light px-3 py-2" href="/home">
                                <i className="bi bi-house-door-fill"></i> Home
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg" href="/calendar">
                                <i className="bi bi-calendar-event-fill"></i> Calendar
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg" href="/events"
                                style={{
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                }}>
                                <i className="bi bi-calendar2-event"></i> Events
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg" href="/chats">
                                <i className="bi bi-chat-dots-fill"></i> Chat
                            </a>
                        </li>

                        <li className="nav-item d-flex justify-content-center gap-3 mt-5">
                            <a className="nav-link p-0" href="https://sims.antiquespride.edu.ph/aims/" target="_blank" rel="noopener noreferrer">
                                <img style={{ width: '2rem', marginTop: "clamp(14rem, 17vw, 30rem)" }} src={UALOGO} alt="UA Logo" />
                            </a>
                            <a className="nav-link p-0" href="https://www.facebook.com/universityofantique" target="_blank" rel="noopener noreferrer">
                                <img style={{ width: '2rem', marginTop: "clamp(14rem, 17vw, 30rem)" }} src={FBLOGO} alt="FB Logo" />
                            </a>
                            <a className="nav-link p-0" href="https://www.instagram.com/universityofantique/" target="_blank" rel="noopener noreferrer">
                                <img style={{ width: '2rem', marginTop: "clamp(14rem, 17vw, 30rem)" }} src={INSTALOGO} alt="IG Logo" />
                            </a>
                        </li>

                        <li className="nav-item mb-2 justify-content-center d-flex">
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

            {/* Top Image + Search Bar Section (Unchanged) */}
            <div className="container-fluid">
                <div className="row d-flex justify-content-start">
                    <div className="col-sm-12 col-md-12 col-lg-12 position-relative" style={{ overflow: "hidden", marginTop: '6rem' }}>
                        <div>
                            <img
                                src={BG1}
                                alt=""
                                style={{
                                    width: "110rem",
                                    opacity: "0.8",
                                    transform: "translateX(-10px)",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
                                }}
                            ></div>
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                top: "30%",
                                left: "50%",
                                transform: "translate(-50%, -30%)",
                                textAlign: "center",
                                color: "#fff",
                                width: "80%",
                                marginTop: "8rem",
                            }}
                        >
                            <h1 style={{ fontWeight: "bold", fontSize: "2.5rem" }}>
                                <span style={{ color: "#00AEEF" }}>Live Today.</span> Live Campus Life.
                            </h1>
                            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
                                Discover the Most Exciting Campus Events Around You
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    maxWidth: "700px",
                                    margin: "0 auto",
                                    background: "#fff",
                                    borderRadius: "8px",
                                    padding: "5px 10px",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Search Events, Categories, Location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1,
                                        border: "none",
                                        outline: "none",
                                        padding: "10px",
                                        fontSize: "1rem",
                                        borderRadius: "5px",
                                    }}
                                />
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        padding: "10px",
                                        fontSize: "1rem",
                                        background: "transparent",
                                    }}
                                >
                                    <option value="">UA</option>
                                    <option value="CCIS">CCIS</option>
                                    <option value="CEA">CEA</option>
                                    <option value="CBA">CBA</option>
                                    <option value="CCJE">CCJE</option>
                                    <option value="CMS">CMS</option>
                                    <option value="CAS">CAS</option>
                                    <option value="CIT">CIT</option>
                                    <option value="CTE">CTE</option>
                                </select>
                            </div>

                            <p style={{ marginTop: "20px", fontSize: "1rem" }}>
                                DISCOVER THE <span style={{ color: "#00AEEF" }}>CAMPUS</span>{" "}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Grid (Unchanged) */}
            <div className="container-fluid mt-5 mb-5">
                <div
                    className="events-grid"
                    style={{
                        marginLeft: isLargeScreen ? "15rem" : "0",
                        transition: "all 0.3s ease-in-out",
                    }}
                >
                    {filteredEvents.length > 0 ? (
                        <Loop repeat={filteredEvents.length}>
                            {(index) => (
                                <div key={index} className="card-wrapper">
                                    <div className="card shadow-lg border-0 rounded-4 equal-card">
                                        <img
                                            src={
                                                filteredEvents[index].EventPhoto
                                                    ? `http://dungaw.ua:4435/api/upload/${filteredEvents[index].EventPhoto}`
                                                    : "/fallback.jpg"
                                            }
                                            className="card-img-top rounded-top-4"
                                            alt={filteredEvents[index].EventName}
                                            height={180}
                                        />

                                        <div className="card-body">
                                            {/* ✅ MODIFIED LINE */}
                                            <p className="text-muted mb-1">
                                                {formatEventDateRange(filteredEvents[index].EventStartDate, filteredEvents[index].EventEndDate)} • {filteredEvents[index].EventVenue}, {filteredEvents[index].EventTime}
                                            </p>
                                            <h5 className="card-title fw-bold">
                                                {filteredEvents[index].EventName}, {filteredEvents[index].EventDept}
                                            </h5>
                                            <p className="text-muted mb-2">4+ Interested</p>

                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <button
                                                    className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                                    style={{
                                                        flexBasis: "70%",
                                                        height: "45px",
                                                        borderColor: "#711212ff",
                                                        color: "#711212ff",
                                                    }}
                                                    onClick={() => handleJoinEvent(filteredEvents[index])}
                                                >
                                                    <i className="bi bi-people-fill"></i> Join
                                                </button>

                                                <button
                                                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center fw-semibold"
                                                    style={{
                                                        flexBasis: "30%",
                                                        height: "45px",
                                                        borderColor: "#711212ff",
                                                        color: "#711212ff",
                                                    }}
                                                    onClick={() => handleViewInfo(filteredEvents[index])}
                                                >
                                                    <i className="bi bi-info-circle me-1"></i> View Info
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Loop>
                    ) : (
                        <h1 className="text-center text-muted mt-5">No events found</h1>
                    )}
                </div>
            </div>

            {/* ------------------------------------------- */}
            {/* ✅ --- REDESIGNED VIEW INFO MODAL --- ✅ */}
            {/* ------------------------------------------- */}
            {showModal && selectedEvent && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.3)", // Darker backdrop
                        backdropFilter: "blur(5px)",
                    }}
                >
                    {/* Make modal larger */}
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                            {/* Modal body is now p-0 to allow image banner */}
                            <div className="modal-body p-0">

                                {/* 1. Event Image Banner */}
                                {/* Close button is absolutely positioned on top of the image */}
                                <div className="position-relative">
                                    <img
                                        src={
                                            selectedEvent.EventPhoto
                                                ? `http://dungaw.ua:4435/api/upload/${selectedEvent.EventPhoto}`
                                                : "/fallback.jpg"
                                        }
                                        alt={selectedEvent.EventName}
                                        style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white fs-5"
                                        onClick={handleCloseModal}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            borderRadius: '50%',
                                            padding: '0.5rem'
                                        }}
                                    ></button>
                                </div>

                                <div className="p-4">
                                    {/* Event Title */}
                                    <h3 className="fw-bold mb-3" style={{ color: "#711212ff" }}>
                                        {selectedEvent.EventName || "Event Information"}
                                    </h3>

                                    {/* 2. Key Details List */}
                                    <ul className="list-group list-group-flush mb-4">
                                        {/* ✅ MODIFIED DATE SECTION */}
                                        <li className="list-group-item d-flex gap-3 px-0 align-items-center">
                                            <i className="bi bi-calendar-event fs-4" style={{ color: "#711212ff" }}></i>
                                            <div>
                                                <h6 className="mb-0 fw-bold">
                                                    {selectedEvent.EventEndDate && selectedEvent.EventStartDate !== selectedEvent.EventEndDate ? "Dates" : "Date"}
                                                </h6>
                                                <span className="text-muted">
                                                    {formatDate(selectedEvent.EventStartDate)}
                                                    {selectedEvent.EventEndDate && selectedEvent.EventStartDate !== selectedEvent.EventEndDate && (
                                                        ` - ${formatDate(selectedEvent.EventEndDate)}`
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                        {/* END MODIFIED DATE SECTION */}

                                        <li className="list-group-item d-flex gap-3 px-0 align-items-center">
                                            <i className="bi bi-clock fs-4" style={{ color: "#711212ff" }}></i>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Time</h6>
                                                <span className="text-muted">{selectedEvent.EventTime}</span>
                                            </div>
                                        </li>
                                        <li className="list-group-item d-flex gap-3 px-0 align-items-center">
                                            <i className="bi bi-geo-alt-fill fs-4" style={{ color: "#711212ff" }}></i>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Location</h6>
                                                <span className="text-muted">{selectedEvent.EventVenue}</span>
                                            </div>
                                        </li>
                                        <li className="list-group-item d-flex gap-3 px-0 align-items-center">
                                            <i className="bi bi-building fs-4" style={{ color: "#711212ff" }}></i>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Department</h6>
                                                <span className="text-muted">{selectedEvent.EventDept}</span>
                                            </div>
                                        </li>
                                    </ul>

                                    {/* 3. Description Section */}
                                    <h6 className="fw-bold">About this event</h6>
                                    <p
                                        className="text-muted"
                                        style={{
                                            fontSize: "1rem",
                                            lineHeight: "1.6",
                                            textAlign: "justify",
                                        }}
                                    >
                                        {selectedEvent.EventDescription || "No description available."}
                                    </p>
                                </div>
                            </div>
                            {/* --- End New Modal Body --- */}

                            <div className="modal-footer border-0" style={{ backgroundColor: "#f8f9fa" }}>
                                <button
                                    className="btn fw-semibold text-white px-4"
                                    style={{ backgroundColor: "#711212ff" }}
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Join Modal (Unchanged) */}
            {showConfirmModal && eventToJoin && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(255, 255, 255, 0.43)",
                        backdropFilter: "blur(1px)",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header text-white" style={{ backgroundColor: "#711212ff" }}>
                                <h5 className="modal-title fw-bold">Confirm Join</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={handleCloseConfirmModal}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <i className="bi bi-question-circle display-4 text-warning"></i>
                                <p className="mt-3 mb-0 fs-5">
                                    Are you sure you want to join <b>{eventToJoin.EventName}</b>?
                                </p>
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-center">
                                <button className="btn btn-secondary fw-semibold px-4" onClick={handleCloseConfirmModal}>Cancel</button>

                                <button className="btn text-white fw-semibold px-4" style={{ backgroundColor: "#711212ff" }} onClick={confirmJoinEvent}>Join</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Success Modal (Unchanged) */}
            {showJoinModal && joinedEvent && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(255, 255, 255, 0.43)",
                        backdropFilter: "blur(1px)",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div
                                className="modal-header text-white"
                                style={{ backgroundColor: "#711212ff" }}
                            >
                                <h5 className="modal-title fw-bold">Successfully Joined!</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={handleCloseJoinModal}
                                ></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <i className="bi bi-check-circle-fill text-success display-4 mb-3"></i>
                                <p className="fw-semibold fs-5">
                                    You have successfully joined <b>{joinedEvent.EventName}</b>!
                                </p>
                                <p className="text-muted">
                                    Here is your unique ticket. A copy has been sent to your email.
                                </p>

                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="Your Event QR Code"
                                        className="img-fluid my-2 border rounded"
                                        style={{ maxWidth: "250px" }}
                                    />
                                ) : (
                                    <p className="text-muted">Generating QR code...</p>
                                )}
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-center">
                                <button
                                    className="btn fw-semibold text-white px-4"
                                    style={{ backgroundColor: "#711212ff" }}
                                    onClick={handleCloseJoinModal}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}