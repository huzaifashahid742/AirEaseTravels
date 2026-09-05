import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
// import '../../Css_Folder/AdminPrograms.css';
import '../../Css_Folder/Admin_Panel.css'
import { programsAPI, universitiesAPI, visaApplicationsAPI, studentsAPI } from '../../services/api';
import { applicationStatusClass, formatApplicationStatus } from '../../utils/applicationStatus';
import PageLoader from './PageLoader';
import { useAdminSearch } from '../../Context/AdminSearchContext';
import { useAuth } from '../../Context/AuthContext';
import { hasPermission, isSuperAdmin } from '../../utils/roles';

const Admin_Panel = () => {
  const { user } = useAuth();
  const { query } = useAdminSearch();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    students: 0,
    programs: 0,
    universities: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canViewApplications = hasPermission(user, 'applications');
  const canViewContent = hasPermission(user, 'universities');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        let apps = [];
        let studentsData = [];
        let programs = [];
        let universities = [];

        // Fetch concurrently using independent conditional promises to avoid index mismatch bugs
        const [appRes, studentRes, progRes, uniRes] = await Promise.all([
          canViewApplications ? visaApplicationsAPI.getAllAdmin().catch(() => []) : Promise.resolve([]),
          canViewApplications ? studentsAPI.getAll().catch(() => []) : Promise.resolve([]),
          canViewContent ? programsAPI.getAll({ limit: 100 }).catch(() => []) : Promise.resolve([]),
          canViewContent ? universitiesAPI.getAll({ limit: 100 }).catch(() => []) : Promise.resolve([]),
        ]);

        // Parse Apps safely
        apps = Array.isArray(appRes) ? appRes : (appRes?.applications || appRes?.data || []);
        
        // Parse Students safely
        studentsData = Array.isArray(studentRes) ? studentRes : (studentRes?.students || studentRes?.data || []);
        
        // Parse Programs safely & filter verified ones
        const rawPrograms = Array.isArray(progRes) ? progRes : (progRes?.programs || progRes?.data || []);
        programs = rawPrograms.filter(prog => prog && (prog.universityId || prog.university));

        // Parse Universities safely & filter verified ones
        const rawUniversities = Array.isArray(uniRes) ? uniRes : (uniRes?.universities || uniRes?.data || []);
        universities = rawUniversities.filter(uni => uni && (uni._id || uni.name));

        setApplications(apps);
        setStats({
          students: studentsData.length,
          programs: programs.length,
          universities: universities.length,
          completed: apps.filter((a) => a?.applicationStatus === 'Approved').length,
        });

      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [canViewApplications, canViewContent]);

  const filteredApplications = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) => {
      const name = (app.personalInfo?.fullName || '').toLowerCase();
      const email = (app.personalInfo?.emailAddress || '').toLowerCase();
      const phone = (app.personalInfo?.contactNumber || app.phone || '').toLowerCase();
      const country = (
        app.personalInfo?.countryOfResidence ||
        app.programInterest?.fieldOfStudy ||
        ''
      ).toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || country.includes(q);
    });
  }, [applications, query]);

  const handleDeleteStudent = async (appId, name) => {
    if (!window.confirm(`Delete application for "${name}"?`)) return;
    try {
      await visaApplicationsAPI.delete(appId);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      setStats((s) => ({ ...s, students: s.students - 1 }));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) return <PageLoader label="Loading dashboard..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="admin-programs-page">
      <div className="admin-page-hero">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of students, programs, and partner universities.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {canViewContent && (
            <Link to="/admin/UniversityAdmin" className="btn admin-btn-primary">
              <i className="fa-solid fa-building-columns me-2" />
              Manage Universities
            </Link>
          )}
          {canViewApplications && (
            <Link to="/admin/StudentAdmin" className="btn admin-btn-primary">
              <i className="fa-solid fa-user-graduate me-2" />
              Registered students
            </Link>
          )}
          {hasPermission(user, 'manageTeam') && (
            <Link to="/admin/team" className="btn admin-btn-primary">
              <i className="fa-solid fa-users-gear me-2" />
              Team & roles
            </Link>
          )}
        </div>
      </div>

      <div className="admin-stat-grid">
        {canViewApplications && (
          <>
            <div className="admin-stat-card">
              <h3>Total Students</h3>
              <p>{stats.students}</p>
            </div>
          </>
        )}
        {canViewContent && (
          <>
            <div className="admin-stat-card">
              <h3>Registered Programs</h3>
              <p>{stats.programs}</p>
            </div>
            <div className="admin-stat-card">
              <h3>Partner Universities</h3>
              <p>{stats.universities}</p>
            </div>
          </>
        )}
      </div>

      {canViewApplications && (
      <div className="admin-card-panel">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h2 className="h5 mb-0" style={{ color: '#1f3a5f', fontWeight: 700 }}>
            Recent Student Applications
          </h2>
          <Link to="/admin/StudentAdmin" className="btn btn-sm admin-btn-outline">
            View registered students
          </Link>
        </div>
        <div className="admin-table-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Country</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  {query.trim() ? 'No students match your search.' : 'No student applications yet.'}
                </td>
              </tr>
            ) : (
              filteredApplications.slice(0, 10).map((app, index) => (
                <tr key={app._id}>
                  <td>{index + 1}</td>
                  <td className="cell-name">{app.personalInfo?.fullName || '—'}</td>
                  <td>{app.personalInfo?.contactNumber || app.phone || app.contactNumber || '—'}</td>
                  <td>{app.personalInfo?.emailAddress || app.email || '—'}</td>
                  <td>
                    {app.personalInfo?.countryOfResidence ||
                      app.countryOfResidence ||
                      app.programInterest?.fieldOfStudy ||
                      '—'}
                  </td>
                  <td className="text-end">
                    <Link to={`/admin/Student_View_Form/${app._id}`}>
                      <button type="button" className="btn btn-sm admin-btn-primary me-2">
                        View Application
                      </button>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm admin-btn-danger-outline"
                      onClick={() =>
                        handleDeleteStudent(app._id, app.personalInfo?.fullName || 'student')
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {!canViewApplications && !canViewContent && (
        <div className="admin-card-panel text-muted">
          Your role has limited dashboard access. Use the navigation above for permitted areas.
        </div>
      )}
    </div>
  );
};

export default Admin_Panel;