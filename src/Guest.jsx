import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Calendar from 'react-calendar';
import "react-calendar/dist/Calendar.css"
import "../css/style.css";
import UALOGO from './assets/Ualogo.png';
import FBLOGO from './assets/fblogo.png'
import INSTALOGO from './assets/instalogo.png'
import STAT from './assets/stat.png'
import CCSLOGO from './assets/CCSLOGO.png'
import BG2 from './assets/bg2.jpg'
import CBALOGO from './assets/CBALOGO.png'
import CMSLOGO from './assets/CMSLOGO.png'
import { useNavigate } from 'react-router-dom';
import CCSVID from './assets/CCSMP4.mp4'
import HMVID from './assets/HMVID.mp4'
import axios from 'axios';
import CMSMP4 from './assets/CMS.mp4'
// import Loop from './Loop' // We'll use .map() instead for clarity

// --- ✅ STYLES FOR PROFESSIONAL LAYOUT ---
const HomeStyles = () => (
  <style>{`
    /* Main page layout */
    .page-container {
      margin-top: 7rem; /* Aligns to bottom of 7rem navbar */
      margin-left: 0;
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
      transition: margin-left 0.3s ease-in-out;
      background-color: #f8f9fa; /* A very light gray background */
      min-height: calc(100vh - 7rem);
    }
    
    .page-container-large {
      margin-left: 250px; /* Pushes content right when sidebar is open */
    }

    /* Course Video Cards */
    .course-card {
      position: relative;
      border: none;
      border-radius: 0.75rem;
      overflow: hidden;
      height: 250px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    }
    .course-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    .course-card-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    .course-card-overlay {
      position: relative;
      z-index: 2;
      height: 100%;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.25rem;
      color: white;
    }
    .course-card-logo {
      width: 45px;
      height: 45px;
      margin-bottom: 0.5rem;
    }

    /* Custom React-Calendar Styling */
    .calendar-wrapper .react-calendar {
      width: 100%;
      border: none;
      font-family: 'Arial', sans-serif;
    }
    .react-calendar__tile {
      border-radius: 0.5rem;
      position: relative;
      min-height: 55px;
    }
    .react-calendar__tile--active {
      background: #711212 !important;
      color: white !important;
    }
    .react-calendar__tile--now {
      background: #f0f0f0;
    }
    .react-calendar__navigation button {
      color: #711212;
    }
    .event-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin: 0 auto;
      margin-top: 4px;
      background-color: #711212; /* Default dot color */
    }

    /* Agenda List */
    .agenda-list-group {
      max-height: 250px;
      overflow-y: auto;
    }

    /* Professional Footer */
    .footer-main {
      background-color: #711212;
      color: white;
      padding: 3rem 1.5rem 2rem 1.5rem;
    }
    .footer-main a {
      color: #f0f0f0;
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-main a:hover {
      color: #ffffff;
      text-decoration: underline;
    }
    .footer-social-icon {
      font-size: 1.75rem;
      margin-right: 1rem;
    }
    .footer-copyright {
      background-color: #5a0e0e;
      color: #e0e0e0;
      padding: 1rem;
      text-align: center;
    }
  `}</style>
);


