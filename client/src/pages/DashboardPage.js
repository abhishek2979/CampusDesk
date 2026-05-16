import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Spinner } from '../components/StatCard';
import ComplaintCard from '../components/ComplaintCard';

function StatCard({ label, value, accent = false }) {
  return (
    <div style={{
      background: accent ? 'var(--accent)' : 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
      border: accent ? 'none' : '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: accent ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
        letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase'
      }}>
        {label}
      </div>
      <div className="stat-value" style={{
        fontSize: 30, fontWeight: 800,
        color: accent ? '#fff' : 'var(--text)', lineHeight: 1
      }}>
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }     = useAuth();
  const socketRef    = useSocket();
  const nav          = useNavigate();
  const [data,    setData]    = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    api.get('/dashboard/stats')
      .then((res) => { setData(res.data.stats); setRecent(res.data.recentComplaints); })
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const refresh = () => fetchStats();
    socket.on('complaint:new',     refresh);
    socket.on('complaint:updated', refresh);
    socket.on('complaint:deleted', refresh);
    return () => {
      socket.off('complaint:new',     refresh);
      socket.off('complaint:updated', refresh);
      socket.off('complaint:deleted', refresh);
    };
  }, [socketRef]);

  if (loading) return <Spinner />;

  const pct         = data?.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;
  const categoryMax = Math.max(...(data?.byCategory?.map((c) => c.count) ?? [1]), 1);

  return (
    <div className="fade-up">

      {/* Hero */}
      <div
        className="hero-card"
        style={{
          background: 'var(--accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 24px',
          marginBottom: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>
              Welcome back,
            </div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
            {user?.rollNo     && <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 }}>Roll No: {user.rollNo}</div>}
            {user?.department && <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 }}>{user.department}</div>}
          </div>
          {data?.total > 0 && (
            <div className="hero-rate" style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Resolution Rate</div>
              <div style={{ color: '#fff', fontSize: 30, fontWeight: 800 }}>{pct}%</div>
            </div>
          )}
        </div>
        {data?.total > 0 && (
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 4, height: 5 }}>
            <div style={{
              height: 5, borderRadius: 4, background: '#fff',
              width: `${pct}%`, transition: 'width 0.5s ease'
            }} />
          </div>
        )}
      </div>

      {/* Stats grid — 4 cols desktop, 2 cols mobile */}
      <div className="stat-grid">
        <StatCard label="Total"       value={data?.total      ?? 0} />
        <StatCard label="Pending"     value={data?.pending    ?? 0} />
        <StatCard label="In Progress" value={data?.inProgress ?? 0} />
        <StatCard label="Resolved"    value={data?.resolved   ?? 0} />
      </div>

      {/* Admin extra stats */}
      {user?.role === 'admin' && (
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <StatCard label="Students"    value={data?.totalStudents ?? 0} />
          <StatCard label="Departments" value={data?.totalDepts    ?? 0} />
          <StatCard label="Unassigned"  value={data?.unassigned    ?? 0} accent />
        </div>
      )}

      {/* Actions + Category grid */}
      {(() => {
        const showCategory = user?.role !== 'department' && data?.byCategory?.length > 0;
        return (
          <div
            className="action-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: showCategory ? '1fr 1fr' : '1fr',
              gap: 14,
              marginBottom: 22
            }}
          >
            {/* Quick Actions */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '18px 20px'
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
                Quick Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user?.role === 'student' && (
                  <button
                    onClick={() => nav('/submit')}
                    style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      borderRadius: 'var(--radius-sm)', padding: '11px 16px',
                      fontWeight: 600, fontSize: 14, textAlign: 'left'
                    }}
                  >
                    Submit a New Complaint
                  </button>
                )}
                <button
                  onClick={() => nav(user?.role === 'student' ? '/my-complaints' : '/complaints')}
                  style={{
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '11px 16px',
                    fontWeight: 600, fontSize: 14, textAlign: 'left'
                  }}
                >
                  {user?.role === 'student' ? 'View My Complaints' : 'View All Complaints'}
                </button>
              </div>
            </div>

            {/* By Category */}
            {showCategory && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '18px 20px'
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
                  By Category
                </div>
                {data.byCategory.map(({ _id, count }) => (
                  <div key={_id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{_id}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ background: 'var(--bg)', borderRadius: 4, height: 5 }}>
                      <div style={{
                        height: 5, borderRadius: 4, background: 'var(--accent)',
                        width: `${(count / categoryMax) * 100}%`,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Recent complaints */}
      {recent.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            Recent Complaints
          </div>
          {recent.map((c) => (
            <ComplaintCard key={c._id} complaint={c} showStudent={user?.role !== 'student'} />
          ))}
        </div>
      )}
    </div>
  );
}
