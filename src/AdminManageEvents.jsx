import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UALOGO from "./assets/Ualogo.png";
import FBLOGO from "./assets/fblogo.png";
import INSTALOGO from "./assets/instalogo.png";
import STAT from "./assets/stat.png";

export default function AdminManageEvents() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const fetchEvents = async () => {
        try {
            const res = await axios.get("http://dungaw.ua:4435/events");
            const data = Array.isArray(res.data[0]) ? res.data[0] : res.data;
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const deleteEvent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await axios.post("http://dungaw.ua:4435/events/delete", { id });
            alert("✅ Event deleted successfully!");
            fetchEvents();
        } catch (err) {
            console.error("Delete error:", err);
            alert("❌ Failed to delete event");
        }
    };

    return (
        <div className="container-fluid">
            {/* Navbar */}
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

            {/* Sidebar */}
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
                        <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                            University of Antique
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            Sibalom Campus
                        </div>
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
                            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
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
                        <a className="nav-link text-light px-3 py-2 d-flex align-items-center gap-2" href="/event-scanner">
                            <i className="bi bi-qr-code-scan"></i> Scanner
                        </a>
                    </li>

                    
                    <li className="nav-item mb-2 justify-content-center d-flex" style={{marginTop:"20rem"}} >
                        <a
                            className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded text-center"
                            href="/admin"
                        >
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
                    }}
                />
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-lg-12 d-flex justify-content-end">
                    <div
                        style={{
                            paddingTop: "6rem",
                            marginTop: "3rem",
                            maxWidth: "1400px",
                            width: "100%",
                            marginRight: "2rem"
                        }}
                    >
                        {/* Header Section */}
                        <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                            <h3 className="fw-bold text-dark mb-0">
                                Manage Events <i className="bi bi-calendar-event-fill text-danger ms-2"></i>
                            </h3>

                            <div className="d-flex gap-2">
                                {/* Add Event Button (unchanged) */}
                                <button
                                    className="btn btn-outline-danger fw-semibold"
                                    onClick={() => navigate("/adminEvents")}
                                >
                                    <i className="bi bi-plus-circle me-2"></i> Add Event
                                </button>

                                {/* NEW: Event Approval Button */}
                                <button
                                    className="btn btn-danger fw-semibold text-white"
                                    style={{ backgroundColor: "#711212ff", border: "none" }}
                                    onClick={() => navigate("/eventApproval")}
                                >
                                    <i className="bi bi-check2-square me-2"></i> Event Approval
                                </button>
                            </div>
                        </div>



                        <div
                            className="card border-0 shadow-lg rounded-4 mt-5"
                            style={{
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <div className="card-body p-4">
                                <div className="table-responsive">
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
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-center">
                                            {events.length > 0 ? (
                                                events.map((event, i) => (
                                                    <tr
                                                        key={i}
                                                        style={{
                                                            transition: "background-color 0.3s",
                                                        }}
                                                        className="hover-row"
                                                    >
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
                                                        <td>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm rounded-circle"
                                                                onClick={() => deleteEvent(event.EventID)}
                                                                title="Delete Event"
                                                            >
                                                                <i className="bi bi-trash3-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="py-4 text-muted">
                                                        No events found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
