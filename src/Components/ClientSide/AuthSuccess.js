import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from './services/api';
import { useAuth } from './Context/AuthContext';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Save token immediately so api requests can use it
      localStorage.setItem('token', token);
      
      // 2. Fetch user profile and sync with context
      authAPI.me()
        .then((res) => {
          const userData = res.data || res;
          login(userData, token); // Saves both token & user object to context/localStorage
          
          const timer = setTimeout(() => {
            navigate('/user/dashboard', { replace: true });
          }, 200);

          return () => clearTimeout(timer);
        })
        .catch((err) => {
          console.error("Failed to authenticate Google user", err);
          navigate('/login', { replace: true });
        });
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