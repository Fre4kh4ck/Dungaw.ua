import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/style.css"; // Your custom styles
import UALOGO from "./assets/Ualogo.png";
import STAT from "./assets/stat.png";
import FBLOGO from "./assets/fblogo.png";
import INSTALOGO from "./assets/instalogo.png";

// --- ✅ NEW STYLES FOR CALENDAR & LAYOUT ---
const CalendarStyles = () => (
  <style>{`
    /* Main page layout */
    .page-container {
      margin-top: 7rem; /* Aligns to bottom of 7rem navbar */
      margin-left: 0;
      padding: 1.5rem;
      transition: margin-left 0.3s ease-in-out;
      background-color: #f8f9fa; /* A very light gray background */
      min-height: calc(100vh - 7rem);
    }
    
    .page-container-large {
      margin-left: 250px; /* Pushes content right when sidebar is open */
    }

    /* Professional Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap; 
      gap: 1rem;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }

    .page-header h1 {
      color: #711212;
      margin-bottom: 0;
      font-size: 2.25rem;
    }

    /* Custom React-Calendar Styling */
    .calendar-wrapper {
      width: 100%;
      max-width: 100%;
    }
    .react-calendar {
      width: 100%;
      border: none;
      font-family: 'Arial', sans-serif;
    }
    .react-calendar__tile {
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }
    .react-calendar__tile--active {
      background: #711212 !important;
      color: white !important;
    }
    .react-calendar__tile--active:hover {
      background: #8a1a1a !important;
    }
    .react-calendar__tile--now {
      background: #f0f0f0;
    }
    .react-calendar__tile--now:hover {
      background: #e6e6e6;
    }
    .react-calendar__navigation button {
      font-size: 1.25rem;
      font-weight: bold;
      color: #711212;
    }
    .react-calendar__month-view__weekdays__weekday {
      font-weight: bold;
      color: #333;
      text-decoration: none;
    }

    /* --- Event Dots --- */
    .event-dots-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 3px;
      position: absolute;
      bottom: 5px;
      left: 0;
      right: 0;
    }
    .event-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    /* --- Upcoming Events Agenda --- */
    .agenda-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .agenda-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    .agenda-item:last-child {
      border-bottom: none;
    }
    .agenda-date {
      flex-shrink: 0;
      width: 55px;
      height: 55px;
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-weight: bold;
    }
    .agenda-date span {
      font-size: 1.25rem;
      line-height: 1;
    }
    .agenda-date small {
      font-size: 0.75rem;
      line-height: 1;
      opacity: 0.9;
    }
    .agenda-details {
      flex-grow: 1;
    }
    .agenda-details h6 {
      font-weight: bold;
      margin-bottom: 0;
    }
  `}</style>
);

