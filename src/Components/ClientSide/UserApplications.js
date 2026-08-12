import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { visaApplicationsAPI } from '../../services/api';
import {
  getApplicationContinueUrl,
  getApplicationViewUrl,
} from '../../utils/applicationForm';
import { formatApplicationStatus } from '../../utils/applicationStatus';
import PageLoader from './PageLoader';
import '../../Css_Folder/UserDashboard.css';

const UserApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    visaApplicationsAPI
      .getMine()
      .then((res) => setApplications(res.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading applications..." />;

  const drafts = applications.filter((a) => a.isDraft);
  const submitted = applications.filter((a) => !a.isDraft);

  return (
    <div>
      <h1 style={{ color: '#1F3A5F', fontWeight: 700, margin: 0 }}>My Applications</h1>
      <p className="text-muted mb-0">Drafts and submitted applications.</p>

      <div className="sd-stats-grid mt-3">
        <div className="sd-stat-card">
          <h3>Total</h3>
          <p>{applications.length}</p>
        </div>
        <div className="sd-stat-card">
          <h3>Drafts</h3>
          <p>{drafts.length}</p>
        </div>
        <div className="sd-stat-card">
          <h3>Submitted</h3>
          <p>{submitted.length}</p>
        </div>
      </div>

      <div className="sd-main-panel mt-3">
        {applications.length === 0 ? (
          <p className="text-muted">
            No applications yet.{' '}
            <Link to="/Programs_List"><b style={{color : "black"}}><u>Browse programs</u></b></Link> and click Apply via us.
          </p>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="sd-app-row">
              <div>
                <h3>{app.programName || 'Application'}</h3>
                <p>
                  {app.universityName || 'University TBD'} ·{' '}
                  {app.isDraft
                    ? `Draft · Step ${app.currentStep || 1} of 8`
                    : formatApplicationStatus(app.applicationStatus)}{' '}
                  · Updated {new Date(app.updatedAt).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default UserApplications;
