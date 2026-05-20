import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { Spinner } from '../components/StatCard';

const DEPARTMENTS = [
  'Hostel Office',
  'Sports Department',
  'Library Management',
  'Academic Affairs',
  'Faculty Coordination'
];

const fieldLabel = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: 'var(--text-muted)', marginBottom: 6,
  letterSpacing: 0.4, textTransform: 'uppercase'
};

const fieldInput = {
  width: '100%', padding: '10px 13px', borderRadius: 8,
  border: '1.5px solid var(--border)', background: 'var(--bg)',
  fontSize: 14, color: 'var(--text)', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box'
};

const STATUS_BORDER = {
  'Pending':     'var(--status-pending-text)',
  'In Progress': 'var(--status-progress-text)',
  'Resolved':    'var(--status-resolved-text)',
  'Rejected':    'var(--status-rejected-text)'
};

function StatusPill({ s, active, onClick }) {
  const colors = {
    'Pending':     { bg: 'var(--status-pending-bg)',   col: 'var(--status-pending-text)'   },
    'In Progress': { bg: 'var(--status-progress-bg)',  col: 'var(--status-progress-text)'  },
    'Resolved':    { bg: 'var(--status-resolved-bg)',  col: 'var(--status-resolved-text)'  },
    'Rejected':    { bg: 'var(--status-rejected-bg)',  col: 'var(--status-rejected-text)'  }
  };
  const c = colors[s] || {};
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 20, fontSize: 13,
        fontWeight: active ? 700 : 400, cursor: 'pointer',
        background: active ? c.bg  : 'var(--bg)',
        color:      active ? c.col : 'var(--text-muted)',
        border: `1.5px solid ${active ? c.col : 'var(--border)'}`,
        transition: 'all 0.12s'
      }}
    >
      {s}
    </button>
  );
}