export default function Home() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, sendData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);

  // --- NEW STATE FOR VIDEO MODAL ---
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ✅ REMOVED: user state
  // const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ REMOVED: useEffect for loading user
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // (MODIFIED) Helper function to get events for a specific date
  const getEventsForDate = (date, eventSource) => {
    // Normalize the selected date to ignore time
    const cleanSelectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    return eventSource.filter((event) => {
      const startDate = event.startDate; // Use the new 'startDate' property
      const endDate = event.endDate;   // Use the new 'endDate' property

      // Case 1: Single-day event
      if (!endDate || startDate.getTime() === endDate.getTime()) {
        return startDate.getTime() === cleanSelectedDate.getTime();
      }

      // Case 2: Multi-day event
      // Check if cleanSelectedDate is between startDate and endDate (inclusive)
      return cleanSelectedDate >= startDate && cleanSelectedDate <= endDate;
    });
  };

  // (MODIFIED) Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://dungaw.ua:4435/events");
        const allEvents = Array.isArray(res.data[0]) ? res.data[0] : res.data;
        
        const approvedEvents = allEvents.filter(event => event.EventStatus === "Approved");
        
        // Parse EventStartDate and EventEndDate
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

        sendData(formatted);
        // Set initial events for today
        setSelectedEvents(getEventsForDate(new Date(), formatted));
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []); // Runs once on mount


  // Handle date change on calendar
  const handleDateChange = (value) => {
    setDate(value);
    setSelectedEvents(getEventsForDate(value, data)); // Filter from the main 'data' state
  };

  // --- NEW VIDEO MODAL HANDLERS ---
  const handlePlayVideo = (videoSrc) => {
    setSelectedVideo(videoSrc);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setSelectedVideo(null);
    setShowVideoModal(false);
  };
  
  // --- END NEW HANDLERS ---

  // (MODIFIED) Added CIT
  const deptColors = {
    UA: "#f21010ff",
    CBA: "#6bc6ffff",
    CCIS: "#0d6efd",
    CTE: "#a735dcff",
    CCJE: "#d7ff24ff",
    CAS: "#18bb0cff",
    CEA: "#c9a420ff",
    CIT: "#fd7e14", // Added for consistency
    CMS: "#9E9E9E"
  };

  return (
    <>
      <HomeStyles /> {/* ✅ Inject new styles */}

      {/* ===== NAVBAR (REVERTED) ===== */}
      <div className='container-fluid p-0'>
        <nav
          className="navbar navbar-dark fixed-top d-flex justify-content-between px-3"
          style={{ zIndex: 1050, height: '7rem', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: '#711212ff' }}
        >
          {/* Left Side: Logo and Title */}
          <div className="d-flex align-items-center">
            <img src={UALOGO} className="ua-logo me-2" alt="UA logo" style={{ width: "50px" }} />
            <div className="text-white">
              <div className="fw-bold ua-text">University of Antique</div>
              <div className="smc-text" style={{ fontSize: '0.85rem' }}>Sibalom Main Campus</div>
            </div>
          </div>

          {/* Right Side: Hamburger Button Only */}
          <button className="btn btn-outline-light d-lg-none" onClick={toggleSidebar}>
            ☰
          </button>
        </nav>

        {/* ===== SIDEBAR (Unchanged) ===== */}
        <div
          className={` border-end text-light position-fixed top-0 start-0 h-100 sidebar d-flex flex-column ${sidebarOpen ? "show" : ""}`}
          style={{ width: '250px', zIndex: 1040, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', backgroundColor: '#711212ff', position: 'relative', overflow: 'hidden' }}
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
              <a
                className="nav-link d-flex align-items-center gap-2 active fw-semibold text-light border-light px-3 py-2"
                href="/home"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  marginBottom: '10rem'
                }}
              >
                <i className="bi bi-house-door-fill"></i> Home
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

      {/* ===== ✅ NEW MAIN CONTENT WRAPPER ===== */}
      <div 
        className={`page-container ${isLargeScreen ? 'page-container-large' : ''}`}
      >
        <div className="container-fluid px-lg-4">
          <div className="row g-4">

            {/* --- Main Content Column (Left) --- */}
            <div className="col-lg-8">
              {/* ✅ --- RESPONSIVE CAROUSEL --- */}
              <div id="carouselExampleAutoplaying" className="carousel slide shadow-sm mb-4" data-bs-ride="carousel">
                <div className="carousel-inner rounded-4">
                  <div className="carousel-item active">
                    {/* Removed fixed height style */}
                    <img src={BG2} className="d-block w-100" alt="..." />
                  </div>
                  <div className="carousel-item">
                    {/* Removed fixed height style */}
                    <img src={BG2} className="d-block w-100" alt="..." />
                  </div>
                  <div className="carousel-item">
                    {/* Removed fixed height style */}
                    <img src={BG2} className="d-block w-100" alt="..." />
                  </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>

              {/* --- Redesigned "Discover Courses" Section --- */}
              <h2 className="fw-bold mb-3" style={{ color: "#711212" }}>Discover Departments</h2>
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                
                {/* Card 1: CCIS */}
                <div className="col">
                  <div className="card course-card">
                    <video 
                      src={CCSVID} 
                      className="course-card-video" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    ></video>
                    <div className="course-card-overlay">
                      <img src={CCSLOGO} alt="CCIS" className="course-card-logo" />
                      <h4 className="fw-bold">CCIS</h4>
                      <div className="d-flex gap-2 mt-2">
                        <button 
                          className="btn btn-outline-light btn-sm" 
                          data-bs-toggle="modal" 
                          data-bs-target="#modalCCIS"
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-light btn-sm d-flex align-items-center gap-1"
                          onClick={() => handlePlayVideo(CCSVID)}
                        >
                          <i className="bi bi-play-fill"></i> Play Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: CBA */}
                <div className="col">
                  <div className="card course-card">
                    <video 
                      src={HMVID} 
                      className="course-card-video" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    ></video>
                    <div className="course-card-overlay">
                      <img src={CBALOGO} alt="CBA" className="course-card-logo" />
                      <h4 className="fw-bold">CBA</h4>
                      <div className="d-flex gap-2 mt-2">
                        <button 
                          className="btn btn-outline-light btn-sm" 
                          data-bs-toggle="modal" 
                          data-bs-target="#modalCBA"
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-light btn-sm d-flex align-items-center gap-1"
                          onClick={() => handlePlayVideo(HMVID)}
                        >
                          <i className="bi bi-play-fill"></i> Play Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: CMS */}
                <div className="col">
                  <div className="card course-card">
                    <video 
                      src={CMSMP4} 
                      className="course-card-video" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    ></video>
                    <div className="course-card-overlay">
                      <img src={CMSLOGO} alt="CMS" className="course-card-logo" />
                      <h4 className="fw-bold">CMS</h4>
                      <div className="d-flex gap-2 mt-2">
                        <button 
                          className="btn btn-outline-light btn-sm" 
                          data-bs-toggle="modal" 
                          data-bs-target="#modalCMS"
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-light btn-sm d-flex align-items-center gap-1"
                          onClick={() => handlePlayVideo(CMSMP4)}
                        >
                          <i className="bi bi-play-fill"></i> Play Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* --- Side Content Column (Right) --- */}
            <div className="col-lg-4">
              {/* Card 1: Calendar */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4 calendar-wrapper">
                  <h5 className="fw-bold text-center mb-3 text-danger">
                    <i className="bi bi-calendar3 me-2"></i>Academic Calendar
                  </h5>
                  <Calendar
                    onChange={handleDateChange}
                    value={date}
                    className="border-0"
                    tileContent={({ date, view }) => {
                      if (view !== 'month') return null;
                      // ✅ THIS LOGIC IS NOW CORRECT
                      const eventsForDay = getEventsForDate(date, data); 
                      if (eventsForDay.length > 0) {
                        return (
                          <div 
                            className="event-dot" 
                            style={{ backgroundColor: deptColors[eventsForDay[0].EventDept] || '#bbb' }}
                          ></div>
                        );
                      }
                      return null;
                    }}
                  />
                </div>
              </div>

              {/* Card 2: Today's Agenda */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-center mb-3 text-danger">
                    <i className="bi bi-list-check me-2"></i>Agenda for {date.toDateString()}
                  </h5>
                  <div className="agenda-list-group">
                    {/* ✅ THIS LIST WILL NOW BE CORRECT */}
                    {selectedEvents.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {selectedEvents.map((event, i) => (
                          <li key={i} className="list-group-item d-flex align-items-center gap-2 px-1">
                            <span
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: deptColors[event.EventDept] || '#bbb',
                                borderRadius: "50%",
                                flexShrink: 0
                              }}
                            ></span>
                            <div>
                              <span className="fw-semibold">{event.EventName}</span>
                              <small className="text-muted d-block">{event.EventTime} • {event.EventVenue}</small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-center fst-italic mt-3">
                        No events scheduled for this day.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* ===== PROFESSIONAL FOOTER (Unchanged) ===== */}
      <footer 
        className="footer-main"
        style={{
          marginLeft: isLargeScreen ? "250px" : "0",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <div className="container-fluid px-lg-5">
          <div className="row g-4">
            <div className="col-md-5">
              <div className="d-flex align-items-center mb-2">
                <img src={UALOGO} alt="UA Logo" style={{width: "40px"}} className="me-2" />
                <h5 className="fw-bold mb-0">University of Antique</h5>
              </div>
              <p className="small" style={{color: "#f0f0f0"}}>
                Sibalom Main Campus, Sibalom, Antique
              </p>
              <p className="small" style={{color: "#f0f0f0"}}>
                © 2025 University of Antique. All Rights Reserved.
              </p>
            </div>
            <div className="col-md-3 col-6">
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="/home">Home</a></li>
              </ul>
            </div>
            <div className="col-md-4 col-6">
              <h6 className="fw-bold mb-3">Follow Us</h6>
              <div>
                <a href="https://www.facebook.com/universityofantique" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://www.instagram.com/universityofantique/" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <i className="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div 
        className="footer-copyright"
        style={{
          marginLeft: isLargeScreen ? "250px" : "0",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <small>Powered by Dungaw | A University Event Management System</small>
      </div>


      {/* --- NEW VIDEO MODAL --- */}
      {showVideoModal && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(5px)' 
          }}
          onClick={handleCloseVideoModal} // Close on backdrop click
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0">
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseVideoModal}
                  style={{fontSize: '1.2rem'}}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <video src={selectedVideo} controls autoPlay>
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REDESIGNED COURSE MODALS (Unchanged) --- */}

      {/* Modal 1: CCIS */}
      <div className="modal fade" id="modalCCIS" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#711212" }}>
              <div className="d-flex align-items-center gap-3">
                <img src={CCSLOGO} alt="CCIS" style={{width: '40px', height: '40px'}} />
                <h5 className="modal-title fw-bold mb-0">
                  College of Computing and Information Science
                </h5>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <p className="fs-6 text-secondary mb-3" style={{ lineHeight: "1.7", textAlign: "justify" }}>
                At the <strong>College of Computing and Information Sciences</strong>,
                innovation starts with you. Step into the world of technology, where
                ideas become systems, and passion turns into progress.
              </p>
              <p className="fs-6 text-secondary mb-3" style={{ lineHeight: "1.7", textAlign: "justify" }}>
                From programming and cybersecurity to data science and AI,
                we prepare you to lead the digital age.
              </p>
              <blockquote className="blockquote border-start border-5 border-danger ps-3 my-4">
                <p className="mb-0 fst-italic fs-5" style={{color: "#555"}}>"Think smart. Code bold. Innovate without limits."</p>
              </blockquote>
              <div className="text-end mt-4">
                <span className="fw-bold" style={{ color: "#7a1113", fontSize: "1.05rem" }}>
                  The future is written in code — and it begins here, at CCIS. 🚀
                </span>
              </div>
            </div>
            
            <div className="modal-footer bg-light border-top">
              <button type="button" className="btn btn-outline-danger px-4 fw-semibold" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 2: CBA */}
      <div className="modal fade" id="modalCBA" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#711212" }}>
              <div className="d-flex align-items-center gap-3">
                <img src={CBALOGO} alt="CBA" style={{width: '40px', height: '40px'}} />
                <h5 className="modal-title fw-bold mb-0">
                  College of Business and Accountancy
                </h5>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <p className="fs-6 text-secondary mb-3" style={{ lineHeight: "1.7", textAlign: "justify" }}>
                At the <strong>College of Business and Accountancy</strong>,
                we don’t just train professionals — we craft world-class hosts and leaders.
                Step into a world of elegance, creativity, and genuine care,
                where every smile creates an unforgettable experience.
              </p>
              <p className="fs-6 text-secondary mb-3" style={{ lineHeight: "1.7", textAlign: "justify" }}>
                From hotel management to culinary arts, tourism, and events,
                we turn your talent for service into a global opportunity.
              </p>
              <blockquote className="blockquote border-start border-5 border-danger ps-3 my-4">
                <p className="mb-0 fst-italic fs-5" style={{color: "#555"}}>"Serve with heart. Lead with excellence. Shine in hospitality."</p>
              </blockquote>
              <div className="text-end mt-4">
                <span className="fw-bold" style={{ color: "#7a1113", fontSize: "1.05rem" }}>
                  Your journey to the world stage begins here! 🌍🍽️✨
                </span>
              </div>
            </div>
            
            <div className="modal-footer bg-light border-top">
              <button type="button" className="btn btn-outline-danger px-4 fw-semibold" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 3: CMS */}
      <div className="modal fade" id="modalCMS" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#711212" }}>
              <div className="d-flex align-items-center gap-3">
                <img src={CMSLOGO} alt="CMS" style={{width: '40px', height: '40px'}} />
                <h5 className="modal-title fw-bold mb-0">
                  College of Maritime Studies
                </h5>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <p className="fs-6 text-secondary mb-3" style={{ lineHeight: "1.7", textAlign: "justify" }}>
                At the <strong>College of Maritime Studies</strong>,
                we don’t just teach navigation and engineering — we build leaders of
                the seas. Step aboard and experience hands-on training, modern facilities,
                and a brotherhood that sails beyond borders.
              </p>
              <p className="fs-6 text-secondary mb-3" style={{ lineHeight: "1.7", textAlign: "justify" }}>
                Whether you dream of steering massive vessels across the ocean
                or keeping their powerful engines alive, your journey starts here.
              </p>
              <blockquote className="blockquote border-start border-5 border-danger ps-3 my-4">
                <p className="mb-0 fst-italic fs-5" style={{color: "#555"}}>"Be bold. Be disciplined. Be a mariner."</p>
              </blockquote>
              <div className="text-end mt-4">
                <span className="fw-bold" style={{ color: "#7a1113", fontSize: "1.05rem" }}>
                  The world is waiting — your voyage begins now! ⚓
                </span>
              </div>
            </div>
            
            <div className="modal-footer bg-light border-top">
              <button type="button" className="btn btn-outline-danger px-4 fw-semibold" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}