export default function Calendars() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [events, setEvents] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const deptColors = {
    UA: "#f21010ff",
    CCIS: "#0d6efd",
    CBA: "#00AEEF",
    CTE: "#a735dcff",
    CCJE: "#d7ff24ff",
    CAS: "#18bb0cff",
    CEA: "#c9a420ff",
    CIT: "#fd7e14",
    CMS: "#9E9E9E"
  };

  // ✅ 1. FETCH EVENTS (MODIFIED)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://dungaw.ua:4435/events");
        const data = await res.json();

        const approvedEvents = data.filter(
          (event) => event.EventStatus === "Approved"
        );

        // ✅ Parse EventStartDate and EventEndDate
        const formatted = approvedEvents.map((event) => {
          // Helper to parse dates correctly (ignoring time)
          const parseDate = (dateString) => {
            if (!dateString) return null;
            const date = new Date(dateString);
            // Re-create date to strip time and avoid timezone issues
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
          };
          
          return {
            ...event,
            startDate: parseDate(event.EventStartDate),
            endDate: parseDate(event.EventEndDate),
          }
        }).filter(event => event.startDate); // Filter out any events that had an invalid start date

        setEvents(formatted);
        // Trigger initial date change to load today's events
        handleDateChange(new Date(), formatted, "All Departments");
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);


  // ✅ 2. NEW HELPER FUNCTIONS
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) {
        return "N/A";
    }
    return date.toDateString();
  };

  const formatEventDateRange = (startDate, endDate) => {
    if (!startDate || isNaN(startDate.getTime())) {
        return "N/A";
    }

    const options = { month: 'short', day: 'numeric' };

    // 1. Check if end date exists or is same as start date
    if (!endDate || isNaN(endDate.getTime()) || startDate.toDateString() === endDate.toDateString()) {
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

  // ✅ 3. FILTER EVENTS (MODIFIED)
  // Filters events for the *single selected day*
  const filterEvents = (selectedDate, currentDept, allEvents) => {
    // Normalize selectedDate to ignore time
    const cleanSelectedDate = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth(), 
      selectedDate.getDate()
    );

    const dayEvents = allEvents.filter((event) => {
      const startDate = event.startDate;
      const endDate = event.endDate;

      // Case 1: Single-day event
      if (!endDate || startDate.getTime() === endDate.getTime()) {
        return startDate.getTime() === cleanSelectedDate.getTime();
      }

      // Case 2: Multi-day event
      return cleanSelectedDate >= startDate && cleanSelectedDate <= endDate;
    });

    if (currentDept === "All Departments") {
      setSelectedDayEvents(dayEvents);
    } else {
      setSelectedDayEvents(dayEvents.filter(e => e.EventDept === currentDept));
    }
  };

  // Handle selecting a new date
  const handleDateChange = (value, eventSource = events, deptSource = selectedDept) => {
    setDate(value);
    filterEvents(value, deptSource, eventSource);
  };

  // Handle changing the department filter
  const handleDeptChange = (e) => {
    const newDept = e.target.value;
    setSelectedDept(newDept);
    filterEvents(date, newDept, events); // Re-filter based on the new department
  };

  // ✅ 4. UPCOMING EVENTS (MODIFIED)
  // Get events for the *entire* month (for agenda)
  const upcomingEvents = events
    .filter(event => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date
      // Show event if its start date is today or later
      return event.startDate >= today;
    })
    .sort((a, b) => a.startDate - b.startDate); // Sort by soonest


  // ✅ 5. RENDER EVENT DOTS (MODIFIED)
  // Helper function to render event dots on the calendar
  const renderEventDots = ({ date, view }) => {
    if (view !== 'month') return null;

    // Normalize the calendar tile's date
    const tileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const dayEvents = events.filter((event) => {
      const startDate = event.startDate;
      const endDate = event.endDate;

      // Case 1: Single-day event
      if (!endDate || startDate.getTime() === endDate.getTime()) {
        return startDate.getTime() === tileDate.getTime();
      }

      // Case 2: Multi-day event (check if tileDate is in range)
      return tileDate >= startDate && tileDate <= endDate;
    });

    // Filter by department
    const filteredEvents =
      selectedDept === "All Departments"
        ? dayEvents
        : dayEvents.filter((e) => e.EventDept === selectedDept);

    if (filteredEvents.length === 0) return null;

    // Show up to 3 dots, using the department color
    return (
      <div className="event-dots-container">
        {filteredEvents.slice(0, 3).map((event, i) => (
          <div
            key={i}
            className="event-dot"
            style={{ backgroundColor: deptColors[event.EventDept] || '#bbb' }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <>
      <CalendarStyles /> {/* Inject the new CSS styles */}

      {/* ===== NAVBAR (Unchanged) ===== */}
      <div className="container-fluid p-0">
        <nav
          className="navbar navbar-dark fixed-top d-flex justify-content-between px-3"
          style={{
            zIndex: 1050,
            height: "7rem",
            backgroundColor: "#711212",
            paddingTop: "1rem",
            paddingBottom: "1rem",
          }}
        >
          <div className="d-flex align-items-center">
            <img src={UALOGO} alt="UA logo" style={{ width: "50px" }} />
            <div className="text-white ms-2">
              <div className="fw-bold ua-text">University of Antique</div>
              <div style={{ fontSize: "0.85rem" }}>Sibalom Main Campus</div>
            </div>
          </div>
          <button
            className="btn btn-outline-light d-lg-none"
            onClick={toggleSidebar}
          >
            ☰
          </button>
        </nav>

        {/* ===== SIDEBAR (Unchanged) ===== */}
        <div
          className={`border-end text-light position-fixed top-0 start-0 h-100 sidebar d-flex flex-column ${sidebarOpen ? "show" : ""
            }`}
          style={{
            width: "250px",
            zIndex: 1040,
            backgroundColor: "#711212",
            boxShadow: "2px 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <div className="px-4 pt-4 pb-2 border-bottom d-flex align-items-center gap-2">
            <img src={UALOGO} alt="UA" style={{ width: "40px" }} />
            <div>
              <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                University of Antique
              </div>
              <div className="text-light" style={{ fontSize: "0.85rem" }}>
                Sibalom Campus
              </div>
            </div>
          </div>
          <ul className="nav flex-column mt-5 px-3">
            <li className="nav-item mb-2">
              <a
                className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg"
                href="/home"
              >
                <i className="bi bi-house-door-fill"></i> Home
              </a>
            </li>
            <li className="nav-item mb-2">
              <a
                className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
                href="/calendar"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <i className="bi bi-calendar-event-fill"></i> Calendar
              </a>
            </li>
            <li className="nav-item mb-2">
              <a
                className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg"
                href="/events"
              >
                <i className="bi bi-calendar2-event"></i> Events
              </a>
            </li>
            <li className="nav-item mb-2">
              <a
                className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg"
                href="/chats"
              >
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
              <a
                className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg text-center"
                href="/login"
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
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* ===== ✅ NEW MAIN CONTENT LAYOUT ===== */}
      <div
        className={`page-container ${isLargeScreen ? "page-container-large" : ""
          }`}
      >
        {/* Page Header with Title and Filter */}
        <div className="page-header">
          <h1 className="fw-bold">
            <i className="bi bi-calendar-event-fill me-3"></i>Academic Calendar
          </h1>
          <div className="d-flex align-items-center gap-2">
            <label className="fw-semibold text-secondary mb-0">
              Filter:
            </label>
            <select
              className="form-select shadow-sm border-1"
              value={selectedDept}
              onChange={handleDeptChange}
              style={{ width: "220px" }}
            >
              <option>All Departments</option>
              {Object.keys(deptColors).map((dept) => (
                <option key={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- ✅ NEW LEGEND POSITION --- */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
              <h6 className="fw-bold text-secondary mb-0 me-3">
                <i className="bi bi-palette-fill me-2"></i>Legend:
              </h6>
              {Object.entries(deptColors).map(([dept, color]) => (
                <span
                  key={dept}
                  className="badge d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: `1px solid ${color}`,
                    color: "#333",
                    padding: "0.4em 0.75em"
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: color,
                      borderRadius: "50%",
                    }}
                  ></span>
                  <small className="fw-bold">{dept}</small>
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* --- END NEW LEGEND POSITION --- */}

        {/* Main Content Grid */}
        <div className="row">

          {/* Left Column: Calendar + Selected Events */}
          <div className="col-lg-8 col-md-12 mb-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="calendar-wrapper mx-auto">
                  <Calendar
                    onChange={(value) => handleDateChange(value, events, selectedDept)}
                    value={date}
                    className="border-0"
                    tileContent={renderEventDots}
                  />
                </div>

                {/* --- Selected Date's Events --- */}
                <hr className="my-4" />
                <div>
                  <h5 className="fw-bold mb-3 text-center">
                    Events for {" "}
                    <span className="text-danger">
                      {/* ✅ MODIFIED: Use new formatDate */}
                      {formatDate(date)}
                    </span>
                  </h5>
                  {selectedDayEvents.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {selectedDayEvents.map((event, i) => (
                        <li key={i} className="list-group-item d-flex align-items-center gap-2">
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: deptColors[event.EventDept] || '#bbb',
                              borderRadius: "50%",
                              flexShrink: 0
                            }}
                          ></span>
                          <span className="fw-semibold">{event.EventName}</span>
                          <span className="text-muted small">({event.EventDept})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-center fst-italic">
                      No events scheduled for this day.
                    </p>
                  )}
                </div>
              </div>
              {/* --- Color Legend was removed from here --- */}
            </div>
          </div>

          {/* Right Column: Upcoming Events Agenda */}
          <div className="col-lg-4 col-md-12 mb-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex flex-column">
                <h4 className="fw-bold text-center mb-4 text-danger">
                  <i className="bi bi-clock-history me-2"></i>Upcoming Events
                </h4>

                <div className="agenda-list flex-grow-1">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.slice(0, 10).map((event, i) => (
                      <div key={i} className="agenda-item">
                        <div
                          className="agenda-date"
                          style={{ backgroundColor: deptColors[event.EventDept] || '#bbb' }}
                        >
                          {/* ✅ MODIFIED: Use startDate */}
                          <span>{event.startDate.getDate()}</span>
                          <small>{event.startDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</small>
                        </div>
                        <div className="agenda-details">
                          <h6 className="text-truncate">{event.EventName}</h6>
                          {/* ✅ MODIFIED: Use new date range function */}
                          <p className="text-muted small mb-0 fw-bold" style={{color: "#333 !important"}}>
                            {formatEventDateRange(event.startDate, event.endDate)}
                          </p>
                          <p className="text-muted small mb-0">{event.EventVenue}</p>
                          <p className="text-muted small mb-0">{event.EventDept}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center fst-italic mt-3">
                      No upcoming events.
                    </p>
                  )}
                </div>

                <div className="text-center mt-4">
                  <a
                    href="/events"
                    className="btn btn-outline-danger rounded-pill px-4"
                  >
                    View All Events
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}