import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/StatCard';
import ComplaintCard from '../components/ComplaintCard';

const CATEGORIES  = ['All', 'Hostel', 'Sports Complex', 'Library', 'Department', 'Faculty', 'Academic Issues'];
const STATUSES    = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES  = ['All', 'High', 'Medium', 'Low'];

export default function ComplaintsPage() {
  const { user }  = useAuth();
  const socketRef = useSocket();

  const [complaints, setComplaints] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);

  const [category, setCategory] = useState('All');
  const [status,   setStatus]   = useState('All');
  const [priority, setPriority] = useState('All');

  const isStudent = user?.role === 'student';
  const title     = isStudent ? 'My Complaints' : user?.role === 'department' ? `${user.department} — Assigned` : 'All Complaints';

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (category !== 'All') params.set('category', category);
    if (status   !== 'All') params.set('status',   status);
    if (priority !== 'All') params.set('priority', priority);

    api.get(`/complaints?${params}`)
      .then((res) => {
        setComplaints(res.data.complaints);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => toast.error('Failed to load complaints.'))
      .finally(() => setLoading(false));
  }, [page, category, status, priority]);

  useEffect(() => { setPage(1); }, [category, status, priority]);
  useEffect(() => { fetch(); }, [fetch]);

  // Real-time: update list when any complaint is changed
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onUpdate = (updated) => {
      setComplaints((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    };
    const onNew     = () => fetch();
    const onDeleted = ({ id }) => setComplaints((prev) => prev.filter((c) => c._id !== id));

    socket.on('complaint:updated', onUpdate);
    socket.on('complaint:new',     onNew);
    socket.on('complaint:deleted', onDeleted);

    return () => {
      socket.off('complaint:updated', onUpdate);
      socket.off('complaint:new',     onNew);
      socket.off('complaint:deleted', onDeleted);
    };
  }, [socketRef, fetch]);

  const pillStyle = (active) => ({
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    background: active ? 'var(--accent-light)' : 'var(--bg)',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    cursor: 'pointer',
    transition: 'all 0.12s'
  });

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{total} complaint{total !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        marginBottom: 16
      }}>
        {[
          // Category filter is not relevant for department — they only see their assigned category
          ...(user?.role !== 'department'
            ? [{ label: 'Category', opts: CATEGORIES, value: category, set: setCategory }]
            : []
          ),
          { label: 'Status',   opts: STATUSES,  value: status,   set: setStatus   },
          { label: 'Priority', opts: PRIORITIES, value: priority, set: setPriority }
        ].map((f, index, arr) => (
          <div key={f.label} style={{ marginBottom: index < arr.length - 1 ? 12 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 7, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              {f.label}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {f.opts.map((opt) => (
                <button key={opt} onClick={() => f.set(opt)} style={pillStyle(f.value === opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {complaints.length === 0
            ? <EmptyState message="No complaints match the selected filters." />
            : complaints.map((c) => (
                <ComplaintCard key={c._id} complaint={c} showStudent={!isStudent} />
              ))
          }

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '7px 16px',
                  fontWeight: 600, fontSize: 13, color: 'var(--text)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                style={{
                  background: 'var(--accent)', border: 'none',
                  borderRadius: 8, padding: '7px 16px',
                  fontWeight: 600, fontSize: 13, color: '#fff',
                  cursor: page === pages ? 'not-allowed' : 'pointer',
                  opacity: page === pages ? 0.4 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
