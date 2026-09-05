import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirectTo = searchParams.get('redirect'); // 👈 Grab backend's decision
    
    if (token) {
      localStorage.setItem('token', token);
      
      authAPI.me()
        .then((res) => {
          const userData = res.data || res;
          login(userData, token);
          
          setTimeout(() => {
            // If backend passed a redirect param, use it. Otherwise fallback to schema check.
            if (redirectTo) {
              navigate(redirectTo, { replace: true });
            } else if (userData.isProfileComplete === false) {
              navigate('/user/complete-profile', { replace: true });
            } else {
              navigate('/user/dashboard', { replace: true });
            }
          }, 200);
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