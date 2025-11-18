import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../css/style.css";
import UALOGO from './assets/Ualogo.png';
import FBLOGO from './assets/fblogo.png';
import INSTALOGO from './assets/instalogo.png';
import STAT from './assets/stat.png';

// --- STYLES FOR CHAT BUBBLES ---
const ChatStyles = () => (
  <style>{`
    .chat-layout-container {
      display: flex;
      height: calc(100vh - 7rem); /* Full height minus navbar */
    }
    
    .chat-list-panel {
      flex: 0 0 350px; /* Fixed width for chat list */
      border-right: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-window-panel {
      flex: 1; /* Takes remaining width */
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-list-body {
      overflow-y: auto;
    }
    
    .chat-list-item {
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
    }
    .chat-list-item:hover {
      background-color: #f8f9fa;
    }
    .chat-list-item.active {
      background-color: #711212;
      color: white;
    }
    .chat-list-item.active .text-muted {
      color: #f0f0f0 !important;
    }

    .chat-avatar {
      width: 50px;
      height: 50px;
      object-fit: cover;
    }

    .chat-window-body {
      background-color: #f5f5f5; /* Light gray background for chat */
    }

    .chat-bubble {
      padding: 10px 15px;
      border-radius: 20px;
      max-width: 70%;
      word-wrap: break-word;
    }
    
    .chat-bubble.me {
      background-color: #711212; /* Theme color */
      color: white;
      border-bottom-right-radius: 5px;
    }
    
    .chat-bubble.other {
      background-color: #ffffff; /* White bubble */
      color: #333;
      border: 1px solid #e9e9e9;
      border-bottom-left-radius: 5px;
    }
    
    .chat-timestamp {
      font-size: 0.75rem;
      color: #6c757d;
      margin-top: 2px;
    }
  `}</style>
);


