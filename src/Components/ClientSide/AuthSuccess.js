import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Adjust path to your AuthContext
import { isStaffRole } from '../../utils/roles';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Fetch or decode user data if needed, or pass token to context.
      // If your login context accepts (userData, token), make sure you handle it accordingly:
      localStorage.setItem('token', token);
      
      // If your backend token comes with user details or if you fetch profile:
      // For now, redirecting to dashboard or triggering a user load:
      navigate('/user/dashboard'); 
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h2>Authenticating with Google...</h2>
      <p>Please wait while we log you into AirEase Travels & Tours.</p>
    </div>
  );
}