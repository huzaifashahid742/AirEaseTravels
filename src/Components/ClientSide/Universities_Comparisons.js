import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../Css_Folder/Universities_Comparisons.css';
import { countryDetailsAPI, FILE_BASE_URL } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import PageLoader from './PageLoader';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ExpandableText = ({ text, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <span>N/A</span>;
  if (text.length <= maxLength) return <span>{text}</span>;
  return (
    <span className="expandable-text">
      {isExpanded ? text : `${text.slice(0, maxLength)}... `}
      <button
        type="button"
        className="btn btn-link btn-sm p-0 ms-1 border-0 text-decoration-underline align-baseline"
        style={{ fontSize: '0.8em' }}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </span>
  );
};

const Universities_Comparisons = ({ onContactClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = useState('');
  const [navbarFilter, setNavbarFilter] = useState('');
  const appliedPageSearch = useDebouncedValue(pageQuery, 350);
  const activeSearch = appliedPageSearch.trim() ? appliedPageSearch : navbarFilter;
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const resultsRef = useRef(null);
  const pendingScrollRef = useRef(false);

  useEffect(() => {
    const carouselElement = document.getElementById('carouselExampleSlidesOnly');
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 3000,
        ride: 'carousel',
        pause: 'hover'
      });
    }
  }, []);

  const fetchCountries = useCallback(async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      const res = await countryDetailsAPI.getAll(params);
      setCountries(res.data || []);
      setCurrentPage(1); 
    } catch (err) {
      setError(err.message || 'Failed to load country comparisons');
      setCountries([]);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }}, []);

  useEffect(() => {
    const incoming = location.state?.searchQuery?.trim();
    if (incoming && location.state?.fromNavbar) {
      setNavbarFilter(incoming);
      setPageQuery('');
      pendingScrollRef.current = true;
      navigate('/University_Comparisons', { replace: true, state: {} });}},
      [location.state, navigate]);

  useEffect(() => {
    if (pageQuery.trim()) {
      setNavbarFilter('');}
    },[pageQuery]);

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

  const totalPages = Math.ceil(countries.length / itemsPerPage);
  const currentCountries = countries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getFormattedFlagUrl = (flagImage) => {
    if (!flagImage) return '/images/flags/default-flag.png';

    let url = flagImage.trim();
    if (url.includes('https://res.cloudinary.com')) {
      const cloudinaryIdx = url.indexOf('https://res.cloudinary.com');
      return url.substring(cloudinaryIdx);
    }
    const PRODUCTION_BACKEND_URL = 'https://aireasetravels-backend-production.up.railway.app';
    if (url.startsWith('http://localhost:7000')) {
      return url.replace('http://localhost:7000', PRODUCTION_BACKEND_URL);
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${FILE_BASE_URL || PRODUCTION_BACKEND_URL}${cleanPath}`;
  };

  return (
    <div>
      <div id="carouselExampleSlidesOnly" className="carousel slide" data-bs-ride="carousel" data-bs-interval={3000}>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/Images_Folder/Crousel_Study.jpg" className="d-block w-100" alt="Why Study in Europe" />
            <div className="carousel-caption-custom">
              <h1>Why Choose International Studies?</h1>
              <p>Affordable education. World-class universities.</p>
              <button type="button" className="open-contact" onClick={onContactClick} style={{"width" : "300px"}}>Talk to an Advisor</button>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images_Folder/Crousel_Study1.jpg" className="d-block w-100" alt="Live and Learn in Europe" />
            <div className="carousel-caption-custom">
              <h1>Live & Learn</h1>
              <p>Scholarships, work rights & rich culture.</p>
              <button type="button" className="open-contact" onClick={onContactClick} style={{"width" : "300px"}}>Talk to an Advisor</button>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images_Folder/Crousel_Study2.jpg" className="d-block w-100" alt="Study in English" />
            <div className="carousel-caption-custom">
              <h1>Study in English</h1>
              <p>Public universities with global recognition.</p>
              <button type="button" className="open-contact" onClick={onContactClick} style={{"width" : "300px"}}>Talk to an Advisor</button>
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

        <div className="comparisons-search-bar">
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
            currentCountries.map((country) => (
              <div className="Card" key={country._id}>
                <div className="country-card-header">
                  <div className="country-icon">
                    <img 
                      src={getFormattedFlagUrl(country.flagImage)} 
                      alt={`${country.countryName} flag`} 
                      onError={(e) => { e.target.src = '/images/flags/default-flag.png'; }}
                    />
                  </div>
                  <h3 className="country-name">{country.countryName}</h3>
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
                    <span className="label">Salary</span>
                    <span className="value">{country.studentSalary}</span>
                  </div>

                  {/* Compact Expandable View for Visa Difficulty */}
                  <div className="info-item">
                    <span className="label">Visa</span>
                    <span className="value">
                      <ExpandableText text={country.visaDifficulty} maxLength={45} />
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="label">Intakes</span>
                    <span className="value">
                      {Array.isArray(country.intakeSeasons) 
                        ? country.intakeSeasons.join(', ') 
                        : country.intakeSeasons}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="label">Rating</span>
                    <span className="value">⭐ {country.rating}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">Acceptance</span>
                    <span className="value">{country.acceptanceRate}</span>
                  </div>

                  <div className="info-item">
                    <span className="label">PR</span>
                    <span className="value">
                      <ExpandableText text={country.prSettlement} maxLength={30}></ExpandableText>
                    </span>
                  </div>

                  {/* Compact Expandable View for Work Rights */}
                  <div className="info-item">
                    <span className="label">Work Rights</span>
                    <span className="value">
                      <ExpandableText text={country.workRight} maxLength={30} />
                    </span>
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

        {/* --- Pagination Controls UI --- */}
        {!loading && totalPages > 1 && (
          <nav aria-label="Country comparisons pagination" className="comparisons-pagination mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              <li className="page-item disabled">
                <span className="page-link bg-transparent border-0 text-dark fw-bold">
                  Page {currentPage} of {totalPages}
                </span>
              </li>

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
      <br /><br />
    </div>
  );
};

export default Universities_Comparisons;