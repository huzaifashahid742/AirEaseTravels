import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '../../Css_Folder/Programs_Frontend.css';
import { programsAPI } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useAuth } from '../../Context/AuthContext';
import PageLoader from './PageLoader';
import { resolveStoredImage } from '../../utils/imageUpload'; 

const PAGE_SIZE = 6;
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

const emptyFilters = {
  degree: '',
  field: '',
  language: '',
  intake: '',
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
        {/* Header Logo */}
        <div className="program-list-card__media">
          <img
            src={logoUrl || '/Images_Folder/Crousel_Study.jpg'}
            alt={`${uniName} Logo`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/Images_Folder/Crousel_Study.jpg';
            }}
          />
        </div>
        
        <div className="program-list-card__body">
          {/* University Name & Program Title Link */}
          <span className="program-list-card__uni">{uniName}</span>
          <h3 className="program-list-card__title" title={program.programName}>
            <Link to={`/Programs_Detail/${program._id}`}>{program.programName}</Link>
          </h3>
          <hr className="program-card-divider" />
          {/* Program Details List */}
          <div className="program-card-details">
            <div className="detail-item">
              <span className="detail-label">
                <i className="bi bi-calendar-event"></i> Tution Fee
              </span>
              <span className="detail-value">{program.tuitionFee ? `€${program.tuitionFee.toLocaleString()}` : '€1,700'} /Year</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <i className="bi bi-calendar3"></i> Intake Season
              </span>
              <span className="detail-value">{program.intake || 'Fall'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <i className="bi bi-geo-alt"></i> Study Mode
              </span>
              <span className="detail-value">{program.studyMode || 'Full-Time On-Campus'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <i className="bi bi-mortarboard"></i> Degree Level
              </span>
              <span className="detail-value">{program.degree || 'Master'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <i className="bi bi-clock"></i> Duration
              </span>
              <span className="detail-value">{program.duration ? `${program.duration} Years` : '2 Years'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <i className="bi bi-translate"></i> Language
              </span>
              <span className="detail-value">{program.language || 'English'}</span>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="program-list-card__actions">
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