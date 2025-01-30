import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Banner from "../Components/Banner/Banner";  
import Hero from "../Components/Hero/Hero";        

function Profile() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorMessages, setErrorMessages] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ name: "", email: "" });
  const [updateError, setUpdateError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const getUserFromLocalStorage = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("userData");

      if (!token || !storedUser) {
        history.push("/login");
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        setUpdatedUser({ name: user.name, email: user.email });
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        history.push("/login");
      }
    };

    getUserFromLocalStorage();
  }, [history]);

  useEffect(() => {
    if (user) {
      const fetchMessages = async () => {
        try {
          const response = await fetch("http://localhost:5000/messages", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          const data = await response.json();

          if (response.ok) {
            setMessages(data.messages);
            setLoadingMessages(false);
          } else {
            setErrorMessages(data.message);
            setLoadingMessages(false);
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
          setErrorMessages("An error occurred while fetching messages.");
          setLoadingMessages(false);
        }
      };

      fetchMessages();
    }
  }, [user]);

  const handleEditToggle = () => setEditing(!editing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setEditing(false);
        setUpdateError(null);
      } else {
        setUpdateError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError("An error occurred while updating the profile.");
    }
  };

  return (
    <>
      <Hero>
        <Banner title="User Profile" subtitle="View and update your profile information">
          <Link to="/" className="btn-primary">
            return home
        </Link>
        </Banner>
      </Hero>
      <section className="profile-section">
        <div className="container">
          <h2>User Information</h2>
          {editing ? (
            <div className="profile-edit">
              <div>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={updatedUser.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={updatedUser.email}
                  onChange={handleInputChange}
                />
              </div>
              <button onClick={handleUpdateSubmit} className="btn-primary">
                Save Changes
              </button>
              <button onClick={handleEditToggle} className="btn-secondary">
                Cancel
              </button>
              {updateError && <p className="error-message">{updateError}</p>}
            </div>
          ) : (
            <>
              {user ? (
                <div className="profile-details">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <button onClick={handleEditToggle} className="btn-primary">
                    Edit Information
                  </button>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </>
          )}

          <h3>Sent Messages</h3>
          {loadingMessages ? (
            <p>Loading messages...</p>
          ) : errorMessages ? (
            <p>{errorMessages}</p>
          ) : (
            <div className="message-list">
              {messages.length === 0 ? (
                <p>No sent messages.</p>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="message-item">
                    <p>
                      <strong>To:</strong> {message.email}
                    </p>
                    <p>
                      <strong>Message:</strong> {message.message}
                    </p>
                    <p>
                      <small>Sent on: {new Date(message.createdAt).toLocaleString()}</small>
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Profile;
