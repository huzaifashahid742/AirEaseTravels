import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '../../Css_Folder/Programs_Frontend.css';
import { programsAPI } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useAuth } from '../../Context/AuthContext';
import PageLoader from './PageLoader';
// 1. IMPORT YOUR IMAGE RESOLVER UTILITY HERE
import { resolveStoredImage } from '../../utils/imageUpload'; 

const PAGE_SIZE = 9;

const DEGREE_OPTIONS = [
  { label: 'Undergraduate', value: 'Bachelor' },
  { label: 'Master', value: 'Master' },
  { label: 'Foundation', value: 'Diploma' },
];

const FIELD_OPTIONS = [
  { label: 'Engineering', value: 'Computer Science & Engineering' },
  { label: 'Medical', value: 'Medicine & Healthcare' },
  { label: 'Business', value: 'Business & Management' },
  { label: 'Arts', value: 'Arts & Humanities' },
];

const CITY_OPTIONS = ['Rome', 'Milan', 'Florence', 'Bologna'];

const emptyFilters = {
  degree: '',
  field: '',
  language: '',
  intake: '',
  city: '',
  status: '',
};

const Programs_List = ({ onContactClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [pageQuery, setPageQuery] = useState('');
  const [navbarFilter, setNavbarFilter] = useState('');

  const appliedPageSearch = useDebouncedValue(pageQuery, 350);
  const activeSearch = pageQuery.trim() ? appliedPageSearch : navbarFilter;

  const [filters, setFilters] = useState(emptyFilters);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const resultsRef = useRef(null);
  const pendingScrollRef = useRef(false);
  const prevAppliedSearchRef = useRef(activeSearch);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setPage(1);
    pendingScrollRef.current = true;
  };

  const fetchPrograms = useCallback(async (pageNum, search, filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pageNum,
        limit: PAGE_SIZE,
      };

      if (search.trim()) params.search = search.trim();
      if (filters.degree) params.degree = filters.degree;
      if (filters.field) params.field = filters.field;
      if (filters.language) params.language = filters.language;
      if (filters.intake) params.intake = filters.intake;
      if (filters.city) params.city = filters.city;
      if (filters.status) params.status = filters.status;

      const response = await programsAPI.getAll(params);
      
      const rawPrograms = response.data || [];

      const validPrograms = rawPrograms.filter(program => 
        program.universityId?.universityName || program.university
      );

      setPrograms(validPrograms);
      setPagination(response.pagination || { total: validPrograms.length, totalPages: 1, page: pageNum });
    } catch (err) {
      setError(err.message);
      setPrograms([]);
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
      setPage(1);
      pendingScrollRef.current = true;

      navigate('/Programs_List', { replace: true, state: {} });
      return;
    }

    const fromUrl = searchParams.get('search')?.trim();
    const degreeParam = searchParams.get('degree');
    const languageParam = searchParams.get('language');

    if (degreeParam || languageParam) {
      setFilters((prev) => ({
        ...prev,
        ...(degreeParam ? { degree: degreeParam } : {}),
        ...(languageParam ? { language: languageParam } : {}),
      }));
      setPage(1);
      pendingScrollRef.current = true;
    }

    if (fromUrl) {
      setPageQuery(fromUrl);
      setNavbarFilter('');
      setPage(1);
      pendingScrollRef.current = true;
    }

    if (fromUrl || degreeParam || languageParam) {
      setSearchParams({}, { replace: true });
    }
  }, [location.state, searchParams, navigate, setSearchParams]);

  useEffect(() => {
    if (pageQuery.trim()) setNavbarFilter('');
  }, [pageQuery]);

  useEffect(() => {
    const searchChanged = prevAppliedSearchRef.current !== activeSearch;
    prevAppliedSearchRef.current = activeSearch;

    const pageNum = searchChanged ? 1 : page;

    if (searchChanged && page !== 1) {
      setPage(1);
    }

    fetchPrograms(pageNum, activeSearch, filters);
  }, [page, activeSearch, filters, fetchPrograms]);

  useEffect(() => {
    if (!loading && pendingScrollRef.current) {
      pendingScrollRef.current = false;
      const timer = setTimeout(() => scrollToResults(), 80);
      return () => clearTimeout(timer);
    }
  }, [loading, programs, error, scrollToResults]);

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setPageQuery('');
    setNavbarFilter('');
    setPage(1);
  };

  const clearNavbarFilter = () => {
    setNavbarFilter('');
    setPage(1);
  };

  const handleShowMore = () => {
    if (page < pagination.totalPages) {
      pendingScrollRef.current = true;
      setPage((p) => p + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      pendingScrollRef.current = true;
      setPage((p) => p - 1);
    }
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const startItem = programs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, pagination.total);

  return (
    <div>
      <div className="Hero_Section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Programs Offered</h1>
          <p>Undergraduate, Masters, Foundation, Specialized Programs</p>
          <button type="button" className="open-contact" onClick={onContactClick}>
            Talk to an Advisor
          </button>
        </div>
      </div>

      <div className="Container container-with-filters">
        <form className="Filter_Section" onSubmit={(e) => e.preventDefault()}>
          <hr style={{ margin: '20px 20px', color: '#edeaee' }} />
          <span className="Filter"><h2>Filter Programs</h2></span>
          <div style={{ padding: '10px' }}>
            <input
              type="search"
              className="form-control"
              placeholder="Search programs..."
              value={pageQuery}
              onChange={(e) => {
                setPageQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <hr />

          <span className="Program_Level">
            <h3>Program Level</h3>
            {DEGREE_OPTIONS.map((opt) => (
              <label key={opt.value}>
                <input
                  type="radio"
                  name="degree_level"
                  checked={filters.degree === opt.value}
                  onChange={() => handleFilterChange('degree', opt.value)}
                />
                {' '} {opt.label}
              </label>
            ))}
            <label>
              <input
                type="radio"
                name="degree_level"
                checked={filters.degree === ''}
                onChange={() => handleFilterChange('degree', '')}
              />
              {' '} All levels
            </label>
          </span>

          <hr />

          <span className="Program_Level">
            <h3>Study Field</h3>
            {FIELD_OPTIONS.map((opt) => (
              <label key={opt.value}>
                <input
                  type="radio"
                  name="study_field"
                  checked={filters.field === opt.value}
                  onChange={() => handleFilterChange('field', opt.value)}
                />
                {' '} {opt.label}
              </label>
            ))}
            <label>
              <input
                type="radio"
                name="study_field"
                checked={filters.field === ''}
                onChange={() => handleFilterChange('field', '')}
              />
              {' '} Any field
            </label>
          </span>

          <hr />

          <span className="Program_Level">
            <h3>Language</h3>
            {['English', 'Italian', 'German', 'French', 'Spanish'].map((lang) => (
              <label key={lang}>
                <input
                  type="radio"
                  name="language"
                  checked={filters.language === lang}
                  onChange={() => handleFilterChange('language', lang)}
                />
                {' '} {lang}
              </label>
            ))}
            <label>
              <input
                type="radio"
                name="language"
                checked={filters.language === ''}
                onChange={() => handleFilterChange('language', '')}
              />
              {' '} Any language
            </label>
          </span>
          <hr />

          <span className="Program_Level filter-actions">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </span>
          <hr />
        </form>

        <div className="Programs_Card">
          <div className="Title">
            <h2>Programs Available</h2>
          </div>
          {navbarFilter && !pageQuery.trim() && (
            <p className="programs-active-search">
              Showing results for: <strong>{navbarFilter}</strong>
              <button type="button" className="btn btn-link btn-sm" onClick={clearNavbarFilter}>
                Show all programs
              </button>
            </p>
          )}

          <div ref={resultsRef} className="programs-results-anchor" />

          {loading && !hasLoadedOnce && (
            <PageLoader label="Loading programs..." inline />
          )}

          {loading && hasLoadedOnce && (
            <p className="text-center text-muted small py-2">Updating results...</p>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && programs.length === 0 && (
            <p className="text-center text-muted my-4">
              {activeSearch
                ? `No programs match "${activeSearch}".`
                : 'No programs match your filters.'}
            </p>
          )}

          {!loading && programs.length > 0 && (
            <>
              <p className="text-center text-muted programs-page-info">
                Showing {startItem}–{endItem} of {pagination.total}
              </p>

              <div className="programs-card-grid">
                {programs.map((program) => {
                  const uniName = program.universityId?.universityName || program.university || '';
                  const uniLogo = program.universityId?.logo;
                  const logoUrl = resolveStoredImage(uniLogo);

                  return (
                    <article className="program-list-card" key={program._id}> 
                      <div 
                        className="program-list-card__media" 
                        style={{ 
                          backgroundColor: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          overflow: 'hidden',
                          width: '100%',
                          aspectRatio: '16 / 10', /* Restricts frame to a standardized clean dimension */
                          position: 'relative'
                        }}
                      >
                        <img
                          src={logoUrl || '/Images_Folder/Crousel_Study.jpg'}
                          alt={`${uniName} Logo`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: uniLogo ? 'contain' : 'cover', 
                            padding: uniLogo ? '16px' : '0' 
                          }}
                        />
                        <span className="program-list-card__degree">{program.degree}</span>
                      </div>
                      
                      <div className="program-list-card__body">
                        <h3>{program.programName}</h3>
                        <ul className="program-list-card__meta">
                          <li><i className="fa fa-book" /> {program.field}</li>
                          <li><i className="fa fa-language" /> {program.language}</li>
                          <li><i className="fa fa-clock" /> {program.duration || '—'}</li>
                          <li><i className="fa fa-euro-sign" /> €{program.tuitionFee?.toLocaleString?.() ?? program.tuitionFee}/yr</li>
                        </ul>
                        <p className="program-list-card__deadline">
                          Deadline: {formatDeadline(program.applicationDeadline)}
                        </p>
                        <div className="program-list-card__actions">
                          <Link to={`/Programs_Detail/${program._id}`} className="btn program-btn-outline">
                            View details
                          </Link>
                          <button
                            type="button"
                            className="btn program-btn-primary"
                            onClick={() => {
                              if (!user) {
                                navigate('/Login_Page');
                                return;
                              }
                              navigate(`/user/apply/${program._id}`);
                            }}
                          >
                            Apply via us
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="programs-pagination">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handlePreviousPage}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </button>

                {page < pagination.totalPages && (
                  <button
                    type="button"
                    className="btn btn-primary Show-more-btn"
                    onClick={handleShowMore}
                    disabled={loading}
                  >
                    Show More
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleShowMore}
                  disabled={page >= pagination.totalPages || loading}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programs_List;