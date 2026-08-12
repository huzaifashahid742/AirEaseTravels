import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveSearchDestination } from '../../utils/resolveSearchDestination';
import PageLoader from './PageLoader';

/** Legacy /Search route — redirects to the matching list page with filter applied. */
const GlobalSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const term = (searchParams.get('q') || '').trim();

  useEffect(() => {
    const redirect = async () => {
      if (!term) {
        navigate('/Programs_List', { replace: true });
        return;
      }
      try {
        const path = await resolveSearchDestination(term);
        navigate(path, {
          replace: true,
          state: { searchQuery: term, fromNavbar: true },
        });
      } catch {
        navigate('/Programs_List', {
          replace: true,
          state: { searchQuery: term, fromNavbar: true },
        });
      }
    };
    redirect();
  }, [term, navigate]);

  return <PageLoader label="Finding results..." />;
};

export default GlobalSearch;
