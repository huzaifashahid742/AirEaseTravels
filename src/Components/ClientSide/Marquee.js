import React from 'react';
import "../../Css_Folder/Marquee.css";

const Marquee = () => {
  const message1 = "Welcome to AirEase Travels & Tours • Premium Travel Deals • Expert Student Consultation Facility • ";
  return (
    
    <div className="marquee-container">
      <div className="marquee-content">
        {/* Track 1 */}
        <div className="marquee-track">
          <span>{message1}</span>
          <span>{message1}</span>
          <span>{message1}</span>
          <span>{message1}</span>
        </div>
        {/* Track 2 (Chaser) */}
        <div className="marquee-track" aria-hidden="true">
          <span>{message1}</span>
          <span>{message1}</span>
          <span>{message1}</span>
          <span>{message1}</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;