import { createContext, useContext, useState } from 'react';

const AdminSearchContext = createContext({
  query: '',
  setQuery: () => {},
});

export const AdminSearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  return (
    <AdminSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </AdminSearchContext.Provider>
  );
};

export const useAdminSearch = () => useContext(AdminSearchContext);
