import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tempToken, setTempToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        ...(showMfaInput && { mfaToken })
      });

      if (response.data.requiresMFA) {
        setUserId(response.data.userId);
        
        if (response.data.needsSetup) {
          try {
            const setupResponse = await api.post('/mfa/setup', null, {
              headers: { Authorization: `Bearer ${response.data.tempToken}` }
            });
            
            setMfaSetupData({
              qrCode: setupResponse.data.qrCode,
              secret: setupResponse.data.secret
            });
            setTempToken(response.data.tempToken);
            setShowMfaSetup(true);
            setError('');
          } catch (setupErr) {
            console.error('MFA Setup Error:', setupErr);
            setError(setupErr.response?.data?.message || 'Failed to setup MFA');
          }
        } else {
          setShowMfaInput(true);
          setError('');
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response?.data?.requiresMFA) {
        if (err.response.data.needsSetup) {
          try {
            const setupResponse = await api.post('/mfa/setup', null, {
              headers: { Authorization: `Bearer ${err.response.data.tempToken}` }
            });
            
            setMfaSetupData({
              qrCode: setupResponse.data.qrCode,
              secret: setupResponse.data.secret
            });
            setTempToken(err.response.data.tempToken);
            setUserId(err.response.data.userId);
            setShowMfaSetup(true);
            setError('');
          } catch (setupErr) {
            console.error('MFA Setup Error:', setupErr);
            setError(setupErr.response?.data?.message || 'Failed to setup MFA');
          }
        } else {
          setUserId(err.response.data.userId);
          setShowMfaInput(true);
          setError('');
        }
      } else {
        setError(err.response?.data?.message || 'An error occurred during login');
      }
      setLoading(false);
    }
  };

  const handleVerifyMfaSetup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify the MFA setup
      await api.post('/api/mfa/verify-setup', {
        token: mfaToken,
        userId: userId
      }, {
        headers: { Authorization: `Bearer ${tempToken}` }
      });

      // Then try to login again with the verified token
      const loginResponse = await api.post('/auth/login', {
        email,
        password,
        mfaToken
      });

      localStorage.setItem('token', loginResponse.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'MFA verification failed');
      setLoading(false);
    }
  };

  if (showMfaSetup) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - AI Resume Builder */}
        <div className="flex-1 flex flex-col justify-center px-12 bg-gradient-to-br from-gray-800 to-black text-white">
          <h1 className="text-6xl font-bold mb-4">AI RESUME</h1>
          <h1 className="text-6xl font-bold">BUILDER</h1>
          <p className="mt-4 text-xl">Build your resume within seconds</p>
        </div>

        {/* Right side - MFA Setup */}
        <div className="flex-1 flex flex-col justify-center p-12 bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Set Up Two-Factor Authentication</h2>
            <div className="flex justify-center mb-8">
              <img src={mfaSetupData.qrCode} alt="QR Code for MFA" className="w-64 h-64" />
            </div>
            <p className="text-center text-gray-600 mb-6">
              Scan this QR code with Microsoft Authenticator
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-wider"
                  placeholder="Enter 6-digit code"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              {error && (
                <p className="text-red-600 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {loading ? 'Verifying...' : 'Complete Setup'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black relative flex items-center justify-center px-4">
      {/* Left side text */}
      <div className="absolute left-8 sm:left-12 md:left-16 lg:left-20 top-1/2 -translate-y-1/2">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-4">AI RESUME</h1>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">BUILDER</h1>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl text-white">Build your resume within seconds</p>
      </div>

      {/* Login Form Box */}
      <div className="absolute right-6 sm:right-12 md:right-16 lg:right-24 xl:right-32 top-1/2 -translate-y-1/2">
        <div className="bg-[#e0dcdc] rounded-lg p-6 sm:p-8 w-[320px] sm:w-[360px] md:w-[400px] lg:w-[420px]">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[#1a237e] text-center">LOGIN TO YOUR ACCOUNT</h2>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            {!showMfaInput ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address :
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-2.5 sm:p-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a237e] shadow-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password :
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full p-2.5 sm:p-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a237e] shadow-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-[#1a237e] hover:text-[#1a237e]/90 text-sm">
                    Forgot Password
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Authentication Code:
                </label>
                <input
                  type="text"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  className="w-full p-2.5 sm:p-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a237e] text-center text-xl tracking-wider shadow-md"
                  placeholder="Enter 6-digit code"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMfaInput(false);
                      setMfaToken('');
                    }}
                    className="text-[#1a237e] hover:text-[#1a237e]/90 text-sm"
                  >
                    ← Back to login
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-600 text-center text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a237e] text-white p-2.5 sm:p-3 rounded-lg hover:bg-[#1a237e]/90 transition-colors"
            >
              {loading ? 'Please wait...' : (showMfaInput ? 'Verify Code' : 'LOGIN')}
            </button>
          </form>

          {!showMfaInput && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">Don't have an account?</p>
              <Link to="/register" className="text-[#1a237e] hover:text-[#1a237e]/90 font-medium">
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
