import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Import all your pages ---
import UserLogin from '../UserLogin';
import Home from '../Home';
import Events from '../Events';
import Calendars from '../Calendar'; // Make sure this is the right file name
import Chats from '../Chat';
import AdminEvents from '../AdminEvents'; // Example admin page]
import Admin from '../AdminLogin'
import Accounts from '../Accounts'
import ManageEvents from '../AdminManageEvents'
import AdminReoprts from '../AdminEventReports'
import Scanner from '../Scanner';
import EventApproval from '../EventApproval';


// ✅ IMPORT THE NEW SECURITY FILE
import RestrictGuest from '../RestrictGuest';

// ✅ IMPORT YOUR EXISTING ADMIN SECURITY FILE
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Login Page */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/login" element={<UserLogin />} />

        {/* 2. Public Page (Guests AND Users can see this) */}
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/manageEvents" element={<ManageEvents />} />
        <Route path="/admin-reports" element={<AdminReoprts />} />
        <Route path="/eventApproval" element={<EventApproval />} />

        {/* 3. 🔒 GUEST RESTRICTED ROUTES 🔒 */}
        {/* Any route inside this wrapper is BLOCKED for guests */}
        <Route element={<RestrictGuest />}>
          <Route path="/events" element={<Events />} />
          <Route path="/calendar" element={<Calendars />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/event-scanner" element={<Scanner />} />
        </Route>

        {/* 4. 🛡️ ADMIN ROUTES 🛡️ */}
        {/* Use your existing ProtectedRoute for admin pages */}
        <Route
          path="/adminEvents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        {/* ... add all other admin routes here ... */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;