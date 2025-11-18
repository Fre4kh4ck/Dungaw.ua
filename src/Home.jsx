import React, { useState, useEffect } from 'react';
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
import axios from 'axios';

// --- STYLES (UPDATED FOR YOUTUBE BACKGROUNDS) ---
const HomeStyles = () => (
  <style>{`
    /* ... (Your existing styles) ... */
    .page-container {
      margin-top: 7rem;
      margin-left: 0;
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
      transition: margin-left 0.3s ease-in-out;
      background-color: #f8f9fa;
      min-height: calc(100vh - 7rem);
    }
    .page-container-large {
      margin-left: 250px;
    }
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
    
    /* --- NEW CSS FOR YOUTUBE BACKGROUNDS --- */
    .youtube-background {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300%; /* Make width massive to emulate object-fit: cover */
      height: 150%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none; /* Prevents clicking YouTube UI */
      border: none;
    }
    /* --------------------------------------- */

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
      background-color: #711212;
    }
    .agenda-list-group {
      max-height: 250px;
      overflow-y: auto;
    }
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
    .notification-bell-icon {
      position: relative;
    }
    .notification-dot {
      width: 12px;
      height: 12px;
      background-color: #dc3545;
      top: 8px;
      right: 0px;
      border: 2px solid white;
    }
    .notification-dropdown-menu {
      width: 350px;
      border-radius: 0.5rem;
      border: 1px solid #dee2e6;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
      padding: 0;
      margin-top: 0.5rem !important;
    }
    .notification-header {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .notification-header h6 {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 0;
    }
    .notification-header .btn-mark-read {
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      color: #711212;
      background: none;
      border: none;
      text-decoration: none;
    }
    .notification-header .btn-mark-read:hover {
      text-decoration: underline;
    }
    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .notification-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      text-decoration: none;
      white-space: normal;
      border-bottom: 1px solid #f0f0f0;
    }
    .notification-item:last-child {
      border-bottom: none;
    }
    .notification-item:hover {
      background-color: #f8f9fa;
    }
    .notification-item-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 1.1rem;
    }
    .notification-item-content {
      flex-grow: 1;
      font-size: 0.95rem;
      color: #333;
    }
    .notification-item-content strong {
      color: #711212;
    }
    .notification-empty-state {
      padding: 2rem 1rem;
      text-align: center;
      color: #6c757d;
    }
    .notification-footer {
      text-align: center;
      padding: 0.75rem;
      border-top: 1px solid #f0f0f0;
      font-size: 0.9rem;
    }
    .notification-footer a {
      text-decoration: none;
      font-weight: 500;
      color: #711212;
    }
    .notification-footer a:hover {
      text-decoration: underline;
    }
  `}</style>
);


