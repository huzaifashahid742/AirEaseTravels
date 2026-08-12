import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Marquee from './Marquee';
import Footer from './Footer';

const UserLayout = ({ onContactClick }) => (
  <div className="airease-user">
    <Marquee />
    <Navbar onContactClick={onContactClick} />
    <Outlet />
    <Footer oncontactclick={onContactClick} onContactClick={onContactClick} />
  </div>
);

export default UserLayout;
