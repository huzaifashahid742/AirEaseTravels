import { countryDetailsAPI, programsAPI, universitiesAPI } from '../services/api';

const countFromResponse = (res) => res?.pagination?.total ?? (res?.data?.length ?? 0);

/**
 * Pick the list page that best matches a global navbar search term.
 */
export async function resolveSearchDestination(term) {
  const trimmed = String(term || '').trim();
  if (!trimmed) return '/Programs_List';

  const [programsRes, universitiesRes, countriesRes] = await Promise.all([
    programsAPI.getAll({ search: trimmed, limit: 1 }),
    universitiesAPI.getAll({ search: trimmed, limit: 1 }),
    countryDetailsAPI.getAll({ search: trimmed, limit: 1 }),
  ]);

  const counts = {
    programs: countFromResponse(programsRes),
    universities: countFromResponse(universitiesRes),
    countries: countFromResponse(countriesRes),
  };

  const ranked = [
    { path: '/Programs_List', count: counts.programs },
    { path: '/Universities_List', count: counts.universities },
    { path: '/University_Comparisons', count: counts.countries },
  ].sort((a, b) => b.count - a.count);

  if (ranked[0].count > 0) return ranked[0].path;

  return '/Programs_List';
}