export default function Home() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, sendData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null); // Stores YouTube ID

  const [unreadChats, setUnreadChats] = useState([]); 
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // YouTube IDs
  const VIDEO_IDS = {
    CCS: "Jxba2CBFgcM",
    HM: "vk9LAbgO0YI", // CBA uses HM video
    CMS: "JMz-aUETbc8"
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = (e) => {
    e.preventDefault(); 
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Helper function to get events for a specific date
  const getEventsForDate = (date, eventSource) => {
    const cleanSelectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    return eventSource.filter((event) => {
      const startDate = event.startDate;
      const endDate = event.endDate; 

      if (!endDate || startDate.getTime() === endDate.getTime()) {
        return startDate.getTime() === cleanSelectedDate.getTime();
      }

      return cleanSelectedDate >= startDate && cleanSelectedDate <= endDate;
    });
  };

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://dungaw.ua:4435/events");
        const allEvents = Array.isArray(res.data[0]) ? res.data[0] : res.data;
        const approvedEvents = allEvents.filter(event => event.EventStatus === "Approved");

        const formatted = approvedEvents.map((event) => {
          const parseDate = (dateString) => {
            if (!dateString) return null;
            const date = new Date(dateString);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
          };

          return {
            ...event,
            startDate: parseDate(event.EventStartDate),
            endDate: parseDate(event.EventEndDate),
          }
        }).filter(event => event.startDate);

        sendData(formatted);
        setSelectedEvents(getEventsForDate(new Date(), formatted));
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []);


  // This useEffect now fetches the list of unread chats
  useEffect(() => {
    if (user && user.role !== 'guest') {
      
      const checkNotifications = async () => {
        try {
          const res = await axios.get(`http://dungaw.ua:4435/chats/notifications/${user.email}`);
          setUnreadChats(res.data.unreadChats || []);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };

      checkNotifications();
      const intervalId = setInterval(checkNotifications, 30000);
      return () => clearInterval(intervalId);
    }
  }, [user]);


  const handleNotificationClick = (eventId) => {
    setUnreadChats(prevChats => 
      prevChats.filter(chat => chat.eventId !== eventId)
    );
    sessionStorage.setItem('openChatOnLoad', eventId);
    navigate('/chats');
  };


  const handleViewAllChats = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('openChatOnLoad');
    navigate('/chats');
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadChats.length === 0) return;
    try {
      await axios.put("http://dungaw.ua:4435/chats/mark-all-read", {
        email: user.email
      });
      setUnreadChats([]); 
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    setSelectedEvents(getEventsForDate(value, data));
  };

  // Video modal handlers (Updated for YouTube)
  const handlePlayVideo = (videoId) => {
    setSelectedVideoId(videoId);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setSelectedVideoId(null);
    setShowVideoModal(false);
  };

  const deptColors = {
    UA: "#f21010ff",
    CBA: "#6bc6ffff",
    CCIS: "#0d6efd",
    CTE: "#a735dcff",
    CCJE: "#d7ff24ff",
    CAS: "#18bb0cff",
    CEA: "#c9a420ff",
    CIT: "#fd7e14",
    CMS: "#9E9E9E"
  };

  return (
    <>
      <HomeStyles />

      {/* ===== NAVBAR ===== */}
      <div className='container-fluid p-0'>
        <nav
          className="navbar navbar-dark fixed-top d-flex justify-content-between align-items-center px-3"
          style={{ zIndex: 1050, height: '7rem', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: '#711212ff' }}
        >
          <div className="d-flex align-items-center">
            <img src={UALOGO} className="ua-logo me-2" alt="UA logo" style={{ width: "50px" }} />
            <div className="text-white">
              <div className="fw-bold ua-text">University of Antique</div>
              <div className="smc-text" style={{ fontSize: '0.85rem' }}>Sibalom Main Campus</div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            {user && user.role !== 'guest' && (
              <div className="dropdown me-2">
                <a 
                  className="nav-link text-white notification-bell-icon" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  title="Notifications"
                >
                  <i className="bi bi-bell-fill fs-4"></i>
                  {unreadChats.length > 0 && (
                      <span className="position-absolute border rounded-circle notification-dot">
                          <span className="visually-hidden">New messages</span>
                      </span>
                  )}
                </a>

                <ul className="dropdown-menu dropdown-menu-end notification-dropdown-menu fade">
                  <li>
                    <div className="notification-header">
                      <h6>Notifications</h6>
                      {unreadChats.length > 0 && (
                        <button 
                          className="btn-mark-read"
                          onClick={handleMarkAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </li>
                  
                  <li>
                    <div className="notification-list">
                      {unreadChats.length > 0 ? (
                        unreadChats.map((chat) => (
                          <a 
                            key={chat.eventId}
                            className="dropdown-item notification-item" 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNotificationClick(chat.eventId);
                            }}
                          >
                            <div className="notification-item-icon bg-danger-subtle text-danger">
                              <i className="bi bi-chat-dots-fill"></i>
                            </div>
                            <div className="notification-item-content">
                              New message in 
                              <strong className="d-block">{chat.eventName}</strong>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="notification-empty-state">
                          <i className="bi bi-check2-circle fs-3 d-block mx-auto mb-2"></i>
                          You're all caught up!
                        </div>
                      )}
                    </div>
                  </li>

                  <li>
                    <div className="notification-footer">
                      <a href="/chats" onClick={handleViewAllChats}>
                        View all chats
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            )}

            <button
              className="btn btn-outline-light d-lg-none"
              onClick={toggleSidebar}
            >
              ☰
            </button>
          </div>
        </nav>

        {/* ===== SIDEBAR ===== */}
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
                }}
              >
                <i className="bi bi-house-door-fill"></i> Home
              </a>
            </li>

            {user?.role !== 'guest' && (
              <>
                <li className="nav-item mb-2">
                  <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg" href="/calendar">
                    <i className="bi bi-calendar-event-fill"></i> Calendar
                  </a>
                </li>
                <li className="nav-item mb-2">
                  <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg" href="/events">
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
                  <a
                    className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg text-center"
                    href="/login"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Log out
                  </a>
                </li>
              </>
            )}
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

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div
        className={`page-container ${isLargeScreen ? 'page-container-large' : ''}`}
      >
        <div className="container-fluid px-lg-4">
          <div className="row g-4">

            {/* --- Main Content Column (Left) --- */}
            <div className="col-lg-8">
              {/* Carousel */}
              <div id="carouselExampleAutoplaying" className="carousel slide shadow-sm mb-4" data-bs-ride="carousel">
                <div className="carousel-inner rounded-4">
                  <div className="carousel-item active">
                    <img src={BG2} className="d-block w-100" alt="..." />
                  </div>
                  <div className="carousel-item">
                    <img src={BG2} className="d-block w-100" alt="..." />
                  </div>
                  <div className="carousel-item">
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

                {/* Card 1: CCIS (YouTube) */}
                <div className="col">
                  <div className="card course-card">
                    <iframe
                      className="youtube-background"
                      src={`https://www.youtube.com/embed/${VIDEO_IDS.CCS}?autoplay=1&mute=1&controls=0&loop=1&playlist=${VIDEO_IDS.CCS}&start=10&playsinline=1&iv_load_policy=3&modestbranding=1&rel=0`}
                      title="CCIS Video"
                      allow="autoplay; encrypted-media; loop"
                      allowFullScreen
                    ></iframe>
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
                          onClick={() => handlePlayVideo(VIDEO_IDS.CCS)}
                        >
                          <i className="bi bi-play-fill"></i> Play Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: CBA (YouTube) */}
                <div className="col">
                  <div className="card course-card">
                    <iframe
                      className="youtube-background"
                      src={`https://www.youtube.com/embed/${VIDEO_IDS.HM}?autoplay=1&mute=1&controls=0&loop=1&playlist=${VIDEO_IDS.HM}&start=0&playsinline=1&iv_load_policy=3&modestbranding=1&rel=0`}
                      title="CBA Video"
                      allow="autoplay; encrypted-media; loop"
                      allowFullScreen
                    ></iframe>
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
                          onClick={() => handlePlayVideo(VIDEO_IDS.HM)}
                        >
                          <i className="bi bi-play-fill"></i> Play Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: CMS (YouTube) */}
                <div className="col">
                  <div className="card course-card">
                    <iframe
                      className="youtube-background"
                      src={`https://www.youtube.com/embed/${VIDEO_IDS.CMS}?autoplay=1&mute=1&controls=0&loop=1&playlist=${VIDEO_IDS.CMS}&start=0&playsinline=1&iv_load_policy=3&modestbranding=1&rel=0`}
                      title="CMS Video"
                      allow="autoplay; encrypted-media; loop"
                      allowFullScreen
                    ></iframe>
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
                          onClick={() => handlePlayVideo(VIDEO_IDS.CMS)}
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

      {/* ===== FOOTER ===== */}
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
                <img src={UALOGO} alt="UA Logo" style={{ width: "40px" }} className="me-2" />
                <h5 className="fw-bold mb-0">University of Antique</h5>
              </div>
              <p className="small" style={{ color: "#f0f0f0" }}>
                Sibalom Main Campus, Sibalom, Antique
              </p>
              <p className="small" style={{ color: "#f0f0f0" }}>
                © 2025 University of Antique. All Rights Reserved.
              </p>
            </div>
            <div className="col-md-3 col-6">
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="/home">Home</a></li>
                <li className="mb-2"><a href="/calendar">Calendar</a></li>
                <li className="mb-2"><a href="/events">Events</a></li>
                <li className="mb-2"><a href="/chats">Chats</a></li>
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


      {/* --- NEW VIDEO MODAL (YOUTUBE SUPPORT) --- */}
      {showVideoModal && selectedVideoId && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={handleCloseVideoModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-black">
              <div className="modal-body p-0 position-relative">
                  <button 
                    type="button" 
                    className="btn-close btn-close-white position-absolute top-0 end-0 m-3" 
                    style={{ zIndex: 10 }}
                    onClick={handleCloseVideoModal}
                  ></button>
                  
                  {/* The Actual Player */}
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&modestbranding=1&rel=0`}
                      title="YouTube video player"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}