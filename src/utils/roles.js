export const ROLES = {
  USER: 'user',
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  ADMISSIONS: 'Admissions',
  CONTENT: 'Content',
};

export const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ADMISSIONS,
  ROLES.CONTENT,
];

export const ROLE_LABELS = {
  [ROLES.USER]: 'Student',
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.ADMISSIONS]: 'Admissions',
  [ROLES.CONTENT]: 'Content Manager',
};

export const PERMISSION_LABELS = {
  manageTeam: 'Team & roles',
  universities: 'Universities',
  programs: 'Programs',
  countryDetails: 'Country comparisons',
  applications: 'Applications',
  students: 'Student records',
};

export const PERMISSIONS = {
  manageTeam: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  universities: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT],
  programs: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT],
  countryDetails: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT],
  applications: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADMISSIONS],
  students: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ADMISSIONS],
};

export const isStaffRole = (userOrRole) => {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  return STAFF_ROLES.includes(role);
};

export const isStudentRole = (role) =>
  !role || role === ROLES.USER || String(role).toLowerCase() === 'user';

/** Students on public signup; legacy accounts may have no role field */
export const isStudent = (user) => {
  if (!user) return false;
  return isStudentRole(user.role);
};

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;

export const isAdmin = (user) => user?.role === ROLES.ADMIN || isSuperAdmin(user);

/** @deprecated use isStaffRole */
export const isAdminLegacy = (user) => isStaffRole(user);

export const hasPermission = (user, permission) => {
  const role = user?.role;
  return Boolean(PERMISSIONS[permission]?.includes(role));
};

export const getAssignableRolesFor = (actorRole) => {
  if (actorRole === ROLES.SUPER_ADMIN) {
    return [
      { value: ROLES.USER, label: `${ROLE_LABELS[ROLES.USER]} (revoke staff access)` },
      { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
      { value: ROLES.ADMISSIONS, label: ROLE_LABELS[ROLES.ADMISSIONS] },
      { value: ROLES.CONTENT, label: ROLE_LABELS[ROLES.CONTENT] },
    ];
  }
  if (actorRole === ROLES.ADMIN) {
    return [
      { value: ROLES.USER, label: `${ROLE_LABELS[ROLES.USER]} (revoke staff access)` },
      { value: ROLES.ADMISSIONS, label: ROLE_LABELS[ROLES.ADMISSIONS] },
      { value: ROLES.CONTENT, label: ROLE_LABELS[ROLES.CONTENT] },
    ];
  }
  return [];
};

export const canManageUser = (actorRole, targetRole) => {
  if (actorRole === ROLES.SUPER_ADMIN) return true;
  if (actorRole === ROLES.ADMIN) {
    return isStudentRole(targetRole) || [ROLES.ADMISSIONS, ROLES.CONTENT].includes(targetRole);
  }
  return false;
};

export const roleBadgeClass = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN: return 'team-badge team-badge-super';
    case ROLES.ADMIN: return 'team-badge team-badge-admin';
    case ROLES.ADMISSIONS: return 'team-badge team-badge-admissions';
    case ROLES.CONTENT: return 'team-badge team-badge-content';
    default: return 'team-badge team-badge-student';
  }
};
