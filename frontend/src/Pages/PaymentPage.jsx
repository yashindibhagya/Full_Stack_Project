import React from "react";
import { useLocation, useHistory } from "react-router-dom";

const PaymentPage = () => {
  const location = useLocation();
  const history = useHistory();
  const { userId, userName, roomName, price, guests, checkIn, checkOut } = location.state || {};

  if (!userId || !userName) {
    return <h3>Error: User details are missing. Please log in again.</h3>;
  }

  // Calculate the number of days between check-in and check-out
  const calculateDays = (checkInDate, checkOutDate) => {
    const checkInTime = new Date(checkInDate).getTime();
    const checkOutTime = new Date(checkOutDate).getTime();
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((checkOutTime - checkInTime) / millisecondsPerDay)); // Minimum of 1 day
  };

  const daysOfStay = calculateDays(checkIn, checkOut);
  const finalPrice = price * daysOfStay;

  const handleProceedToPayment = () => {
    history.push("/payment-verification", {
      userId,
      userName,
      roomName,
      finalPrice,
      guests,
      checkIn,
      checkOut,
    });
  };

  return (
    <div className="payment-container" align='center'>
      <h1>Payment Page</h1>
      <form className="payment-form">
        <div className="form-field">
          <label><strong>User Name:</strong></label>
          <p>{userName}</p>
        </div>
        
        <div className="form-field">
          <label><strong>Room Name:</strong></label>
          <p>{roomName}</p>
        </div>
        
        <div className="form-field">
          <label><strong>Price Per Night:</strong></label>
          <p>${price}</p>
        </div>
        
        <div className="form-field">
          <label><strong>Number of Guests:</strong></label>
          <p>{guests}</p>
        </div>
        
        <div className="form-field">
          <label><strong>Check-In Date:</strong></label>
          <p>{checkIn}</p>
        </div>
        
        <div className="form-field">
          <label><strong>Check-Out Date:</strong></label>
          <p>{checkOut}</p>
        </div>
        
        <div className="form-field">
          <label><strong>Total Nights:</strong></label>
          <p>{daysOfStay} night(s)</p>
        </div>
        
        <div className="form-field">
          <label><strong>Final Price:</strong></label>
          <p>${finalPrice.toFixed(2)}</p>
        </div>
        
        <button
          type="button"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment Gateway
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;
