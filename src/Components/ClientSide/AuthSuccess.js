import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Force save the token immediately
      localStorage.setItem('token', token);
      
      // 2. Short delay to ensure localStorage is committed and context re-reads it before navigating
      const timer = setTimeout(() => {
        navigate('/user/dashboard', { replace: true });
      }, 200);

      return () => clearTimeout(timer);
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h2>Authenticating with Google...</h2>
      <p>Please wait while we log you into AirEase Travels & Tours.</p>
    </div>
  );
}