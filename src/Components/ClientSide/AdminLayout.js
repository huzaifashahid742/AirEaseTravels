import { Outlet } from 'react-router-dom';
import Admin_Navbar from './Admin_Navbar';
import { AdminSearchProvider } from '../../Context/AdminSearchContext';

const AdminLayout = () => (
  <div className="airease-admin">
    <AdminSearchProvider>
      <Admin_Navbar />
      <Outlet />
    </AdminSearchProvider>
  </div>
);

export default AdminLayout;
