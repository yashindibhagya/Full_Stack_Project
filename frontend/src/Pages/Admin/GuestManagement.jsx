import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GuestManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/guestManagement')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the users!", error);
      });
  }, []);

  // Handle user status toggle (activate/deactivate)
  const toggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 2 : 1;
    
    axios.put(`http://localhost:5000/api/guestManagement/${userId}`, { status: newStatus })
      .then(response => {
        const updatedUser = response.data;
        setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
      })
      .catch(error => {
        console.error("Error updating status", error);
      });
  };

  // Handle editing user details
  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSave = () => {
    axios.put(`http://localhost:5000/api/guestManagement/${editingUser._id}`, editingUser)
      .then(response => {
        const updatedUser = response.data;
        setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
        setEditingUser(null);
      })
      .catch(error => {
        console.error("Error saving user details", error);
      });
  };

  return (
    <div className="guest-management-container">
      <h2>Guest Management</h2>
      <table className="guest-management-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                {editingUser && editingUser._id === user._id ? (
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUser && editingUser._id === user._id ? (
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                <span>{user.status === 1 ? 'Active' : 'Inactive'}</span>
              </td>
              <td>
                <button
                  onClick={() => toggleStatus(user._id, user.status)}
                  className={user.status === 1 ? 'active-btn' : 'inactive-btn'}
                >
                  {user.status === 1 ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleEdit(user)} className={user.status === 1 ? 'active-btn' : ''}> Edit </button>
                  {editingUser && editingUser._id === user._id && (
                    <button onClick={handleSave} className={user.status === 1 ? 'active-btn' : ''}> Save </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuestManagement;
