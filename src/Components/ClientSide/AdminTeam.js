import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Css_Folder/AdminPrograms.css';
import { teamAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import {
  ROLE_LABELS,
  ROLES,
  STAFF_ROLES,
  canManageUser,
  roleBadgeClass,
} from '../../utils/roles';
import PageLoader from './PageLoader';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const AdminTeam = () => {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignableRoles, setAssignableRoles] = useState([]);
  const [inviteableRoles, setInviteableRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [permissionLabels, setPermissionLabels] = useState({});
  const [roleLabels, setRoleLabels] = useState(ROLE_LABELS);
  const [activeTab, setActiveTab] = useState('staff');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.ADMISSIONS,
  });
  const [submitting, setSubmitting] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  const loadTeam = async () => {
    setError('');
    try {
      const res = await teamAPI.list();
      setStaff(res.data?.staff || []);
      setStudents(res.data?.students || []);
      setAssignableRoles(res.assignableRoles || []);
      setInviteableRoles(res.inviteableRoles || []);
      setPermissions(res.permissions || {});
      setPermissionLabels(res.permissionLabels || {});
      setRoleLabels({ ...ROLE_LABELS, ...(res.roleLabels || {}) });
    } catch (err) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  useEffect(() => {
    if (inviteableRoles.length && !inviteableRoles.find((r) => r.value === invite.role)) {
      setInvite((prev) => ({ ...prev, role: inviteableRoles[0].value }));
    }
  }, [inviteableRoles, invite.role]);

  const filterList = (list) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.roleLabel || '').toLowerCase().includes(q)
    );
  };

  const filteredStaff = useMemo(() => filterList(staff), [staff, search]);
  const filteredStudents = useMemo(() => filterList(students), [students, search]);

  const permissionRows = useMemo(() => {
    return Object.keys(permissions).map((key) => ({
      key,
      label: permissionLabels[key] || key,
      roles: permissions[key] || [],
    }));
  }, [permissions, permissionLabels]);

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { userId, role, name } = pendingRoleChange;
    try {
      await teamAPI.updateRole(userId, role);
      setMessage(`Role updated for ${name}`);
      setPendingRoleChange(null);
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Could not update role');
      setPendingRoleChange(null);
    }
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    try {
      await teamAPI.remove(pendingRemove.id);
      setMessage(`${pendingRemove.name} no longer has staff access`);
      setPendingRemove(null);
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Could not remove staff member');
      setPendingRemove(null);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await teamAPI.invite({
        name: invite.name.trim(),
        email: invite.email.trim().toLowerCase(),
        password: invite.password,
        role: invite.role,
      });
      setMessage('Staff account created successfully');
      setInvite({ name: '', email: '', password: '', role: inviteableRoles[0]?.value || ROLES.ADMISSIONS });
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Invite failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canEditMember = (member) => {
    if (member.role === ROLES.SUPER_ADMIN) return false;
    if (String(member.id) === String(currentUser?.id)) return false;
    return canManageUser(currentUser?.role, member.role);
  };

  if (loading) return <PageLoader label="Loading team..." />;

  return (
    <div className="admin-programs-page team-page">
      <div className="admin-page-hero">
        <div>
          <h1>Team &amp; roles</h1>
          <p>
            Manage company staff, assign access levels, and control who can reach each admin area.
            Only administrators can access this page.
          </p>
        </div>
        <Link to="/admin/AdminPanel" className="btn admin-btn-outline">
          Back to dashboard
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="team-tabs mb-3">
        <button
          type="button"
          className={`team-tab${activeTab === 'staff' ? ' active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff ({staff.length})
        </button>
        <button
          type="button"
          className={`team-tab${activeTab === 'students' ? ' active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students ({students.length})
        </button>
        <button
          type="button"
          className={`team-tab${activeTab === 'access' ? ' active' : ''}`}
          onClick={() => setActiveTab('access')}
        >
          Role access matrix
        </button>
      </div>

      {activeTab !== 'access' && (
        <div className="admin-card-panel mb-4">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <input
              className="form-control team-search"
              placeholder="Search by name, email, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <>
          <div className="admin-card-panel mb-4">
            <h2 className="h5 mb-3 team-section-title">Invite staff member</h2>
            <p className="text-muted small mb-3">
              Create an employee account with a work email and temporary password. They sign in at the same login page as students.
            </p>
            <form className="row g-3" onSubmit={handleInvite}>
              <div className="col-md-3">
                <label className="form-label small">Full name</label>
                <input
                  className="form-control"
                  value={invite.name}
                  onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Work email</label>
                <input
                  type="email"
                  className="form-control"
                  value={invite.email}
                  onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Temporary password</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={6}
                  value={invite.password}
                  onChange={(e) => setInvite({ ...invite, password: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Role</label>
                <select
                  className="form-select"
                  value={invite.role}
                  onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                >
                  {inviteableRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn admin-btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-card-panel">
            <h2 className="h5 mb-3 team-section-title">Staff members</h2>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((u) => (
                    <tr key={u.id}>
                      <td className="cell-name">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={roleBadgeClass(u.role)}>
                          {u.roleLabel || roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td className="team-actions">
                        {canEditMember(u) ? (
                          <>
                            <select
                              className="form-select form-select-sm team-role-select"
                              value={u.role}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                if (newRole === u.role) return;
                                setPendingRoleChange({
                                  userId: u.id,
                                  role: newRole,
                                  name: u.name,
                                  label: assignableRoles.find((r) => r.value === newRole)?.label || newRole,
                                });
                                e.target.value = u.role;
                              }}
                            >
                              {assignableRoles.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => setPendingRemove(u)}
                            >
                              Revoke access
                            </button>
                          </>
                        ) : (
                          <span className="text-muted small">
                            {u.role === ROLES.SUPER_ADMIN ? 'Protected' : 'Your account'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <div className="admin-card-panel">
          <h2 className="h5 mb-3 team-section-title">Student accounts</h2>
          <p className="text-muted small mb-3">
            Promote a student to a staff role when they join your team. Revoking staff access returns them to student status.
          </p>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Promote to role</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((u) => (
                  <tr key={u.id}>
                    <td className="cell-name">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {inviteableRoles.length > 0 ? (
                        <select
                          className="form-select form-select-sm team-role-select"
                          defaultValue=""
                          onChange={(e) => {
                            const newRole = e.target.value;
                            if (!newRole) return;
                            setPendingRoleChange({
                              userId: u.id,
                              role: newRole,
                              name: u.name,
                              label: inviteableRoles.find((r) => r.value === newRole)?.label || newRole,
                            });
                            e.target.value = '';
                          }}
                        >
                          <option value="">Select role…</option>
                          {inviteableRoles.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-muted small">No promotion rights</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="admin-card-panel">
          <h2 className="h5 mb-3 team-section-title">Role access matrix</h2>
          <p className="text-muted small mb-4">
            What each role can access in the admin panel. Super Admin has full control including team management.
          </p>
          <table className="admin-data-table team-matrix-table">
            <thead>
              <tr>
                <th>Permission</th>
                {STAFF_ROLES.map((role) => (
                  <th key={role}>{roleLabels[role] || role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionRows.map((row) => (
                <tr key={row.key}>
                  <td className="cell-name">{row.label}</td>
                  {STAFF_ROLES.map((role) => (
                    <td key={role} className="text-center">
                      {row.roles.includes(role) ? (
                        <span className="team-access-yes" title="Allowed">✓</span>
                      ) : (
                        <span className="team-access-no" title="Not allowed">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingRoleChange && (
        <div className="team-modal-backdrop" role="presentation">
          <div className="team-modal">
            <h3>Confirm role change</h3>
            <p>
              Change <strong>{pendingRoleChange.name}</strong> to{' '}
              <strong>{pendingRoleChange.label}</strong>?
            </p>
            <div className="team-modal-actions">
              <button type="button" className="btn admin-btn-outline" onClick={() => setPendingRoleChange(null)}>
                Cancel
              </button>
              <button type="button" className="btn admin-btn-primary" onClick={confirmRoleChange}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingRemove && (
        <div className="team-modal-backdrop" role="presentation">
          <div className="team-modal">
            <h3>Revoke staff access</h3>
            <p>
              Remove staff access for <strong>{pendingRemove.name}</strong>? They will become a student account and lose admin panel access.
            </p>
            <div className="team-modal-actions">
              <button type="button" className="btn admin-btn-outline" onClick={() => setPendingRemove(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmRemove}>
                Revoke access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
