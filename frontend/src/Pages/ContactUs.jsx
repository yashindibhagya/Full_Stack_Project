import React, { useState } from "react";
import Hero from "../Components/Hero/Hero";
import Banner from "../Components/Banner/Banner";
import { Link } from "react-router-dom";

function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get userId from localStorage
  const getUserId = () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).userId : null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message || !email || !name) {
      setError("Please fill in all the fields.");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setError("User is not logged in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,  
          email,
          name,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setError(""); 
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "An error occurred while sending the message.");
      }
    } catch (err) {
      setError("Unable to send the message. Please try again later.");
    }
  };

  return (
    <>
      <Hero>
        <Banner title="Contact Us">
          <Link to="/" className="btn-primary">
            Return Home
          </Link>
        </Banner>
      </Hero>
      <section className="contact-us">
        <div className="section-title">
          <h4>Get in Touch</h4>
          <div></div>
        </div>
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                className="form-control"
                rows="5"
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">Your message has been sent successfully!</p>}
            <button type="submit" className="btn-primary">
              Send
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default ContactUs;
