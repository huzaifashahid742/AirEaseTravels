import React from 'react';
import "../../Css_Folder/Marquee.css";

const Marquee = () => {
  const message = "Welcome to AirEase Travels & Tours • Premium Travel Deals • Expert Student Consultation Facility • ";
  const message1 = "---- Right now this webiste is in testing phase ----• ";
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