export default function Chats() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [activeChatEvent, setActiveChatEvent] = useState(null); // event object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserEmail = currentUser?.email;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch joined events
  useEffect(() => {
    if (currentUserEmail) {
      axios.get(`http://dungaw.ua:4435/my-chats/${currentUserEmail}`)
        .then(res => {
          const events = Array.isArray(res.data[0]) ? res.data[0] : res.data;
          setJoinedEvents(events);
        })
        .catch(err => console.error("Chat list error:", err));
    }
  }, [currentUserEmail]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Poll messages when a chat is active
  useEffect(() => {
    let poll;
    if (activeChatEvent) {
      fetchMessages(activeChatEvent.EventID); // Fetch immediately
      poll = setInterval(() => fetchMessages(activeChatEvent.EventID), 2000); // Then poll
    }
    return () => {
      if (poll) clearInterval(poll);
    };
  }, [activeChatEvent]);

  // 🔴 NEW: This useEffect checks for an eventId from session storage
  useEffect(() => {
    // Only run this if we are on a large screen AND the event list has loaded
    if (isLargeScreen && joinedEvents.length > 0) {
      const eventIdToOpen = sessionStorage.getItem('openChatOnLoad');
      
      if (eventIdToOpen) {
        // Find the event in our list
        const eventToOpen = joinedEvents.find(e => e.EventID === parseInt(eventIdToOpen));
        
        if (eventToOpen) {
          // If we found it, open it
          handleViewChat(eventToOpen);
          // CRITICAL: Remove the item so it doesn't re-open on refresh
          sessionStorage.removeItem('openChatOnLoad');
        } else {
          // Cleanup if the eventId was invalid or user is no longer in that chat
          sessionStorage.removeItem('openChatOnLoad');
        }
      }
    }
    // We depend on joinedEvents to make sure the list is ready to be searched
  }, [joinedEvents, isLargeScreen]); 

  const fetchMessages = async (eventId) => {
    try {
      const res = await axios.get(`http://dungaw.ua:4435/chatroom/${eventId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // 🔴 This function now marks chats as read
  const handleViewChat = (event) => {
    const markAsRead = () => {
      axios.put(`http://dungaw.ua:4435/chats/mark-read`, {
        email: currentUserEmail,
        eventId: event.EventID
      }).catch(err => console.error("Failed to mark as read", err));
    };

    if (isLargeScreen) {
      setActiveChatEvent(event);
      markAsRead(); // Mark as read for desktop view
    } else {
      markAsRead(); // Mark as read before navigating
      navigate(`/chatroom/${event.EventID}`);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatEvent) return;
    try {
      await axios.post(`http://dungaw.ua:4435/chatroom/${activeChatEvent.EventID}`, {
        user_email: currentUserEmail,
        message_content: newMessage.trim()
      });
      setNewMessage("");
      fetchMessages(activeChatEvent.EventID);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    }
  };

  const handleCloseActiveChat = () => {
    setActiveChatEvent(null);
    setMessages([]);
  };

  return (
    <>
      <ChatStyles />
      
      {/* Navbar */}
      <div className='container-fluid p-0'>
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

        {/* Sidebar */}
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
            <li className="nav-item mb-2">
              <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg" href="/home">
                <i className="bi bi-house-door-fill"></i> Home
              </a>
            </li>
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
              <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded" href="/chats"
                style={{ borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
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
              <a className="nav-link d-flex align-items-center gap-2 text-light px-3 py-2 rounded hover-bg text-center" 
                 href="/login" 
                 onClick={handleLogout}>
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

      {/* --- NEW CHAT LAYOUT --- */}
      <div 
        style={{
          marginLeft: isLargeScreen ? '250px' : '0',
          marginTop: '7rem',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        {isLargeScreen ? (
          <div className="chat-layout-container">
            {/* --- LEFT PANEL: CHAT LIST --- */}
            <div className="chat-list-panel bg-white">
              <div className="p-3 border-bottom">
                <h5 className="mb-0 fw-bold">My Chats</h5>
              </div>
              <div className="chat-list-body">
                {joinedEvents.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {joinedEvents.map((event, i) => (
                      <a 
                        key={i}
                        className={`list-group-item list-group-item-action chat-list-item ${activeChatEvent?.EventID === event.EventID ? 'active' : ''}`}
                        onClick={() => handleViewChat(event)}
                      >
                        <div className="d-flex align-items-center">
                          <img 
                            src={`http://dungaw.ua:4435/api/upload/${event.EventPhoto}`} 
                            className="rounded-circle me-3 chat-avatar" 
                            alt={event.EventName} 
                          />
                          <div className="flex-grow-1">
                            <div className="fw-bold text-truncate">{event.EventName}</div>
                            <small className="text-muted text-truncate">{event.EventVenue}</small>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted p-3">You haven't joined any events yet.</p>
                )}
              </div>
            </div>

            {/* --- RIGHT PANEL: CHAT WINDOW --- */}
            <div className="chat-window-panel">
              {activeChatEvent ? (
                <div className="card h-100 border-0 rounded-0">
                  {/* Chat Header */}
                  <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <img 
                        src={`http://dungaw.ua:4435/api/upload/${activeChatEvent.EventPhoto}`} 
                        className="rounded-circle me-3 chat-avatar" 
                        alt={activeChatEvent.EventName} 
                      />
                      <div>
                        <h5 className="fw-bold mb-0">{activeChatEvent.EventName}</h5>
                        <small className="text-muted">{activeChatEvent.EventVenue} • {new Date(activeChatEvent.EventDate).toDateString()}</small>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleCloseActiveChat}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                  
                  {/* Message Body */}
                  <div className="card-body chat-window-body overflow-auto p-3">
                    {messages.length === 0 ? (
                      <p className="text-muted text-center mt-4">No messages yet. Say hi 👋</p>
                    ) : (
                      messages.map((m, idx) => {
                        const isMe = m.user_email === currentUserEmail;
                        return (
                          <div 
                            key={idx} 
                            className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div style={{ maxWidth: '70%' }}>
                              <div className={`small text-muted ${isMe ? 'text-end' : ''}`}>
                                {m.user_email}
                              </div>
                              <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                                {m.message_content}
                              </div>
                              <div className={`chat-timestamp ${isMe ? 'text-end' : ''}`}>
                                {new Date(m.sent_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Chat Footer (Input) */}
                  <div className="card-footer bg-white p-3">
                    <div className="d-flex gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        className="form-control"
                        placeholder="Type a message..."
                      />
                      <button className="btn btn-danger" style={{backgroundColor: "#711212"}} onClick={handleSendMessage}>
                        <i className="bi bi-send-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // If no chat is selected (Placeholder)
                <div className="d-flex h-100 justify-content-center align-items-center bg-light">
                  <div className="text-center text-muted">
                    <i className="bi bi-chat-dots-fill" style={{ fontSize: '4rem' }}></i>
                    <h4 className="mt-2">Select a chat</h4>
                    <p>Choose one of your joined events to start a conversation.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // On mobile screens, show the list only
          <div className="container" style={{ paddingTop: '1rem' }}>
            <div className="row">
              <div className="col-12">
                <h4 className="fw-bold">My Chats</h4>
                {joinedEvents.length > 0 ? (
                  <div className="list-group">
                    {joinedEvents.map((event, i) => (
                      <a 
                        key={i}
                        className="list-group-item list-group-item-action d-flex align-items-center p-3"
                        onClick={() => handleViewChat(event)}
                      >
                        <img 
                          src={`http://dungaw.ua:4435/api/upload/${event.EventPhoto}`} 
                          className="rounded-circle me-3 chat-avatar" 
                          alt={event.EventName} 
                        />
                        <div className="flex-grow-1">
                          <div className="fw-bold text-truncate">{event.EventName}</div>
                          <small className="text-muted text-truncate">{event.EventVenue}</small>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted mt-5">You haven't joined any events yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}