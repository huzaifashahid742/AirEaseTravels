import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Assuming your context has a login or fetchUser function

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      // If your context has a method to initialize state or fetch profile with the new token:
      if (login) {
        login(token); // Or whatever method your AuthContext uses to load user data
      }

      // Small timeout to let state sync, then send them to the dashboard
      setTimeout(() => {
        navigate('/user/dashboard', { replace: true });
      }, 100);
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h2>Authenticating with Google...</h2>
      <p>Please wait while we log you into AirEase Travels & Tours.</p>
    </div>
  );
}