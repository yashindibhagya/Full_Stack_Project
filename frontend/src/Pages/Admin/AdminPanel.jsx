import React from "react";
import { Link } from "react-router-dom";

function AdminPanel() {
  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <ul className="admin-links">  
        <li className="admin-link">
          <Link to="/admin/requests">Booking Requests</Link>
        </li>
        <li className="admin-link">
          <Link to="/admin/rooms">Room Management</Link>
        </li>
        <li className="admin-link">
          <Link to="/admin/guests">Guest Management</Link>
        </li>
        <li className="admin-link">
          <Link to="/admin/viewmessages">View User Messages</Link>
        </li>
      </ul>
    </div>
  );
}

export default AdminPanel;
