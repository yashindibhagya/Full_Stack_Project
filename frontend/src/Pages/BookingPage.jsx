import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

const BookingPage = () => {
  const location = useLocation();
  const history = useHistory();

  // Destructure the passed state or use default fallback values
  const { roomName, price, guests } = location.state || {
    roomName: "Unknown Room",
    price: 0,
    guests: 1,
  };

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [userData, setUserData] = useState(null);

  // Retrieve logged-in user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData)); 
    }
  }, []);

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    if (!userData) {
      alert("User data not found. Please log in again.");
      return;
    }

    // Navigate to the payment page and pass booking details along with user data
    history.push({
      pathname: "/payment",
      state: {
        roomName,
        price,
        guests,
        checkIn,
        checkOut,
        userId: userData.userId, // Include the logged-in user's ID
        userName: userData.name, // Include the logged-in user's name
      },
    });
  };

  return (
    <div className="booking-container">
      <h1>Booking Page</h1>
      <form className="booking-form">
        <div className="room-details-container">
          <div className="room-detail">
            <label><strong>Room Name:</strong></label>
            <input
              type="text"
              value={roomName}
              readOnly
            />
          </div>
          <div className="room-detail">
            <label><strong>Price Per Night:</strong></label>
            <input
              type="text"
              value={`$${price}`}
              readOnly
            />
          </div>
          <div className="room-detail">
            <label><strong>Number of Guests:</strong></label>
            <input
              type="text"
              value={guests}
              readOnly
            />
          </div>
        </div>

        <div className="form-field">
          <label>Check-In Date:</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Check-Out Date:</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <button
          type="button"
          onClick={handleBooking}
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
