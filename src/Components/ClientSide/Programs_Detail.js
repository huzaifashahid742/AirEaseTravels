import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import "../../Css_Folder/Program_Detail.css";
import { programsAPI } from '../../services/api';
import PageLoader from './PageLoader';

const Programs_Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (!id) {
        setError('Program id is missing');
        setLoading(false);
        return;
      }

      try {
        const res = await programsAPI.getById(id);
        setProgram(res.data);      
      } catch (err) {
        console.error('Detail View Fetch Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramDetails();
  }, [id]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Rolling Admissions';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <PageLoader label="Loading immersive layout..." />;
  }

  if (error || !program) {
    return (
      <div className="elite-error-wrapper">
        <div className="elite-error-card">
          <div className="elite-error-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <h2>Program Not Found</h2>
          <p>{error || "The requested academic program is currently unavailable or has been archived."}</p>
          <Link to="/Programs_List" className="elite-back-link"><i className="fa-solid fa-arrow-left"></i> Return to Programs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="elite-page-wrapper">
      <div className="elite-container-75">
        {/* Hero Banner Component */}
        <div className="elite-hero-banner">
          <div className="elite-hero-glow"></div>
          <div className="elite-hero-content">
            <div className="elite-badges-row">
              <span className="elite-badge field">
                <i className="fa-solid fa-layer-group"></i> {program.field || "Academic Division"}
              </span>
              <span className={`elite-badge status-${(program.status || 'Active').toLowerCase()}`}>
                <span className="elite-dot"></span> {program.status || "Open"}
              </span>
            </div>

            <h1 className="elite-title">{program.programName}</h1>
          </div>
        </div>

        {/* Main Grid: Left Details & Right Sticky Box */}
        <div className="elite-main-grid">
          
          {/* Left Content Area */}
          <div className="elite-content-pane">
            

            {/* Overview Card */}
            <div className="elite-card-box">
              <h2><i className="fa-solid fa-book-open"></i> Program Overview</h2>
              <p className="elite-overview-text">
                {program.overview || `Explore this elite ${program.degree || "specialized"} curriculum centered around ${program.field || "modern industry innovations"}. Taught completely in ${program.language || "English"}, this structured track prepares international candidates for progressive professional pathways and high-impact global career placement.`}
              </p>
            </div>

            {/* Requirements Card */}
            <div className="elite-card-box">
              <h2><i className="fa-solid fa-clipboard-check"></i> Admission Requirements</h2>
              <div className="elite-req-stack">
                <div className="elite-req-row">
                  <div className="req-ico bg-blue"><i className="fa-solid fa-graduation-cap"></i></div>
                  <div>
                    <h4>Academic Qualification</h4>
                    <p>Certified completion of a valid {program.degree === "Master" ? "Bachelor's Degree" : "High School Diploma"} or standard academic equivalent framework.</p>
                  </div>
                </div>
                <div className="elite-req-row">
                  <div className="req-ico bg-purple"><i className="fa-solid fa-language"></i></div>
                  <div>
                    <h4>Language Proficiency</h4>
                    <p>Standardized English Certification (Minimum IELTS Requirement Score: <strong>{program.ieltsRequirement || "6.0 Equivalent"}</strong>).</p>
                  </div>
                </div>
                <div className="elite-req-row">
                  <div className="req-ico bg-green"><i className="fa-solid fa-file-lines"></i></div>
                  <div>
                    <h4>Required Documentation</h4>
                    <p>Official Academic Transcripts, updated Curriculum Vitae (CV), and a compelling Statement of Purpose.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Floating Sidebar */}
          <div className="elite-sidebar-pane">
            <div className="elite-action-box">
              <div className="elite-fee-block">
                <span className="fee-label">Tuition Investment</span>
                <div className="fee-amount">
                  €{program.tuitionFee?.toLocaleString() || "0"} <span className="fee-freq">/ year</span>
                </div>
              </div>

              <div className="elite-specs-list">
                <div className="spec-item">
                  <span><i className="fa-solid fa-calendar-xmark"></i> Deadline</span>
                  <strong>{formatDeadline(program.applicationDeadline)}</strong>
                </div>
                <div className="spec-item">
                  <span><i className="fa-solid fa-calendar-days"></i> Intake Season</span>
                  <strong>{program.intake || "General Season"}</strong>
                </div>
                <div className="spec-item">
                  <span><i className="fa-solid fa-globe"></i> Study Mode</span>
                  <strong>Full-Time On-Campus</strong>
                </div>
                <div className="spec-item">
                  <span><i className="fa-solid fa-globe"></i> Degree Level</span>
                  <strong>{program.degree || "Higher Edu"}</strong>
                </div>
                <div className="spec-item">
                  <span><i className="fa-solid fa-globe"></i> Duration</span>
                  <strong>{program.duration || "N/A"}</strong>
                </div>
                <div className="spec-item">
                  <span><i className="fa-solid fa-globe"></i> Language</span>
                  <strong>{program.language || "English"}</strong>
                </div>
              </div>
              <button
                type="button"
                className="elite-cta-button"
                onClick={() => {
                  if (!user) {
                    navigate('/Login_Page', { state: { from: `/Programs_Detail/${id}` } });
                    return;
                  }
                  navigate(`/user/apply/${id}`);
                }}
              >
                <span>Apply Instantly</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>

              <div className="elite-security-note">
                <i className="fa-solid fa-shield-halved"></i> Verified Direct Application Channel
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Programs_Detail;