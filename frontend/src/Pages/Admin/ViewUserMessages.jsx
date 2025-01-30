import React, { useEffect, useState } from "react";

function ViewMessages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [updatedMessage, setUpdatedMessage] = useState("");

  // Fetch messages from the server
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/messages", {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setMessages(data.messages);
        } else {
          setError(data.error || "Failed to fetch messages.");
        }
      } catch (err) {
        setError("Unable to fetch messages. Please try again later.");
      }
    };

    fetchMessages();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((message) => message._id !== id));
      } else {
        setError("Failed to delete the message.");
      }
    } catch (err) {
      setError("Unable to delete the message. Please try again later.");
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (message) => {
    setIsEditing(true);
    setEditingMessage(message);
    setUpdatedMessage(message.message);
  };

  // Handle Update Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${editingMessage._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: updatedMessage }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setMessages(
          messages.map((msg) =>
            msg._id === updated.message._id ? updated.message : msg
          )
        );
        setIsEditing(false);
        setEditingMessage(null);
        setUpdatedMessage("");
      } else {
        setError("Failed to update the message.");
      }
    } catch (err) {
      setError("Unable to update the message. Please try again later.");
    }
  };

  return (
    <div className="view-messages">
      <h2>User Messages</h2>
      {error && <p className="error">{error}</p>}
      <div className="messages-container">
        {isEditing ? (
          <div className="edit-message-form">
            <h3>Edit Message</h3>
            <form onSubmit={handleUpdateSubmit}>
              <textarea
                value={updatedMessage}
                onChange={(e) => setUpdatedMessage(e.target.value)}
                rows="5"
                cols="50"
              ></textarea>
              <button type="submit">Update</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div className="message-card" key={message._id}>
              <h3>{message.name}</h3>
              <p>
                <strong>Email:</strong> {message.email}
              </p>
              <p>
                <strong>Message:</strong> {message.message}
              </p>
              <p>
                <strong>Sent On:</strong>{" "}
                {new Date(message.createdAt).toLocaleString()}
              </p>
              <button onClick={() => handleEditClick(message)}>Edit</button>
              <button onClick={() => handleDelete(message._id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default ViewMessages;
