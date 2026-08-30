import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api'; // Adjust path to your api.js
import { useAuth } from '../../Context/AuthContext';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Save token temporarily so API requests work
      localStorage.setItem('token', token);
      
      // 2. Fetch the user profile from the backend right away
      authAPI.me()
        .then((res) => {
          const userData = res.data || res;
          // 3. Use your context's login method to save BOTH token and user data properly
          login(userData, token);
          
          // 4. Redirect to dashboard
          navigate('/user/dashboard', { replace: true });
        })
        .catch((err) => {
          console.error("Failed to fetch user profile after Google login", err);
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