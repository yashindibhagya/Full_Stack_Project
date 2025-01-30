import React, { useEffect, useState } from "react";

const BookingRequestPage = () => {
  const [bookings, setBookings] = useState([]);
  const [editBooking, setEditBooking] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [updatedBooking, setUpdatedBooking] = useState({
    checkIn: '',
    checkOut: '',
    price: '',
    roomName: '',
  });

  // Fetch the bookings from the server
  useEffect(() => {
    const fetchBookings = async () => {
      const response = await fetch('http://localhost:5000/api/bookings');
      const data = await response.json();
      setBookings(data);
    };

    fetchBookings();
  }, []);

  // Handle edit button click
  const handleEditClick = (booking) => {
    setIsEditing(true);
    setEditBooking(booking);
    setUpdatedBooking({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      price: booking.price,
      roomName: booking.roomName,
    });
  };

  // Handle form field changes for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBooking((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle submit to update the booking details
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:5000/api/bookings/${editBooking.bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBooking),
    });

    if (response.ok) {
      const updatedData = await response.json();
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === updatedData.booking.bookingId
            ? { ...booking, ...updatedData.booking }
            : booking
        )
      );
      setIsEditing(false);
      setEditBooking(null);
    } else {
      alert('Failed to update booking details.');
    }
  };

  // Handle delete booking request
  const handleDelete = async (bookingId) => {
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setBookings(bookings.filter((booking) => booking.bookingId !== bookingId));
    } else {
      alert('Failed to delete booking.');
    }
  };

  return (
    <div className="booking-request" align="center">
      <h3>Booking Requests</h3>
      <div className="content-wrapper" align="center">
        {isEditing && editBooking ? (
          <div className="booking-request-form">
            <h3>Edit Booking</h3>
            <form onSubmit={handleUpdateSubmit}>
              <label>
                Check-In Date:
                <input
                  type="date"
                  name="checkIn"
                  value={updatedBooking.checkIn}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Check-Out Date:
                <input
                  type="date"
                  name="checkOut"
                  value={updatedBooking.checkOut}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Price:
                <input
                  type="number"
                  name="price"
                  value={updatedBooking.price}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Room Name:
                <input
                  type="text"
                  name="roomName"
                  value={updatedBooking.roomName}
                  onChange={handleInputChange}
                />
              </label>
              <button className="edit-button" type="submit">Update Booking</button>
              <button className="delete-button" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </form>
          </div>
        ) : (
          <div className="room-table-container">
            <table className="room-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Room Name</th>
                  <th>Price</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td>{booking.guestName}</td>
                    <td>{booking.roomName}</td>
                    <td>${booking.price}</td>
                    <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditClick(booking)}> Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(booking.bookingId)}> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRequestPage;
