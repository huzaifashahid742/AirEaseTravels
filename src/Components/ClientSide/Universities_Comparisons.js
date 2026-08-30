import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../Css_Folder/Universities_Comparisons.css';
import { countryDetailsAPI , FILE_BASE_URL } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import PageLoader from './PageLoader';

const Universities_Comparisons = ({ onContactClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = useState('');
  const [navbarFilter, setNavbarFilter] = useState('');
  const appliedPageSearch = useDebouncedValue(pageQuery, 350);
  
  // Base activeSearch evaluation cleanly off the actual debounced value
  const activeSearch = appliedPageSearch.trim() ? appliedPageSearch : navbarFilter;

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const resultsRef = useRef(null);
  const pendingScrollRef = useRef(false);

  const fetchCountries = useCallback(async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      const res = await countryDetailsAPI.getAll(params);
      setCountries(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load country comparisons');
      setCountries([]);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  useEffect(() => {
    const incoming = location.state?.searchQuery?.trim();
    if (incoming && location.state?.fromNavbar) {
      setNavbarFilter(incoming);
      setPageQuery('');
      pendingScrollRef.current = true;
      navigate('/University_Comparisons', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Check pageQuery directly to clear out previous navbar filters on keydown entry
  useEffect(() => {
    if (pageQuery.trim()) {
      setNavbarFilter('');
    }
  }, [pageQuery]);

  useEffect(() => {
    fetchCountries(activeSearch);
  }, [activeSearch, fetchCountries]);

  useEffect(() => {
    if (!loading && pendingScrollRef.current) {
      pendingScrollRef.current = false;
      const timer = window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => window.clearTimeout(timer);
    }
  }, [loading, countries]);
  // Helper function to format flag URLs safely
const getFormattedFlagUrl = (flagImage) => {
  if (!flagImage) return '/images/flags/default-flag.png';

  let url = flagImage.trim();

  // Fix nested Cloudinary URLs (e.g. "http://localhost:7000/https://res.cloudinary...")
  if (url.includes('https://res.cloudinary.com')) {
    const cloudinaryIdx = url.indexOf('https://res.cloudinary.com');
    return url.substring(cloudinaryIdx);
  }

  // Replace hardcoded localhost base URLs with production backend
  const PRODUCTION_BACKEND_URL = 'https://aireasetravels-backend-production.up.railway.app';
  if (url.startsWith('http://localhost:7000')) {
    return url.replace('http://localhost:7000', PRODUCTION_BACKEND_URL);
  }

  // Handle absolute HTTP/HTTPS links
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle relative paths from Railway backend
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${FILE_BASE_URL || PRODUCTION_BACKEND_URL}${cleanPath}`;
};

  return (
    <div>
      <div id="carouselExampleSlidesOnly" className="carousel slide" data-bs-ride="carousel" data-bs-interval={2500}>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/Images_Folder/Crousel_Study.jpg" className="d-block w-100" alt="Why Study in Europe" />
            <div className="carousel-caption-custom">
              <h1>Why Choose International Studies?</h1>
              <p>Affordable education. World-class universities.</p>
              <button type="button" className="open-contact" onClick={onContactClick}>Talk to an Advisor</button>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images_Folder/Crousel_Study1.jpg" className="d-block w-100" alt="Live and Learn in Europe" />
            <div className="carousel-caption-custom">
              <h1>Live & Learn</h1>
              <p>Scholarships, work rights & rich culture.</p>
              <button type="button" className="open-contact" onClick={onContactClick}>Talk to an Advisor</button>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images_Folder/Crousel_Study2.jpg" className="d-block w-100" alt="Study in English" />
            <div className="carousel-caption-custom">
              <h1>Study in English</h1>
              <p>Public universities with global recognition.</p>
              <button type="button" className="open-contact" onClick={onContactClick}>Talk to an Advisor</button>
            </div>
          </div>
        </div>
      </div>

      <div className="Comparison_Section">
        {navbarFilter && !pageQuery.trim() && (
          <p className="comparisons-active-search text-center">
            Showing results for: <strong>{navbarFilter}</strong>
            <button type="button" className="btn btn-link btn-sm" onClick={() => setNavbarFilter('')}>
              Show all countries
            </button>
          </p>
        )}

        {/* Added 10px margin-top inline styling */}
        <div className="comparisons-search-bar" style={{ marginTop: '20px', padding: '20px' }}>
          <input
            type="search"
            className="form-control"
            placeholder="Type to filter..."
            value={pageQuery}
            onChange={(e) => setPageQuery(e.target.value)}
            aria-label="Filter countries"
          />
          {pageQuery.trim() && (
            <button type="button" className="btn btn-outline-secondary" onClick={() => setPageQuery('')}>
              Clear
            </button>
          )}
        </div>

        <div ref={resultsRef} className="comparisons-results-anchor" aria-hidden="true" />

        {loading && !hasLoadedOnce && <PageLoader label="Loading country comparisons..." inline />}

        {loading && hasLoadedOnce && (
          <p className="text-center text-muted small py-2">Updating results...</p>
        )}

        {error && !loading && <p className="text-center text-danger">{error}</p>}

        {!loading && !error && countries.length === 0 && (
          <p className="text-center text-muted">
            {activeSearch ? `No countries match "${activeSearch}".` : 'No country data available.'}
          </p>
        )}

       <div className="Programs_Cards">
          {!loading &&
            countries.map((country) => (
              <div className="Card" key={country._id}>
                <div className="country-card-header">
  <div className="country-icon">
   <img 
    src={getFormattedFlagUrl(country.flagImage)} 
    alt={`${country.countryName} flag`} 
    onError={(e) => { e.target.src = '/images/flags/default-flag.png'; }}
  />
  </div>
  <h3 className="country-title">{country.countryName}</h3>
</div>

                <div className="country-info">
                  <div className="info-item">
                    <span className="label">Tuition</span>
                    <span className="value">
                      €{country.tuitionFees?.toLocaleString()}/yr
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="label">Living Cost</span>
                    <span className="value">
                      €{country.costOfLiving?.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="label">Scholarships</span>
                    <span className="value">{country.scholarshipAvailable}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Work Rights</span>
                    <span className="value">{country.workRight}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Visa</span>
                    <span className="value">{country.visaDifficulty}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Intakes</span>
                    {/* Fixed: Join array values cleanly with commas */}
                    <span className="value">
                      {Array.isArray(country.intakeSeasons) 
                        ? country.intakeSeasons.join(', ') 
                        : country.intakeSeasons}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="label">PR</span>
                    <span className="value">{country.prSettlement}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Salary</span>
                    <span className="value">{country.studentSalary}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Rating</span>
                    <span className="value">⭐ {country.rating}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Acceptance</span>
                    <span className="value">{country.acceptanceRate}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="advisor-btn"
                  onClick={onContactClick}
                >
                  Talk to an Advisor
                </button>
              </div>
            ))}
        </div>
      </div>
      <br /><br />
    </div>
  );
};

export default Universities_Comparisons;