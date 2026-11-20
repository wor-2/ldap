import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
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

  // If already authenticated, redirect immediately to dashboard
  if (isAuthenticated && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMessage('Please provide both username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login(trimmedUser, password);
      const resData = res.data?.data || res.data;

      const token = resData.token || resData.jwt || resData.accessToken;
      if (!token) {
        throw new Error('Authentication failed: no access token was returned.');
      }

      const user = {
        username: resData.username || trimmedUser,
        role: resData.role || 'SUPER_USER',
        displayName: resData.displayName || resData.name || trimmedUser,
        email: resData.email || '',
      };

      setAuth(token, user);
      addToast(`Welcome back, ${user.displayName}!`, 'success');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Sign-in error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed. Please verify credentials.';
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Animated Floating Orb 1: Large Cyan (Top-Left) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '6%',
          left: '12%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.22) 0%, rgba(0, 212, 255, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'float 8s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Animated Floating Orb 2: Violet (Bottom-Right) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '6%',
          right: '10%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.24) 0%, rgba(124, 58, 237, 0) 70%)',
          filter: 'blur(80px)',
          animation: 'floatSlow 12s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Animated Floating Orb 3: Small Cyan (Center-Right) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '36%',
          right: '24%',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.16) 0%, rgba(0, 212, 255, 0) 70%)',
          filter: 'blur(45px)',
          animation: 'floatReverse 6s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Glassmorphism Card */}
      <div
        className="glass fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '400px',
          padding: '36px 32px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg), var(--shadow-cyan)',
          border: '1px solid var(--border)',
          background: 'rgba(10, 16, 32, 0.85)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'var(--gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 24px rgba(0, 212, 255, 0.35)',
            }}
          >
            <Shield size={30} color="#ffffff" strokeWidth={2.2} />
          </div>

          <h1
            className="gradient-text"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            AD Manager
          </h1>
          <p
            className="text-muted"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            Active Directory Control Panel
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 500,
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ lineHeight: 1.4 }}>{errorMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="form-group">
            <label className="label" htmlFor="login-username">
              Username
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <User size={18} />
              </span>
              <input
                id="login-username"
                type="text"
                className="input-field has-icon-left"
                placeholder="Enter domain username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="label" htmlFor="login-password">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field has-icon-left has-icon-right"
                placeholder="Enter domain password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{
              padding: '12px 20px',
              fontSize: '0.925rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span className="spinner spinner-sm"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={17} />
                <span>Sign In to Console</span>
              </span>
            )}
          </button>
        </form>

        {/* Default Credentials Box */}
        <div
          style={{
            marginTop: '26px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <CheckCircle2 size={13} color="var(--cyan)" />
            <span>Default Test Credentials</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Username:</span>
            <span className="code-text">admin</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Password:</span>
            <span className="code-text">admin123</span>
          </div>
        </div>

        {/* Security Notice */}
        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: 'var(--text-hint)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Secured with LDAP SSL / TLS & JWT
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
