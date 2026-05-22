import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/StatCard';

const ROLE_STYLE = {
  student:    { background: 'var(--accent-light)',        color: 'var(--accent)'               },
  admin:      { background: 'var(--status-progress-bg)',  color: 'var(--status-progress-text)' },
  department: { background: '#F3F0FD',                    color: '#5B3ACD'                     }
};

export default function UsersPage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);

  const roleStyle = (active) => ({
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    background: active ? 'var(--accent-light)' : 'var(--bg)',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    cursor: 'pointer',
    transition: 'all 0.12s'
  });

  if (loading) return <Spinner />;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Users</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{users.length} registered accounts</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { value: 'all',        label: 'All'         },
          { value: 'student',    label: 'Students'    },
          { value: 'admin',      label: 'Admins'      },
          { value: 'department', label: 'Departments' }
        ].map((r) => (
          <button key={r.value} onClick={() => setFilterRole(r.value)} style={roleStyle(filterRole === r.value)}>
            {r.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No users in this category." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map((u) => {
            const initials = u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            const rs       = ROLE_STYLE[u.role] || {};
            return (
              <div
                key={u._id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: rs.color || 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, wordBreak: 'break-all' }}>{u.email}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ ...rs, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                    {u.rollNo && (
                      <span style={{ background: 'var(--bg)', color: 'var(--text-muted)', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>
                        {u.rollNo}
                      </span>
                    )}
                    {u.department && (
                      <span style={{ background: 'var(--bg)', color: 'var(--text-muted)', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>
                        {u.department}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8 }}>
                    Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
