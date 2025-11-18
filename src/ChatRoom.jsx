import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chats from "./Chat";
import ChatRoom from "./ChatRoom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/chats" element={<Chats />} />
        <Route path="/chatroom/:eventId" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}
