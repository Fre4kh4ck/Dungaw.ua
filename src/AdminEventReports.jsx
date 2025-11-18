import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Calendar from 'react-calendar';
import "react-calendar/dist/Calendar.css";
import "../css/style.css";
import UALOGO from './assets/Ualogo.png';
import STAT from './assets/stat.png';
import Loop from './Loop';
import axios from 'axios';
import Tick from './Tick';

// Imports for downloads
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// --- ✅ NEW STYLES FOR A PROFESSIONAL LAYOUT ---
const ReportStyles = () => (
    <style>{`
        /* Page container adjustments */
        .page-container {
            margin-top: 7rem; /* Aligns to bottom of 7rem navbar */
            margin-left: 0;
            padding: 2rem;
            transition: margin-left 0.3s ease-in-out;
        }

        .page-container-large {
            margin-left: 250px; /* Pushes content right when sidebar is open */
        }

        /* New Page Header */
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap; /* Allows filters to stack on small screens */
            gap: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #dee2e6;
        }

        .page-header h1 {
            color: #711212;
            margin-bottom: 0;
        }

        .page-filters {
            display: flex;
            gap: 1rem;
        }

        /* Real CSS Grid for event cards */
        .events-grid-reports {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 1.5rem;
        }

        /* Modern Card Styling */
        .report-event-card {
            display: flex;
            background-color: #fff;
            border: 1px solid #e9ecef;
            border-radius: 0.5rem; /* 8px */
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
            transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }

        .report-event-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .report-event-image {
            flex-basis: 150px; /* Fixed width for image */
            flex-shrink: 0;
            background-size: cover;
            background-position: center;
            border-right: 1px solid #e9ecef;
        }

        .report-event-details {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        
        .report-event-details h5 {
            color: #343a40;
        }
    `}</style>
);


