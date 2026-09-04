import React from 'react';
import "../../Css_Folder/Home.css";
import { Link } from 'react-router-dom';

const Home = () => {
  const heroVideoUrl = process.env.REACT_APP_CLOUDINARY_HERO_VIDEO_URL || "https://res.cloudinary.com/rufmaegf/video/upload/v1788086540/Hero_Video.mp4";

  return (
    <div>
      {/* Hero Section */}
      <div className="Hero_Section">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src={heroVideoUrl} type="video/mp4" />
        </video>    
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Study at your Dream University.</h1>
          <p>Affordable, world-class UG & Graduate programs in English</p>
          <Link to="/Programs_List"><button>View Programs</button></Link>
        </div>
      </div>

      {/* Highlights Section */}
      <div>
        <section className="highlights" id="why-airease">
          <div className="container">
            <div className="card">
              <i className="fa-solid fa-wallet" />
              <h3>Low Tuition</h3>
              <p>Affordable programs that make studying Foreign accessible for international students.</p>
            </div>
            <div className="card">
              <i className="fa-brands fa-google-scholar" />
              <h3>Scholarships</h3>
              <p>Merit-based and need-based scholarships to help fund your studies.</p>
            </div>
            <div className="card">
              <i className="fa-solid fa-language" />
              <h3>English Programs</h3>
              <p>All UG and Masters programs are taught in English. No international language required!</p>
            </div>
            <div className="card">
              <i className="fa-solid fa-building-columns" />
              <h3>Admissions Open Now</h3>
              <p>Start your journey today. Don’t miss your chance to apply!</p>
            </div>
            <div className="card">
              <i className="fa-solid fa-headset" />
              <h3>Guided Consultation</h3>
              <p>Our experts guide you step by step: Select → Apply → Enroll.</p>
            </div>
            <div className="card">
              <i className="fa-solid fa-circle-info" />
              <h3>Student Support</h3>
              <p>We assist international students with applications, visa guidance, and housing.</p>
            </div>
          </div>
        </section>

        {/* Consultation Section */}
        <section className="consultation" id="how-it-works">
          <div className="container">
            <h2>How Our Consultation Works</h2>
            <div className="steps">
              <div className="step-card">
                <div className="step-icon">
                  <i className="fa-solid fa-graduation-cap" />
                  <div className="step-number">1</div>
                </div>
                <h3>Select Program</h3>
                <p>Choose the UG or Masters program that aligns with your career goals and interests.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <i className="fa-solid fa-handshake-angle" />
                  <div className="step-number">2</div>
                </div>
                <h3>Apply with Guidance</h3>
                <p>Our experts help you complete the application, prepare documents, and submit everything correctly.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <i className="fa-solid fa-plane-departure" />
                  <div className="step-number">3</div>
                </div>
                <h3>Enroll & Arrive</h3>
                <p>Receive your acceptance, get visa support, and start your exciting journey.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;