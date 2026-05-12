import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [role,       setRole]       = useState('student');
  const [credential, setCredential] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credential.trim() || !password.trim()) {
      return toast.error('Please fill in all fields.');
    }
    setLoading(true);
    try {
      // Send rollNo for students, email for management
      const payload = role === 'student'
        ? { rollNo: credential.trim(), password }
        : { email: credential.trim(), password };
      const user = await login(payload.rollNo || payload.email, password, payload);
      toast.success(`Welcome back, ${user.name}.`);
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            CampusDesk
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Sign in to the complaint portal
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-md)'
        }}>

          {/* Role selector */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Login As
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[{ value: 'student', label: 'Student' }, { value: 'management', label: 'Management' }].map((r) => (
                <label
                  key={r.value}
                  onClick={() => { setRole(r.value); setCredential(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div onClick={() => { setCredential(''); }} style={{
                    width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${role === r.value ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.15s'
                  }}>
                    {role === r.value && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: role === r.value ? 600 : 400,
                    color: role === r.value ? 'var(--text)' : 'var(--text-muted)'
                  }}>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Credential field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                {role === 'student' ? 'Roll Number' : 'Email Address'}
              </label>
              <input
                className="field-input"
                placeholder={role === 'student' ? 'Enter your roll number' : 'Enter your email address'}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="field-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px',
                borderRadius: 'var(--radius-sm)',
                background: loading ? '#ccc' : 'var(--accent)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
