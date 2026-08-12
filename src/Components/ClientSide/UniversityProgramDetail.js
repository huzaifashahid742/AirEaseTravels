import { Navigate, useParams } from 'react-router-dom';

/** Legacy route — redirects to university programs list */
const ProgramDetailCard = () => {
  const { universityId } = useParams();
  if (!universityId) {
    return <Navigate to="/admin/UniversityAdmin" replace />;
  }
  return <Navigate to={`/admin/university/${universityId}/programs`} replace />;
};

export default ProgramDetailCard;
