import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Activate() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        await axios.get(`http://localhost:5000/api/auth/activate/${token}`);
        alert('✅ Account verified successfully!');
        navigate('/login');
      } catch (err) {
        alert('❌ Verification failed. Link may have expired.');
        navigate('/signup');
      }
    };

    verifyAccount();
  }, [token, navigate]);

  return <div className="container mt-5">Verifying your account...</div>;
}
