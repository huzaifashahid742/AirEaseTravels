import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Css_Folder/AdminPrograms.css';
import { studentsAPI, visaApplicationsAPI } from '../../services/api';
import PageLoader from './PageLoader';
import { useAdminSearch } from '../../Context/AdminSearchContext';

const Students_Admin = () => {
  const { query } = useAdminSearch();
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsList, appsList] = await Promise.all([
        studentsAPI.getAll(),
        visaApplicationsAPI.getAllAdmin()
      ]);
      
      // Defensively parse students payload
      if (Array.isArray(studentsList)) {
        setStudents(studentsList);
      } else if (studentsList && Array.isArray(studentsList.data)) {
        setStudents(studentsList.data);
      } else {
        setStudents([]);
      }

      // Defensively parse applications payload
      if (Array.isArray(appsList)) {
        setApplications(appsList);
      } else if (appsList && (appsList.applications || appsList.data)) {
        setApplications(appsList.applications || appsList.data || []);
      } else {
        setApplications([]);
      }

    } catch (err) {
      console.error("❌ Catch block caught an exception:", err.message);
      setError(err.message || 'Failed to load students dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const phone = (s.profile?.phone || '').toLowerCase();
      const country = (s.profile?.countryOfResidence || s.countryOfResidence || '').toLowerCase();
      
      return name.includes(q) || email.includes(q) || phone.includes(q) || country.includes(q);
    });
  }, [students, query]);

  const handleDeleteStudent = async (studentId, name) => {
    if (!window.confirm(`Delete student "${name}"? Their account and applications will be permanently removed.`)) {
      return;
    }
    try {
      await studentsAPI.delete(studentId);
      setStudents((prev) => prev.filter((s) => (s.id || s._id) !== studentId));
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    }
  };

  if (loading) return <PageLoader label="Loading students..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="admin-programs-page">
      <div className="admin-page-hero">
        <div>
          <h1>Registered Students</h1>
          <p>Manage student accounts who signed up on the website.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <h3>Total Registered Students</h3>
          <p>{students.length}</p>
        </div>
      </div>

      <div className="admin-card-panel">
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    {query.trim() ? 'No students match your search.' : 'No students registered yet.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const studentId = student.id || student._id;

                  // FIND MATCHING APPLICATION ID BY EMAIL OR USER ID
                  const matchingApp = applications.find(
                    (app) => 
                      (app.personalInfo?.emailAddress?.toLowerCase() === student.email?.toLowerCase()) ||
                      (app.userId === studentId || app.studentId === studentId)
                  );

                  const targetAppId = matchingApp ? matchingApp._id : studentId;

                  return (
                    <tr key={studentId || index}>
                      <td>{index + 1}</td>
                      <td className="cell-name">{student.name || '—'}</td>
                      <td>{student.profile?.phone || '—'}</td>
                      <td>{student.email || '—'}</td>
                      <td>{student.profile?.countryOfResidence || student.countryOfResidence || student.country || '—'}</td>
                      <td className="text-end">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                          <Link to={`/admin/Student_Profile/${studentId}`}>
                            <button type="button" className="btn btn-sm admin-btn-success">
                              View Profile
                            </button>
                          </Link>

                          <button
                            type="button"
                            className="btn btn-sm admin-btn-danger-outline"
                            onClick={() => handleDeleteStudent(studentId, student.name || 'student')}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students_Admin;