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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="min-h-screen flex bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
        {/* Left side - Brand */}
        <div className="flex-1 flex flex-col justify-center px-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-white">ResumePro</h1>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Secure your account with two-factor authentication for enhanced protection
            </p>
          </div>
        </div>

        {/* Right side - MFA Setup */}
        <div className="flex-1 flex flex-col justify-center p-12 bg-white/5 backdrop-blur-sm">
          <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Setup Authentication</h2>
              <p className="text-gray-300">Scan the QR code with your authenticator app</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <img src={mfaSetupData.qrCode} alt="QR Code for MFA" className="w-48 h-48" />
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-xl tracking-widest text-white placeholder-gray-300"
                  placeholder="000000"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showMfaInput) {
  return (
      <div className="min-h-screen flex bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
        {/* Left side - Brand */}
        <div className="flex-1 flex flex-col justify-center px-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
      </div>

          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-white">ResumePro</h1>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Enter your verification code to complete the secure login process
            </p>
          </div>
                </div>

        {/* Right side - MFA Input */}
        <div className="flex-1 flex flex-col justify-center p-12 bg-white/5 backdrop-blur-sm">
          <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter Verification Code</h2>
              <p className="text-gray-300">Check your authenticator app for the 6-digit code</p>
                </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-xl tracking-widest text-white placeholder-gray-300"
                  placeholder="000000"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center text-sm">
                  {error}
                </div>
              )}
                  <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Login'
                )}
                  </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Brand & Description */}
          <div className="text-center md:text-left space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center md:justify-start">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mr-4 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ResumePro
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-lg mx-auto md:mx-0">
                Build professional resumes in seconds with our AI-powered platform
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AI-Powered Templates
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ATS Optimization
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Export Ready
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-300">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 pr-12 transition-all duration-300"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

            {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-center text-sm">
                      {error}
                    </div>
            )}

            <button
              type="submit"
              disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
            </button>
          </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-300 text-sm mb-2">Don't have an account?</p>
                  <Link 
                    to="/register" 
                    className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
                  >
                    Create Account
              </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
