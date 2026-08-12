import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../Css_Folder/University_Admin.css';
import { universitiesAPI } from '../../services/api';
import { resolveStoredImage } from '../../utils/imageUpload';
import PageLoader from './PageLoader';
import { useAdminSearch } from '../../Context/AdminSearchContext';

const University_Admin = () => {
  const { query } = useAdminSearch();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 100 };
        if (query.trim()) params.search = query.trim();
        const res = await universitiesAPI.getAll(params);
        setUniversities(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load universities');
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, [query]);

  const handleDelete = async (uniId, name) => {
    if (!window.confirm(`Delete university "${name}" and all its programs? This cannot be undone.`)) return;
    try {
      await universitiesAPI.delete(uniId);
      setUniversities((prev) => prev.filter((u) => u._id !== uniId));
    } catch (err) {
      alert(err.message || 'Failed to delete university');
    }
  };

  if (loading) return <PageLoader label="Loading universities..." />;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="uni-admin-wrapper">
      <div className="admin-header-row">
        <h2 className="admin-title">University Directory</h2>
        <Link to="/admin/add-university" className="btn btn-primary btn-lg shadow-sm">
          <i className="fa fa-plus me-2"></i> Add New University
        </Link>
      </div>

      <div className="modern-table-card">
        <table className="modern-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Logo</th>
              <th>University Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Programs</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {universities.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">No universities found.</td>
              </tr>
            ) : (
              universities.map((uni, index) => (
                <tr key={uni._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={resolveStoredImage(uni.logo)}
                      alt=""
                      style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 4 }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: '#1F3A5F' }}>{uni.universityName}</td>
                  <td>{uni.city}, {uni.country}</td>
                  <td><span className="badge bg-light text-dark border">{uni.universityType}</span></td>
                  <td>{uni.programCount}</td>
                  <td className="text-center">
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap',
      flexWrap: 'nowrap',
    }}
  >
    <button
      className="btn btn-sm btn-outline-success btn-action"
      onClick={() => navigate(`/admin/university/${uni._id}/programs`)}
    >
      Programs
    </button>

    <Link
      to={`/admin/edit-university/${uni._id}`}
      className="btn btn-sm btn-outline-warning btn-action"
      style={{ whiteSpace: 'nowrap' }}
    >
      Edit
    </Link>

    <button
      className="btn btn-sm btn-outline-danger btn-action"
      onClick={() => handleDelete(uni._id, uni.universityName)}
    >
      Delete
    </button>
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default University_Admin;