export default function ComplaintDetailPage() {
  const { id }    = useParams();
  const nav       = useNavigate();
  const { user }  = useAuth();
  const socketRef = useSocket();

  const [complaint,   setComplaint]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [status,      setStatus]      = useState('');
  const [assignedTo,  setAssignedTo]  = useState('');
  const [adminRes,    setAdminRes]    = useState('');
  const [deptRemarks, setDeptRemarks] = useState('');
  const [replyMsg,    setReplyMsg]    = useState('');

  const replyInputRef = useRef(null);

  const isStudent    = user?.role === 'student';
  const isAdmin      = user?.role === 'admin';
  const isDepartment = user?.role === 'department';

  const load = () => {
    api.get(`/complaints/${id}`)
      .then((res) => {
        const c = res.data.complaint;
        setComplaint(c);
        setStatus(c.status);
        setAssignedTo(c.assignedTo || '');
        setAdminRes(c.adminResponse || '');
        setDeptRemarks(c.departmentRemarks || '');
      })
      .catch(() => toast.error('Complaint not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onUpdate = (updated) => {
      if (updated._id === id) {
        setComplaint(updated);
        setStatus(updated.status);
        setAssignedTo(updated.assignedTo || '');
        setAdminRes(updated.adminResponse || '');
        setDeptRemarks(updated.departmentRemarks || '');
        toast.success('Updated in real time.');
      }
    };
    const onReply = ({ complaintId }) => {
      if (complaintId === id) load();
    };

    socket.on('complaint:updated', onUpdate);
    socket.on('complaint:reply',   onReply);
    return () => {
      socket.off('complaint:updated', onUpdate);
      socket.off('complaint:reply',   onReply);
    };
  }, [socketRef, id]);

  const handleAdminSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/complaints/${id}`, {
        status, assignedTo, adminResponse: adminRes
      });
      setComplaint(data.complaint);
      toast.success('Changes saved.');
    } catch { toast.error('Save failed.'); }
    finally  { setSaving(false); }
  };

  const handleDeptSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/complaints/${id}`, {
        status, departmentRemarks: deptRemarks
      });
      setComplaint(data.complaint);
      toast.success('Progress updated.');
    } catch { toast.error('Update failed.'); }
    finally  { setSaving(false); }
  };

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/complaints/${id}/reply`, { message: replyMsg });
      setComplaint(data.complaint);
      setReplyMsg('');
      toast.success('Reply sent.');
    } catch { toast.error('Reply failed.'); }
    finally  { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Deleted.');
      nav(-1);
    } catch { toast.error('Delete failed.'); }
  };

  if (loading)    return <Spinner />;
  if (!complaint) return (
    <div style={{ padding: 40, color: 'var(--text-muted)' }}>Complaint not found.</div>
  );

  const c    = complaint;
  const date = new Date(c.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="fade-up">

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10
      }}>
        <button
          onClick={() => nav(-1)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px', fontSize: 13,
            fontWeight: 500, color: 'var(--text)'
          }}
        >
          Back
        </button>
        {isAdmin && (
          <button
            onClick={handleDelete}
            style={{
              background: 'var(--status-rejected-bg)',
              color: 'var(--status-rejected-text)',
              border: 'none', borderRadius: 8,
              padding: '6px 14px', fontSize: 13, fontWeight: 600
            }}
          >
            Delete Complaint
          </button>
        )}
      </div>

      {/* complaint info */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${STATUS_BORDER[c.status] || 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '22px 24px',
        marginBottom: 14
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4 }}>
              {c.complaintId} — {date}
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)' }}>
              {c.title}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge   status={c.status} />
            <PriorityBadge priority={c.priority} />
          </div>
        </div>

        {/* Meta tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            background: 'var(--accent-light)', color: 'var(--accent)',
            borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600
          }}>
            {c.category}
          </span>
          {c.assignedTo && (
            <span style={{
              background: 'var(--status-progress-bg)', color: 'var(--status-progress-text)',
              borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600
            }}>
              {c.assignedTo}
            </span>
          )}
          <span style={{
            background: 'var(--bg)', color: 'var(--text-muted)',
            borderRadius: 20, padding: '3px 10px', fontSize: 12
          }}>
            {c.studentName}{c.rollNo ? ` — ${c.rollNo}` : ''}
          </span>
        </div>

        {/* Description */}
        <div style={{
          background: 'var(--bg)', borderRadius: 10,
          padding: '14px 16px', marginBottom: 14
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Description
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)' }}>
            {c.description}
          </div>
        </div>

        {/* Attached image */}
        {c.image && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Attached Image
            </div>
            <img
              src={`${process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"}${c.image}`}
              alt="attachment"
              style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>
        )}

        {/* Official admin response — shown to everyone including students */}
        {c.adminResponse && (
          <div style={{
            background: 'var(--status-progress-bg)', borderRadius: 10,
            padding: '12px 16px', marginBottom: 10,
            borderLeft: '3px solid var(--status-progress-text)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-progress-text)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Response
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{c.adminResponse}</div>
          </div>
        )}

        {/* Department remarks — internal, hidden from students */}
        {!isStudent && c.departmentRemarks && (
          <div style={{
            background: '#F3F0FD', borderRadius: 10,
            padding: '12px 16px', borderLeft: '3px solid #7C3AED'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Department Remarks
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{c.departmentRemarks}</div>
          </div>
        )}
      </div>

      {/* conversation - hidden from students */}
      {!isStudent && c.replies?.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 22px',
          marginBottom: 14
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
            Conversation ({c.replies.length})
          </div>

          {c.replies.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex', gap: 12,
                marginBottom: i < c.replies.length - 1 ? 16 : 0
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: r.authorRole === 'admin'
                  ? 'var(--status-progress-text)' : '#7C3AED',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff'
              }}>
                {r.authorName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  marginBottom: 5, flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {r.authorName}
                  </span>
                  <span style={{
                    fontSize: 11, borderRadius: 20, padding: '2px 8px',
                    fontWeight: 600, textTransform: 'capitalize',
                    background: r.authorRole === 'admin'
                      ? 'var(--status-progress-bg)' : '#F3F0FD',
                    color: r.authorRole === 'admin'
                      ? 'var(--status-progress-text)' : '#7C3AED'
                  }}>
                    {r.authorRole}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-light)', marginLeft: 'auto' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{
                  background: 'var(--bg)', borderRadius: 10,
                  padding: '10px 13px', fontSize: 14,
                  lineHeight: 1.6, color: 'var(--text)'
                }}>
                  {r.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* admin actions */}
      {isAdmin && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '22px 24px', marginBottom: 14
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            Admin Actions
          </div>

          {/* Assign to department */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Assign to Department</label>
            <select
              style={{ ...fieldInput, appearance: 'none' }}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Update Status</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => (
                <StatusPill
                  key={s} s={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                />
              ))}
            </div>
          </div>

          {/* Response to student */}
          <div style={{ marginBottom: 20 }}>
            <label style={fieldLabel}>Response to Student</label>
            <textarea
              style={{ ...fieldInput, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Write your official response visible to the student..."
              value={adminRes}
              onChange={(e) => setAdminRes(e.target.value)}
            />
          </div>

          <button
            onClick={handleAdminSave}
            disabled={saving}
            style={{
              background: saving ? '#ccc' : 'var(--accent)',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '9px 20px', fontWeight: 700, fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer', marginBottom: 20
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Internal reply to department */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label style={fieldLabel}>Send a Reply</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={replyInputRef}
                style={{ ...fieldInput, flex: 1 }}
                placeholder="Send a message to the department..."
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={!replyMsg.trim() || saving}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 18px', fontWeight: 700,
                  fontSize: 13, flexShrink: 0,
                  opacity: (!replyMsg.trim() || saving) ? 0.5 : 1,
                  cursor: (!replyMsg.trim() || saving) ? 'not-allowed' : 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* department actions */}
      {isDepartment && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '22px 24px', marginBottom: 14
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            Department Actions
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Update Status</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Pending', 'In Progress', 'Resolved'].map((s) => (
                <StatusPill
                  key={s} s={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                />
              ))}
            </div>
          </div>

          {/* Department remarks — internal, not seen by students */}
          <div style={{ marginBottom: 20 }}>
            <label style={fieldLabel}>Progress Remarks</label>
            <textarea
              style={{ ...fieldInput, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Add internal progress notes or remarks (not visible to student)..."
              value={deptRemarks}
              onChange={(e) => setDeptRemarks(e.target.value)}
            />
          </div>

          <button
            onClick={handleDeptSave}
            disabled={saving}
            style={{
              background: saving ? '#ccc' : '#5B3ACD',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '9px 20px', fontWeight: 700, fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer', marginBottom: 20
            }}
          >
            {saving ? 'Saving...' : 'Update Progress'}
          </button>

          {/* Internal reply to admin */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label style={fieldLabel}>Send a Reply</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...fieldInput, flex: 1 }}
                placeholder="Send a message to admin..."
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={!replyMsg.trim() || saving}
                style={{
                  background: '#5B3ACD', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 18px', fontWeight: 700,
                  fontSize: 13, flexShrink: 0,
                  opacity: (!replyMsg.trim() || saving) ? 0.5 : 1,
                  cursor: (!replyMsg.trim() || saving) ? 'not-allowed' : 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
