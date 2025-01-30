import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51Qcl5rGzX1rLyJV9xGICiEA6L1f3By3RCZmRexWG3SzkPNlhimZtshCfkBCk3eO7DPf3RPBazRwK5z0FMi2z2obd00nxN3anvo");

const PaymentVerificationPage = () => {
  const location = useLocation();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Get booking details from location state
  const { roomName, finalPrice, guests, checkIn, checkOut, userName, userId } = location.state || {};

  if (!roomName || !finalPrice || !checkIn || !checkOut) {
    return (
      <h3 style={{ color: "red", textAlign: "center" }}>
        Error: Missing payment details. Please go back and complete the booking.
      </h3>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Request payment intent from backend
      const response = await fetch("http://localhost:5000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice * 100 }), // Convert price to cents
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent. Please try again.");
      }

      const { clientSecret } = await response.json();

      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: userName, // Use the logged-in user's name
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === "succeeded") {
        // Payment succeeded
        setPaymentSuccess(true);

        // Booking details
        const bookingDetails = {
          guestName: userName,
          userId: userId,
          bookingId: result.paymentIntent.id, // Payment Intent ID as Booking ID
          roomName,
          price: finalPrice,
          guests,
          checkIn,
          checkOut,
          status: 1, 
        };

        // Save booking to database
        const bookingResponse = await sendBookingToDatabase(bookingDetails);
        if (bookingResponse.success) {
          alert("Payment Successful! Booking Confirmed!");
          history.push("/rooms");
        } else {
          alert("Booking failed to save. Please try again.");
        }
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err.message);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-verification-container" align='center'>
    
      <h1>Payment Verification</h1>
      {!paymentSuccess ? (
        <form
          onSubmit={handlePayment}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div className="form-field">
            <label><strong>Guest Name:</strong></label>
            <p>{userName}</p>
          </div>
          <div className="form-field">
            <label><strong>Room Name:</strong></label>
            <p>{roomName}</p>
          </div>
          <div className="form-field">
            <label><strong>Final Price:</strong></label>
            <p>${finalPrice}</p>
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

          <label><strong>Card Details:</strong></label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!stripe || !elements || loading}
          >
            {loading ? "Processing..." : "Confirm and Pay"}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "green" }}>Payment and Booking Confirmed!</h2>
          <p><strong>Guest Name:</strong> {userName}</p>
          <p><strong>Booking ID:</strong> {userId}</p>
          <p><strong>Room Name:</strong> {roomName}</p>
          <p><strong>Guests:</strong> {guests}</p>
          <p><strong>Final Price:</strong> ${finalPrice}</p>
          <p><strong>Check-In:</strong> {checkIn}</p>
          <p><strong>Check-Out:</strong> {checkOut}</p>
          
        </div>
      )}
    </div>
  );
};

const sendBookingToDatabase = async (bookingDetails) => {
  try {
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingDetails),
    });

    if (!response.ok) {
      throw new Error("Failed to save booking to database.");
    }

    const data = await response.json();
    console.log("Booking saved to database:", data.message);
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error saving booking:", error);
    return { success: false, message: error.message };
  }
};

// Wrap the component with Stripe Elements
const WrappedPaymentVerificationPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentVerificationPage />
    </Elements>
  );
};

export default WrappedPaymentVerificationPage;
