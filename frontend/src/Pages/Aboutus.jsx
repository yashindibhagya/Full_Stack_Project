import React from "react";
import { Link } from "react-router-dom";
import Banner from "../Components/Banner/Banner";
import Hero from "../Components/Hero/Hero";

function AboutUs() {
  return (
    <>
      <Hero>
        <Banner
          title="about us"
          subtitle="Discover who we are and what we stand for"
        >
          <Link to="/contact" className="btn-primary">
            contact us
          </Link>
        </Banner>
      </Hero>
      <section className="about-section">
        <div className="container">
          <h2>Our Story</h2>
          <p>
            Welcome to our world of luxurious experiences. From humble
            beginnings, our mission has always been to create unforgettable
            stays for our guests. We are dedicated to offering unparalleled
            comfort, exquisite design, and top-notch hospitality.
          </p>
          <h2>Our Values</h2>
          <ul>
            <li>Commitment to Excellence</li>
            <li>Guest-Centric Service</li>
            <li>Innovation and Sustainability</li>
            <li>Community and Culture</li>
          </ul>
          <h2>Why Choose Us?</h2>
          <p>
            At the heart of what we do is our unwavering passion for hospitality.
            We believe in creating spaces where guests feel valued, relaxed, and
            inspired.
          </p>
        </div>
      </section>
    </>
  );
}

export default AboutUs;
