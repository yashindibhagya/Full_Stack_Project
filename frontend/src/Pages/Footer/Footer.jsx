import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <h2>Tranquil Resorts | Hotel Room Book</h2>
      <p>
        &copy; <span>{year}</span> TranquilResorts.com - All Rights
        Reserved
      </p>
      <p className="LL">Plymouth Batch 11 Group 8</p>
    </footer>
  );
}
