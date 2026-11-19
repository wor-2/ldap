import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/Toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Floating orbs animation keyframes definition via style tag or injected inline
  useEffect(() => {
    const styleId = 'login-animations';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes floatOrb1 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.95);
          }
        }
        @keyframes floatOrb2 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(-50px, 50px) scale(1.08);
          }
          66% {
            transform: translate(35px, -45px) scale(0.92);
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login(username.trim(), password);
      const resData = res.data?.data || res.data;

      const token = resData.token || resData.jwt || resData.accessToken;
      const user = {
        username: resData.username || username.trim(),
        role: resData.role || 'SUPER_USER',
        displayName: resData.displayName || resData.name || username.trim(),
        email: resData.email || '',
      };

      if (!token) {
        throw new Error('No authentication token received from server.');
      }

      setAuth(token, user);
      addToast(`Welcome back, ${user.displayName}!`, 'success');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1e',
        padding: '20px',
      }}
    >
      {/* Background Animated Gradient Orb 1 (Cyan) */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.22) 0%, rgba(0, 212, 255, 0) 70%)',
          filter: 'blur(60px)',
          animation: 'floatOrb1 16s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Background Animated Gradient Orb 2 (Violet) */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(124, 58, 237, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'floatOrb2 18s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Login Card */}
      <div
        className="glass fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px auto',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 58, 237, 0.2))',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 212, 255, 0.25)',
            }}
          >
            <Shield size={36} color="#00d4ff" />
          </div>

          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            AD Manager
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
            Active Directory Control Panel
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="label" htmlFor="username">
              Username
            </label>
            <div className="input-wrapper">
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <User size={18} />
              </span>
              <input
                id="username"
                type="text"
                className="input-field"
                placeholder="Enter domain username"
                style={{ paddingLeft: '42px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Lock size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Enter domain password"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <span
                className="input-icon"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              'Sign In to Console'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div
          style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span>Authorized Super Users Only</span>
          <span>LDAP / Active Directory Integration</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
