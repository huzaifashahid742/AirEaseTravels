import React from 'react';
import "../../Css_Folder/Marquee.css";

const Marquee = () => {
  const message = "Welcome to AirEase Travels & Tours • Premium Travel Deals • Expert Student Consultation Facility • ";
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {/* Track 1 */}
        <div className="marquee-track">
          <span>{message}</span>
          <span>{message}</span>
          <span>{message}</span>
          <span>{message}</span>
        </div>
        {/* Track 2 (Chaser) */}
        <div className="marquee-track" aria-hidden="true">
          <span>{message}</span>
          <span>{message}</span>
          <span>{message}</span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;