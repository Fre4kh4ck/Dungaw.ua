import React, { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Calendar from 'react-calendar';
import "react-calendar/dist/Calendar.css";
import UALOGO from './assets/Ualogo.png';
import FBLOGO from './assets/fblogo.png';
import INSTALOGO from './assets/instalogo.png';
import STAT from './assets/stat.png';

export default function AdminHome() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [submittedEvents, setSubmittedEvents] = useState([]);
    const [approvedEvents, setApprovedEvents] = useState([]);
    const [deniedEvents, setDeniedEvents] = useState([]);
    const [activeTab, setActiveTab] = useState("Submitted");

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // 🔹 Fetch events based on status
    const fetchEvents = async () => {
        const statuses = ["Submitted", "Approved", "Denied"];
        for (const status of statuses) {
            const { data } = await axios.get(`http://dungaw.ua:4435/events/status/${status}`);
            if (status === "Submitted") setSubmittedEvents(data);
            else if (status === "Approved") setApprovedEvents(data);
            else setDeniedEvents(data);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // --- 🔴 MODIFIED: renderEvents function to show denial reason ---
    const renderEvents = (events) => (
        <div className="row">
            {events.map((event) => {

                const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                let dateDisplay = "";

                if (event.EventStartDate) {
                    const startDate = new Date(event.EventStartDate).toLocaleDateString('en-US', formatOptions);
                    dateDisplay = startDate;

                    if (event.EventEndDate && event.EventEndDate !== event.EventStartDate) {
                        const endDate = new Date(event.EventEndDate).toLocaleDateString('en-US', formatOptions);
                        dateDisplay = `${startDate} - ${endDate}`;
                    }
                }

                return (
                    <div key={event.EventID} className="col-md-4 mb-4">
                        <div className="card shadow-sm">
                            <img
                                src={`http://dungaw.ua:4435/api/upload/${event.EventPhoto}`}
                                alt="Event"
                                className="card-img-top"
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <div className="card-body">
                                <h5 className="card-title fw-bold">{event.EventName}</h5>
                                <p className="card-text">
                                    <b>Date:</b> {dateDisplay}<br />
                                    <b>Time:</b> {event.EventTime}<br />
                                    <b>Venue:</b> {event.EventVenue}
                                </p>

                                {/* 🔴 NEW: Conditionally render the denial reason */}
                                {event.EventDenialReason && (
                                    <div
                                        className="p-2 rounded mt-2"
                                        style={{ backgroundColor: '#fff3f3', border: '1px solid #ffdede' }}
                                    >
                                        <b className="text-danger">Reason for Denial:</b>
                                        <p className="text-danger mb-0" style={{ whiteSpace: "normal" }}>
                                            {event.EventDenialReason}
                                        </p>
                                    </div>
                                )}
                                {/* 🔴 END OF NEW CODE */}

                                <p className="small text-muted mt-3 mb-0">{event.EventDept}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
    // --- END OF MODIFICATION ---

    const submitData = async (e) => {
        e.preventDefault();

        // 1. GET THE FILE
        const file = e.target.photo.files[0];

        // 2. VALIDATE FILE TYPE (Check if it is JPG/JPEG)
        if (file) {
            const fileType = file.type; // returns "image/jpeg" or "image/png" etc.
            const fileName = file.name.toLowerCase();

            // Check if it is NOT a jpeg
            if (fileType !== "image/jpeg" && !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
                alert("❌ Only JPEG or JPG files are allowed!");
                return; // STOP the function here
            }
        }

        const formData = new FormData();
        formData.append("title", e.target.title.value);
        formData.append("time", e.target.time.value);
        formData.append("startDate", e.target.startDate.value);
        formData.append("endDate", e.target.endDate.value);
        formData.append("venue", e.target.venue.value);
        formData.append("description", e.target.description.value);
        formData.append("photo", file); // Use the file variable we defined above
        formData.append("dept", e.target.dept.value);

        try {
            await axios.post("http://dungaw.ua:4435/addevent/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("✅ Event added successfully!");
            e.target.reset();
            fetchEvents();
        } catch (err) {
            console.error("Upload error:", err);
            alert("❌ Failed to add event");
        }
    };

    return (
        <>
            <div className='container-fluid'>
                {/* 🔴 Navbar (No changes) ... */}
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

                {/* 🔴 Sidebar (No changes) ... */}
                <div
                    className={`border-end text-light position-fixed top-0 start-0 h-100 sidebar d-flex flex-column ${sidebarOpen ? "show" : ""}`}
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
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
                                href="/adminEvents" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                                <i className="bi bi-calendar2-event"></i> Events
                            </a>
                        </li>
                        <li className="nav-item mb-3" >
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded" href="/accounts">
                                <i className="bi bi-people-fill"></i> Admin
                            </a>
                        </li>

                        <li className="nav-item mb-2 justify-content-center d-flex" style={{ marginTop: "30rem" }}>
                            <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded text-center" href="/admin">
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

                {/* 🔴 Main Content */}
                <div className="col-sm-12 d-flex justify-content-end mt-5">
                    <div
                        className="ms-0 ms-md-5 w-100"
                        style={{
                            marginLeft: '250px',
                            paddingTop: '8rem',
                            paddingRight: '2rem',
                            paddingLeft: '2rem',
                            maxWidth: '1400px'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold text-dark">Submit Event</h3>
                        </div>

                        <div className="card shadow-sm border-0 mb-4 w-100">
                            <div className="card-body">
                                <form onSubmit={submitData}>
                                    <div className="row mb-3">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Event Title</label>
                                            <input type="text" className="form-control" name="title" placeholder="Enter event title" required />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold">Start Date</label>
                                            <input type="date" className="form-control" name="startDate" required />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold">End Date (Optional)</label>
                                            <input type="date" className="form-control" name="endDate" />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold">Venue</label>
                                            <input type="text" className="form-control" name="venue" placeholder="Enter venue" required />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold">Department</label>
                                            <select className="form-select" name="dept" required>
                                                <option value="">Select Department</option>
                                                <option value="UA">UA</option>
                                                <option value="CCIS">CCIS</option>
                                                <option value="CBA">CBA</option>
                                                <option value="CTE">CTE</option>
                                                <option value="CCJE">CCJE</option>
                                                <option value="CAS">CAS</option>
                                                <option value="CEA">CEA</option>
                                                <option value="CCMS">CMS</option>
                                                <option value="CIT">CIT</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold">Time</label>
                                            <input type="time" className="form-control" name="time" required />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label fw-bold">Description</label>
                                            <textarea className="form-control" name="description" placeholder="Enter event description" rows="3" required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Event Photo</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".jpg, .jpeg, image/jpeg" // ✅ Limits file picker to JPGs
                                            name="photo"
                                            required
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end">
                                        <button
                                            type="submit"
                                            className="btn btn-danger px-4 py-2 fw-bold"
                                            style={{ backgroundColor: '#711212ff', border: 'none' }}
                                        >
                                            <i className="bi bi-send-fill me-2"></i> Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0 mb-4 w-100 mt-4">
                            <div className="card-body">
                                <h4 className="fw-bold mb-3">Event Management</h4>
                                <ul className="nav nav-tabs mb-3">
                                    {["Submitted", "Approved", "Denied"].map((tab) => (
                                        <li className="nav-item" key={tab}>
                                            <button
                                                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {activeTab === "Submitted" && renderEvents(submittedEvents)}
                                {activeTab === "Approved" && renderEvents(approvedEvents, false)}
                                {activeTab === "Denied" && renderEvents(deniedEvents, false)}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}