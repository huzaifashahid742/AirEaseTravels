/** Map visa application status to CSS pill class */
export const applicationStatusClass = (status) => {
  const key = (status || 'Pending').toLowerCase().replace(/\s+/g, '-');
  if (key === 'approved') return 'approved';
  if (key === 'rejected') return 'rejected';
  if (key === 'under-review') return 'under-review';
  return 'pending';
};

export const formatApplicationStatus = (status) => status || 'Pending';
