import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Modal, Button, Form } from "react-bootstrap"; 

import UALOGO from "./assets/Ualogo.png";
import FBLOGO from "./assets/fblogo.png";
import INSTALOGO from "./assets/instalogo.png";
import STAT from "./assets/stat.png";

export default function EventApproval() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("submitted");
    const [submittedEvents, setSubmittedEvents] = useState([]);
    const [approvedEvents, setApprovedEvents] = useState([]);
    const [deniedEvents, setDeniedEvents] = useState([]);
    const navigate = useNavigate();

    const [showDenyModal, setShowDenyModal] = useState(false);
    const [denialReason, setDenialReason] = useState("");
    const [selectedEventId, setSelectedEventId] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // 🔹 Fetch by status
    const fetchEventsByStatus = async (status, setState) => {
        try {
            const res = await axios.get(`http://dungaw.ua:4435/events/status/${status}`);
            const data = Array.isArray(res.data[0]) ? res.data[0] : res.data;
            setState(data);
        } catch (err) {
            console.error(`Error fetching ${status} events:`, err);
        }
    };

    const refreshAll = () => {
        fetchEventsByStatus("Submitted", setSubmittedEvents);
        fetchEventsByStatus("Approved", setApprovedEvents);
        fetchEventsByStatus("Denied", setDeniedEvents);
    };

    useEffect(() => {
        refreshAll();
    }, []);

    // 🔹 Approve event
    const approveEvent = async (id) => {
        if (!window.confirm("Approve this event?")) return;
        try {
            await axios.put("http://dungaw.ua:4435/events/status/update", {
                id,
                status: "Approved",
                reason: null // Send null for the reason
            });
            alert("✅ Event approved successfully!");
            refreshAll();
        } catch (err) {
            console.error("Error approving event:", err);
            alert("❌ Failed to approve event");
        }
    };

    // 🔹 Modal Functions
    const handleShowDenyModal = (id) => {
        setSelectedEventId(id); // Store the ID of the event we're denying
        setShowDenyModal(true); // Show the modal
    };

    const handleCloseDenyModal = () => {
        setShowDenyModal(false); // Hide the modal
        setDenialReason("");     // Clear the textarea
        setSelectedEventId(null); // Clear the stored ID
    };

    // 🔹 Deny event (called from modal)
    const denyEvent = async () => {
        if (!denialReason) {
            alert("Please provide a reason for denial.");
            return;
        }

        try {
            await axios.put("http://dungaw.ua:4435/events/status/update", {
                id: selectedEventId, // Use the ID from state
                status: "Denied",
                reason: denialReason, // Pass the reason from state
            });

            alert("🚫 Event denied.");
            handleCloseDenyModal(); // Close the modal
            refreshAll(); // Refresh the event lists
        } catch (err) {
            console.error("Error denying event:", err);
            alert("❌ Failed to deny event");
        }
    };

    // 🔹 Render table dynamically (WITH "REASON" COLUMN)
    const renderTable = (events, status) => (
        <div className="table-responsive mt-4">
            <table className="table table-hover align-middle text-center">
                <thead
                    style={{
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        fontSize: "0.95rem",
                        letterSpacing: "0.5px",
                    }}
                >
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Venue</th>
                        <th>Department</th>
                        <th>Photo</th>
                        {/* 🔴 NEW: Added Reason Header */}
                        <th>Reason</th> 
                        {status === "Submitted" ? <th>Actions</th> : <th>Status</th>}
                    </tr>
                </thead>
                <tbody>
                    {events.length > 0 ? (
                        events.map((event, i) => (
                            <tr key={i}>
                                <td>{event.EventID}</td>
                                <td className="fw-semibold text-dark">{event.EventName}</td>
                                <td>{event.EventDate}</td>
                                <td>{event.EventTime}</td>
                                <td>{event.EventVenue}</td>
                                <td>{event.EventDept}</td>
                                <td>
                                    {event.EventPhoto ? (
                                        <img
                                            src={`http://dungaw.ua:4435/api/upload/${event.EventPhoto}`}
                                            alt="Event"
                                            width="60"
                                            height="60"
                                            style={{
                                                borderRadius: "8px",
                                                objectFit: "cover",
                                                border: "2px solid #f8f9fa",
                                            }}
                                        />
                                    ) : (
                                        <span className="text-muted">No Image</span>
                                    )}
                                </td>
                                
                                {/* 🔴 NEW: Added Reason Cell */}
                                <td style={{ minWidth: "150px", maxWidth: "300px", whiteSpace: "normal", fontSize: "0.9rem" }}>
                                    {event.EventDenialReason || <span className="text-muted">---</span>}
                                </td>

                                {status === "Submitted" ? (
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button
                                                className="btn btn-success btn-sm rounded-pill px-3"
                                                onClick={() => approveEvent(event.EventID)}
                                            >
                                                <i className="bi bi-check2-circle me-1"></i> Approve
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                onClick={() => handleShowDenyModal(event.EventID)}
                                            >
                                                <i className="bi bi-x-circle me-1"></i> Deny
                                            </button>
                                        </div>
                                    </td>
                                ) : (
                                    <td>
                                        <span
                                            className={`badge rounded-pill px-3 py-2 ${status === "Approved"
                                                ? "bg-success"
                                                : status === "Denied"
                                                    ? "bg-danger"
                                                    : "bg-secondary"
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            {/* 🔴 NEW: Updated colSpan to 9 */}
                            <td colSpan="9" className="py-4 text-muted">
                                No {status.toLowerCase()} events found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container-fluid">
            {/* 🔴 Navbar */}
            <nav
                className="navbar navbar-dark fixed-top d-flex justify-content-between px-3"
                style={{
                    zIndex: 1050,
                    height: "7rem",
                    backgroundColor: "#711212ff",
                }}
            >
                <div className="d-flex align-items-center">
                    <img src={UALOGO} className="ua-logo me-2" alt="UA logo" style={{ width: "50px" }} />
                    <div className="text-white">
                        <div className="fw-bold">University of Antique</div>
                        <div style={{ fontSize: "0.85rem" }}>Sibalom Main Campus</div>
                    </div>
                </div>
                <button className="btn btn-outline-light d-lg-none" onClick={toggleSidebar}>
                    ☰
                </button>
            </nav>

            {/* 🔴 Sidebar */}
            <div
                className={`border-end text-light position-fixed top-0 start-0 h-100 sidebar d-flex flex-column ${sidebarOpen ? "show" : ""
                    }`}
                style={{
                    width: "250px",
                    zIndex: 1040,
                    backgroundColor: "#711212ff",
                }}
            >
                <div className="px-4 pt-4 pb-2 border-bottom d-flex align-items-center gap-2">
                    <img src={UALOGO} alt="UA logo" style={{ width: "40px" }} />
                    <div>
                        <div className="fw-bold" style={{ fontSize: "1.1rem" }}>University of Antique</div>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>Sibalom Campus</div>
                    </div>
                </div>
                <ul className="nav flex-column mt-5 px-3">
                    <li className="nav-item mb-3">
                        <a
                            className="nav-link text-light d-flex align-items-center gap-2 px-3 py-2 rounded"
                            href="/eventApproval"
                            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                        >
                            <i className="bi bi-check2-square"></i> Event Approval
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
                    }}
                />
            </div>

            {/* 🔴 Main Content */}
            <div className="row">
                <div className="col-sm-12 d-flex justify-content-end">
                    <div
                        style={{
                            paddingTop: "6rem",
                            marginTop: "3rem",
                            maxWidth: "1400px",
                            width: "100%",
                            marginRight: "2rem",
                        }}
                    >
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                            <h3 className="fw-bold text-dark mb-0">
                                Event Approval <i className="bi bi-check2-square text-danger ms-2"></i>
                            </h3>
                            <button
                                className="btn btn-outline-danger fw-semibold"
                                onClick={() => navigate("/manageEvents")}
                            >
                                <i className="bi bi-arrow-left-circle me-2"></i> Back to Manage Events
                            </button>
                        </div>

                        {/* 🔹 Tabs for Submitted / Approved / Denied */}
                        <ul className="nav nav-tabs mb-4 px-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "submitted" ? "active fw-semibold" : ""}`}
                                    onClick={() => setActiveTab("submitted")}
                                >
                                    📝 Submitted
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "approved" ? "active fw-semibold" : ""}`}
                                    onClick={() => setActiveTab("approved")}
                                >
                                    ✅ Approved
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "denied" ? "active fw-semibold" : ""}`}
                                    onClick={() => setActiveTab("denied")}
                                >
                                    ❌ Denied
                                </button>
                            </li>
                        </ul>

                        {/* 🔹 Tab Content */}
                        <div className="card border-0 shadow-lg rounded-4 mt-3">
                            <div className="card-body p-4">
                                {activeTab === "submitted" && renderTable(submittedEvents, "Submitted")}
                                {activeTab === "approved" && renderTable(approvedEvents, "Approved")}
                                {activeTab === "denied" && renderTable(deniedEvents, "Denied")}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 🔴 NEW: Denial Reason Modal */}
            <Modal show={showDenyModal} onHide={handleCloseDenyModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reason for Denial</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="denialReason">
                            <Form.Label>Please provide a reason for denying this event:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={denialReason}
                                onChange={(e) => setDenialReason(e.target.value)}
                                placeholder="e.g., Incomplete details, scheduling conflict..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDenyModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={denyEvent}>
                        Submit Denial
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}