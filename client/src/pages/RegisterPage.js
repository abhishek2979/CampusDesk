import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Hostel Office', 'Sports Department', 'Library Management', 'Academic Affairs', 'Faculty Coordination'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', rollNo: '', email: '', password: '', role: 'student', department: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Please fill in all required fields.');
    }
    if (form.role === 'department' && !form.department) {
      return toast.error('Please select a department.');
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created. Welcome, ${user.name}.`);
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
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

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            Create Account
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Register to access CampusDesk
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-md)'
        }}>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Register As
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[{ value: 'student', label: 'Student' }, { value: 'department', label: 'Department' }].map((r) => (
                <label
                  key={r.value}
                  onClick={() => set('role', r.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{
                    width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${form.role === r.value ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.15s'
                  }}>
                    {form.role === r.value && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: form.role === r.value ? 600 : 400,
                    color: form.role === r.value ? 'var(--text)' : 'var(--text-muted)'
                  }}>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',   label: 'Full Name',    placeholder: 'Your full name',        type: 'text'     },
              { key: 'email',  label: 'Email Address', placeholder: 'your@email.com',       type: 'email'    }
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  className="field-input"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  required
                />
              </div>
            ))}

            {form.role === 'student' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Roll Number
                </label>
                <input
                  className="field-input"
                  placeholder="e.g. CS2021045"
                  value={form.rollNo}
                  onChange={(e) => set('rollNo', e.target.value)}
                />
              </div>
            )}

            {form.role === 'department' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Department
                </label>
                <select
                  className="field-input"
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                  required
                  style={{ appearance: 'none' }}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="field-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
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
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
