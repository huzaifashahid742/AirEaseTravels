import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { visaApplicationsAPI } from '../../services/api';
import {
  calculateProfileProgress,
  getApplicationContinueUrl,
  getApplicationViewUrl,
} from '../../utils/applicationForm';
import PageLoader from './PageLoader';
import '../../Css_Folder/UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await visaApplicationsAPI.getMine();
        setApplications(res.data || []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader label="Loading dashboard..." />;

  const drafts = applications.filter((a) => a.isDraft);
  const submitted = applications.filter((a) => !a.isDraft);
  const profilePct = calculateProfileProgress(user, applications);

  const checklist = [
    { label: 'Account & contact', done: Boolean(user?.email && user?.profile?.phone) },
    { label: 'Personal details', done: Boolean(user?.profile?.nationality && user?.profile?.dateOfBirth) },
    { label: 'Passport info', done: Boolean(user?.profile?.passportNumber) },
    { label: 'Application started', done: applications.length > 0 },
    { label: 'Application submitted', done: submitted.length > 0 },
  ];

  return (
    <div>
      {location.state?.submitted && (
        <div className="alert alert-success mb-3">
          Your application was submitted successfully. Our team will review it soon.
        </div>
      )}

      <div className="sd-welcome-row">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p>Track your profile and applications.</p>
        </div>
      </div>

      <div className="sd-stats-grid">
        <div className="sd-stat-card">
          <h3>Profile</h3>
          <p>{profilePct}%</p>
        </div>
        <div className="sd-stat-card">
          <h3>Applications</h3>
          <p>{applications.length}</p>
        </div>
        <div className="sd-stat-card">
          <h3>In progress</h3>
          <p>{drafts.length}</p>
        </div>
        <div className="sd-stat-card">
          <h3>Submitted</h3>
          <p>{submitted.length}</p>
        </div>
      </div>

      <div className="sd-layout">
        <aside className="sd-sidebar">
          <h2>Your checklist</h2>
          <ul className="list-unstyled sd-checklist mb-0">
            {checklist.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <span className={item.done ? 'sd-badge-done' : 'sd-badge-pending'}>
                  {item.done ? 'Done' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="sd-main-panel">
          <h2 className="h5 mb-3" style={{ color: '#1F3A5F', fontWeight: 700 }}>
            Recent applications
          </h2>

          {applications.length === 0 ? (
            <p className="text-muted mb-3">
              You have not started an application yet.{' '}
              <Link to="/Programs_List"><b style={{color : "Black"}}><u>Browse programs</u></b></Link> and click Apply via us.
            </p>
          ) : (
            applications.slice(0, 5).map((app) => (
              <div key={app._id} className="sd-app-row">
                <div>
                  <h3>{app.programName || 'Study abroad application'}</h3>
                  <p>
                    {app.universityName || 'University TBD'} ·{' '}
                    {app.isDraft ? `Draft · Step ${app.currentStep || 1}` : app.applicationStatus}
                  </p>
                </div>
                <div className="sd-app-actions">
                  {app.isDraft ? (
                    <Link to={getApplicationContinueUrl(app)} className="btn apply-btn-primary btn-sm">
                      Continue
                    </Link>
                  ) : (
                    <Link to={getApplicationViewUrl(app)} className="btn apply-btn-outline btn-sm">
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}

          {applications.length > 5 && (
            <div className="mt-3">
              <Link to="/user/applications">View all {applications.length} applications</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