export default function AdminEventReports() {
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [joinCounts, setJoinCounts] = useState({});

    // Unchanged useEffect hooks
    useEffect(() => {
        Tick(fetchEvents);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Unchanged fetch logic
    const fetchEvents = async () => {
        try {
            const res = await axios.get("http://dungaw.ua:4435/events");
            const rows = Array.isArray(res.data[0]) ? res.data[0] : res.data;
            setData(rows);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const handleViewReport = async (event) => {
        try {
            setSelectedEvent(event);
            const res = await axios.get(`http://dungaw.ua:4435/event/${event.EventID}/participants`);
            setParticipants(res.data);
            setShowModal(true);
        } catch (err) {
            console.error("Error fetching participants:", err);
            setParticipants([]);
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
        setParticipants([]);
    };

    // --- Helper Functions for Reports ---
    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return new Date(timeString).toLocaleTimeString();
    };

    const formatDateTime = (timeString) => {
        if (!timeString) return "N/A";
        return new Date(timeString).toLocaleString();
    };

    // --- Print Function (Unchanged) ---
    const handlePrintReport = () => {
        if (!selectedEvent) return;

        const maskEmail = (email) => {
            if (!email || typeof email !== "string") return "N/A";
            const [localPart, domain] = email.split("@");
            if (!localPart || !domain) return email;
            const visiblePart = localPart.slice(0, 3);
            const maskedPart = "*".repeat(Math.max(localPart.length - 3, 0));
            return `${visiblePart}${maskedPart}@${domain}`;
        };

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
    <html>
      <head>
        <title>${selectedEvent.EventName} - Attendance Report</title>
        <style>
          @page { size: portrait; margin: 20mm; }
          body { font-family: Arial, sans-serif; margin: 0; color: #000; }
          h2, h3 { color: #711212; margin-bottom: 4px; }
          p { margin: 3px 0; font-size: 12px; }
          h2 { font-size: 20px; }
          h3 { font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; table-layout: fixed; word-wrap: break-word; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 10px; }
          th { background-color: #f5f5f5; color: #000; }
          th:nth-child(1) { width: 5%; }
          th:nth-child(2) { width: 25%; }
          th:nth-child(3) { width: 25%; }
          th:nth-child(4) { width: 18%; }
          th:nth-child(5) { width: 13%; }
          th:nth-child(6) { width: 14%; }
        </style>
      </head>
      <body>
        <h2>${selectedEvent.EventName}</h2>
        <p><b>Date:</b> ${new Date(selectedEvent.EventDate).toDateString()}</p>
        <p><b>Venue:</b> ${selectedEvent.EventVenue}</p>
        <p><b>Department:</b> ${selectedEvent.EventDept}</p>
        <h3>Participants:</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.name || "N/A"}</td>
                <td>${maskEmail(p.email)}</td>
                <td>${formatDateTime(p.joinedAt)}</td>
                <td>${formatTime(p.timeIn)}</td>
                <td>${formatTime(p.timeOut)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };


    // --- Download Functions (Unchanged) ---
    const handleDownloadPDF = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        const doc = new jsPDF({ orientation: 'portrait' });
        doc.setFontSize(18);
        doc.text(selectedEvent.EventName, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Date: ${new Date(selectedEvent.EventDate).toDateString()}`, 14, 30);
        doc.text(`Venue: ${selectedEvent.EventVenue}`, 14, 36);
        const tableColumn = ["#", "Name", "Email", "Joined On", "Time In", "Time Out"];
        const tableRows = [];
        participants.forEach((p, i) => {
            const participantData = [
                i + 1,
                p.name || "N/A",
                p.email,
                formatDateTime(p.joinedAt),
                formatTime(p.timeIn),
                formatTime(p.timeOut)
            ];
            tableRows.push(participantData);
        });
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 8 },
            columnStyles: { 2: { cellWidth: 40 }, 3: { cellWidth: 35 } }
        });
        doc.save(`${selectedEvent.EventName}_report.pdf`);
    };

    const handleDownloadExcel = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        const header = [
            ["Event:", selectedEvent.EventName],
            ["Date:", new Date(selectedEvent.EventDate).toDateString()],
            ["Venue:", selectedEvent.EventVenue],
            []
        ];
        const tableHeaders = ["#", "Name", "Email", "Joined On", "Time In", "Time Out"];
        const tableBody = participants.map((p, i) => [
            i + 1,
            p.name || "N/A",
            p.email,
            formatDateTime(p.joinedAt),
            formatTime(p.timeIn),
            formatTime(p.timeOut)
        ]);
        const ws = XLSX.utils.aoa_to_sheet([...header, tableHeaders, ...tableBody]);
        ws['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 15 }
        ];
        ws['!merges'] = [
            { s: { r: 0, c: 1 }, e: { r: 0, c: 5 } },
            { s: { r: 1, c: 1 }, e: { r: 1, c: 5 } },
            { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
        XLSX.writeFile(wb, `${selectedEvent.EventName}_report.xlsx`);
    };

    const handleDownloadWord = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        const participantsHtml = participants.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${p.name || "N/A"}</td>
                <td>${p.email}</td>
                <td>${formatDateTime(p.joinedAt)}</td>
                <td>${formatTime(p.timeIn)}</td>
                <td>${formatTime(p.timeOut)}</td>
            </tr>
        `).join("");
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${selectedEvent.EventName} Report</title>
                <style>
                    @page { mso-page-orientation: portrait; size: 8.5in 11.0in; margin: 1.0in; }
                    body { font-family: Arial, sans-serif; font-size: 11pt; }
                    h2 { font-size: 16pt; color: #711212; }
                    h3 { font-size: 14pt; color: #000000; }
                    p { font-size: 11pt; margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 10pt; mso-table-layout-alt: fixed; }
                    th, td { border: 1px solid #999; padding: 6px; word-wrap: break-word; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>${selectedEvent.EventName}</h2>
                <p><b>Date:</b> ${new Date(selectedEvent.EventDate).toDateString()}</p>
                <p><b>Venue:</b> ${selectedEvent.EventVenue}</p>
                <p><b>Department:</b> ${selectedEvent.EventDept}</p>
                <br/>
                <h3>Participants:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${participantsHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${selectedEvent.EventName}_report.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };
    // --- END OF DOWNLOAD FUNCTIONS ---


    // (Unchanged)
    const filteredEvents = data.filter((event) => {
        const name = event.EventName || "";
        const category = event.EventCategory || "";
        const location = event.EventLocation || "";
        const venue = event.EventVenue || "";
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === "" || event.EventDept === selectedDept;
        const isApproved = event.EventStatus === "Approved";
        return matchesSearch && matchesDept && isApproved;
    });

    // (Unchanged)
    useEffect(() => {
        const fetchJoinCounts = async () => {
            const counts = {};
            await Promise.all(
                filteredEvents.map(async (event) => {
                    try {
                        const res = await axios.get(`http://dungaw.ua:4435/event/${event.EventID}/join-count`);
                        counts[event.EventID] = res.data.total || 0;
                    } catch (err) {
                        console.error("Error fetching join count for event", event.EventID, err);
                        counts[event.EventID] = 0;
                    }
                })
            );
            setJoinCounts(counts);
        };

        if (filteredEvents.length > 0) fetchJoinCounts();
    }, [filteredEvents]);


    return (
        <>
            <ReportStyles /> {/* ✅ ADD THE NEW STYLES */}

            {/* Navbar (Unchanged) */}
            <div className='container-fluid p-0'>
                <nav className="navbar navbar-dark fixed-top d-flex justify-content-between px-3 shadow-sm"
                    style={{ zIndex: 1050, height: '7rem', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: '#711212' }}>
                    <div className="d-flex align-items-center">
                        <img src={UALOGO} className="ua-logo me-2" alt="UA logo" style={{ width: "50px" }} />
                        <div className="text-white">
                            <div className="fw-bold ua-text fs-5">University of Antique</div>
                            <div className="smc-text" style={{ fontSize: '0.9rem' }}>Sibalom Main Campus</div>
                        </div>
                    </div>
                    <button className="btn btn-outline-light d-lg-none" onClick={toggleSidebar}>☰</button>
                </nav>

                {/* ✅ --- SIDEBAR WITH SCANNER LINK --- */}
                <div className={`border-end text-light position-fixed top-0 start-0 h-100 sidebar d-flex flex-column ${sidebarOpen ? "show" : ""}`}
                    style={{ width: '250px', zIndex: 1040, backgroundColor: '#711212' }}>
                    <div className="px-4 pt-4 pb-2 border-bottom d-flex align-items-center gap-2">
                        <img src={UALOGO} alt="UA logo" style={{ width: '40px' }} />
                        <div>
                            <div className="fw-bold">University of Antique</div>
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
                        <li className="nav-item mb-2">
                            <a className="nav-link text-light px-3 py-2 d-flex align-items-center gap-2" href="/manageEvents">
                                <i className="bi bi-calendar2-event"></i> Manage Events
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link text-light px-3 py-2 d-flex align-items-center gap-2 active"
                                style={{ borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                href="/adminEventReports">
                                <i className="bi bi-file-earmark-bar-graph"></i> Event Reports
                            </a>
                        </li>
                        {/* ✅ ADDED SCANNER LINK */}
                        <li className="nav-item mb-2">
                            <a className="nav-link text-light px-3 py-2 d-flex align-items-center gap-2" href="/event-scanner">
                                <i className="bi bi-qr-code-scan"></i> Scanner
                            </a>
                        </li>

                        {/* --- MODIFIED LINE: Removed mt-auto --- */}
                        <li className="nav-item mb-4 d-flex justify-content-center" style={{ marginTop: "20rem" }}>
                            <a className="nav-link text-light d-flex align-items-center gap-2" href="/admin">
                                <i className="bi bi-box-arrow-right"></i> Log out
                            </a>
                        </li>
                    </ul>

                    <img src={STAT} alt="Sidebar design"
                        style={{
                            position: "absolute",
                            bottom: "-4.5rem",
                            left: "50%",
                            transform: "translateX(-55%)",
                            width: "400px",
                            opacity: 0.9,
                            zIndex: -1,
                            pointerEvents: "none",
                        }} />
                </div>
            </div>


            {/* ✅ --- NEW PROFESSIONAL LAYOUT --- */}
            <div className={`page-container ${isLargeScreen ? 'page-container-large' : ''}`}>

                {/* New Header with Filters */}
                <div className="page-header">
                    <h1 className="fw-bold">Event Reports</h1>
                    <div className="page-filters">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search events..."
                            style={{ width: '250px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="form-select"
                            style={{ width: '200px' }}
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option value="">All Departments</option>
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
                </div>

                {/* New Event Card Grid */}
                <div className="events-grid-reports">
                    {filteredEvents.length > 0 ? (
                        <Loop repeat={filteredEvents.length}>
                            {(index) => {
                                const event = filteredEvents[index];
                                return (
                                    <div key={index} className="report-event-card">
                                        <div
                                            className="report-event-image"
                                            style={{
                                                backgroundImage: `url(${event.EventPhoto
                                                    ? `http://dungaw.ua:4435/api/upload/${event.EventPhoto}`
                                                    : "/fallback.jpg"
                                                    })`
                                            }}>
                                        </div>

                                        <div className="report-event-details">
                                            <h5 className="fw-bold mb-1">{event.EventName}</h5>
                                            <p className="text-muted mb-2"><i className="bi bi-people-fill"></i> {joinCounts[event.EventID] ?? 0} Joiners</p>

                                            <div className="mt-auto">
                                                <p className="text-muted small mb-1">
                                                    <i className="bi bi-calendar-event text-danger"></i>{" "}
                                                    {new Date(event.EventDate).toDateString()}
                                                </p>
                                                <p className="text-muted small mb-3">
                                                    <i className="bi bi-geo-alt text-primary"></i>{" "}
                                                    {event.EventVenue}
                                                </p>

                                                <button
                                                    className="btn text-white fw-semibold w-100"
                                                    style={{ background: "linear-gradient(90deg, #711212, #9b1b1b)", border: "none" }}
                                                    onClick={() => handleViewReport(event)}
                                                >
                                                    <i className="bi bi-file-earmark-text me-1"></i> View Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                        </Loop>
                    ) : (
                        <div className="col-12">
                            <h3 className="text-center text-muted mt-5">No approved events found.</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL (Unchanged) --- */}
            {showModal && selectedEvent && (
                <div className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(255, 255, 255, 0.43)", backdropFilter: "blur(1px)" }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header text-white" style={{ backgroundColor: "#711212" }}>
                                <h5 className="modal-title fw-bold">{selectedEvent.EventName} – Attendance Report</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                {participants.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Joined On</th>
                                                    <th>Time In</th>
                                                    <th>Time Out</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {participants.map((p, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>{p.name || "N/A"}</td>
                                                        <td>{p.email}</td>
                                                        <td>{formatDateTime(p.joinedAt)}</td>
                                                        <td>{formatTime(p.timeIn)}</td>
                                                        <td>{formatTime(p.timeOut)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted">No participants found.</p>
                                )}
                            </div>

                            <div className="modal-footer border-0 d-flex justify-content-end gap-2">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-primary fw-semibold dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        disabled={participants.length === 0}
                                    >
                                        <i className="bi bi-download me-1"></i> Download Report
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><a className="dropdown-item" href="#" onClick={(e) => handleDownloadPDF(e)}>
                                            <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i> as PDF
                                        </a></li>
                                        <li><a className="dropdown-item" href="#" onClick={(e) => handleDownloadExcel(e)}>
                                            <i className="bi bi-file-earmark-excel-fill text-success me-2"></i> as Excel
                                        </a></li>
                                        <li><a className="dropdown-item" href="#" onClick={(e) => handleDownloadWord(e)}>
                                            <i className="bi bi-file-earmark-word-fill text-primary me-2"></i> as Word (.doc)
                                        </a></li>
                                    </ul>
                                </div>
                                <button
                                    className="btn text-white fw-semibold"
                                    style={{ backgroundColor: "#711212" }}
                                    onClick={handlePrintReport}
                                    disabled={participants.length === 0}
                                >
                                    <i className="bi bi-printer me-1"></i> Print
                                </button>
                                <button className="btn btn-secondary fw-semibold" onClick={handleCloseModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}