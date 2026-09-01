import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../Css_Folder/Universities_List.css';
import { programsAPI, universitiesAPI } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { resolveStoredImage } from '../../utils/imageUpload';
import PageLoader from './PageLoader';

const Universities_List = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = useState('');
  const [navbarFilter, setNavbarFilter] = useState('');
  const appliedPageSearch = useDebouncedValue(pageQuery, 350);
  const activeSearch = pageQuery.trim() ? appliedPageSearch : navbarFilter;

  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 6; // Limit to 6 cards per page

  const resultsRef = useRef(null);
  const pendingScrollRef = useRef(false);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

 const fetchData = useCallback(async (searchTerm, pageNum) => {
    setLoading(true);
    setError('');
    try {
      const uniParams = { limit, page: pageNum };
      if (searchTerm) uniParams.search = searchTerm;

      const [uniRes, progRes] = await Promise.all([
        universitiesAPI.getAll(uniParams),
        programsAPI.getAll({ limit: 200, ...(searchTerm ? { search: searchTerm } : {}) }),
      ]);
      
      // Correctly extract items from uniRes.data.data and total from pagination
      const uniData = uniRes.data?.data || uniRes.data?.universities || [];
      const totalCount = uniRes.data?.pagination?.total ?? uniRes.data?.totalCount ?? uniRes.data?.total ?? uniData.length;

      setUniversities(uniData);
      setTotalResults(totalCount);
      setTotalPages(Math.ceil(totalCount / limit) || 1);
      setPrograms(progRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load universities');
      setUniversities([]);
      setPrograms([]);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }
  }, [limit]);

  useEffect(() => {
    const incoming = location.state?.searchQuery?.trim();
    if (incoming && location.state?.fromNavbar) {
      setNavbarFilter(incoming);
      setPageQuery('');
      setCurrentPage(1);
      pendingScrollRef.current = true;
      navigate('/Universities_List', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (pageQuery.trim()) setNavbarFilter('');
    setCurrentPage(1); // Reset to page 1 on new search
  }, [pageQuery]);

  useEffect(() => {
    fetchData(activeSearch, currentPage);
  }, [activeSearch, currentPage, fetchData]);

  useEffect(() => {
    if (!loading && pendingScrollRef.current) {
      pendingScrollRef.current = false;
      const timer = window.setTimeout(() => scrollToResults(), 80);
      return () => window.clearTimeout(timer);
    }
  }, [loading, universities, error, scrollToResults]);

  const programsForUniversity = (universityId) =>
    programs.filter((p) => {
      const uid = p.universityId?._id || p.universityId;
      return String(uid) === String(universityId);
    });

  const togglePrograms = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      scrollToResults();
    }
  };

  return (
    <div className="uni-list-page">
      <header className="uni-list-hero">
        <h1>Offering Universities</h1>
        <p>
          Explore accredited institutions across Globe and apply with AirEase guidance.
        </p>
      </header>

      <div className="uni-list-toolbar">
        <div className="uni-search-wrap">
          <i className="fa-solid fa-magnifying-glass" aria-hidden />
          <input
            type="search"
            placeholder="Search by name, city, or country..."
            value={pageQuery}
            onChange={(e) => setPageQuery(e.target.value)}
            aria-label="Filter universities"
          />
          {pageQuery.trim() && (
            <button type="button" className="uni-search-clear" onClick={() => setPageQuery('')}>
              Clear
            </button>
          )}
        </div>
        {navbarFilter && !pageQuery.trim() && (
          <p className="uni-active-filter">
            Results for <strong>{navbarFilter}</strong>
            <button type="button" onClick={() => setNavbarFilter('')}>
              Show all
            </button>
          </p>
        )}
      </div>

      <div ref={resultsRef} className="universities-results-anchor" aria-hidden="true" />

      {loading && !hasLoadedOnce && <PageLoader label="Loading universities..." inline />}

      {loading && hasLoadedOnce && (
        <p className="uni-loading-hint">Updating results...</p>
      )}

      {error && !loading && (
        <div className="alert alert-danger uni-list-alert">{error}</div>
      )}

      {!loading && !error && (
        <>
          <p className="uni-results-count">
            {totalResults} universit{totalResults === 1 ? 'y' : 'ies'} found
          </p>

          {universities.length === 0 ? (
            <div className="uni-empty-state">
              <i className="fa-solid fa-building-columns" aria-hidden />
              <p>
                {activeSearch
                  ? `No universities match "${activeSearch}".`
                  : 'No universities available at the moment.'}
              </p>
              <Link to="/Programs_List" className="btn uni-btn-primary">
                Browse programs instead
              </Link>
            </div>
          ) : (
            <>
              <div className="uni-card-grid">
                {universities.map((uni) => {
                  const uniPrograms = programsForUniversity(uni._id);
                  const isOpen = expandedId === uni._id;
                  const programCount = uni.programCount ?? uniPrograms.length;

                  return (
                    <article key={uni._id} className={`uni-card${isOpen ? ' uni-card--expanded' : ''}`}>
                      <div className="uni-card__top">
                        <img
                          src={resolveStoredImage(uni.logo)}
                          alt=""
                          className="uni-card__logo"
                        />
                        <div className="uni-card__info">
                          <h2>{uni.universityName}</h2>
                          <p className="uni-card__location">
                            <i className="fa-solid fa-location-dot" aria-hidden />
                            {uni.city}, {uni.country}
                          </p>
                          <div className="uni-card__badges">
                            <span className="uni-badge uni-badge--type">{uni.universityType}</span>
                            <span className={`uni-badge uni-badge--status uni-badge--${(uni.status || 'open').toLowerCase().replace(/\s+/g, '-')}`}>
                              {uni.status || 'Open'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="uni-card__stats">
                        <span>
                          <strong>{programCount}</strong> program{programCount !== 1 ? 's' : ''}
                        </span>
                        {uni.link && (
                          <a
                            href={uni.link}
                            className="uni-card__website"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Official website
                            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                          </a>
                        )}
                      </div>

                      <div className="uni-card__actions">
                        <button
                          type="button"
                          className="btn uni-btn-outline"
                          onClick={() => togglePrograms(uni._id)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? 'Hide programs' : `View programs (${uniPrograms.length})`}
                        </button>
                        <Link to="/Programs_List" className="btn uni-btn-primary">
                          Explore programs
                        </Link>
                      </div>

                      {isOpen && (
                        <div className="uni-card__programs">
                          {uniPrograms.length === 0 ? (
                            <p className="text-muted small mb-0">No programs listed yet.</p>
                          ) : (
                            <ul className="uni-program-list">
                              {uniPrograms.map((program) => (
                                <li key={program._id}>
                                  <div className="uni-program-list__main">
                                    <span className="uni-program-list__name">{program.programName}</span>
                                    <span className="uni-program-list__meta">
                                      {program.degree} · {program.language} · {program.duration}
                                    </span>
                                  </div>
                                  <div className="uni-program-list__side">
                                    <span className="uni-program-list__fee">€{program.tuitionFee?.toLocaleString?.() ?? program.tuitionFee}</span>
                                    <Link to={`/Programs_Detail/${program._id}`} className="uni-program-link">
                                      Details
                                    </Link>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="uni-pagination">
                  <button
                    type="button"
                    className="btn uni-pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" /> Previous
                  </button>
                  <span className="uni-pagination-info">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn uni-pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Universities_List;