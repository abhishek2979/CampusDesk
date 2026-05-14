import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './Badge';

const STATUS_ACCENT = {
  'Pending':     'var(--status-pending-text)',
  'In Progress': 'var(--status-progress-text)',
  'Resolved':    'var(--status-resolved-text)',
  'Rejected':    'var(--status-rejected-text)'
};

export default function ComplaintCard({ complaint, showStudent = false }) {
  const nav = useNavigate();
  const c   = complaint;
  const date = new Date(c.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div
      onClick={() => nav(`/complaints/${c._id}`)}
      className="fade-up"
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${STATUS_ACCENT[c.status] || 'var(--border)'}`,
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', flex: 1, minWidth: 0 }}>
          {c.title}
        </div>
        {/* Badges — stacked on mobile via className */}
        <div className="complaint-badges" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
          <StatusBadge   status={c.status} />
          <PriorityBadge priority={c.priority} />
        </div>
      </div>

      {/* Student info */}
      {showStudent && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          {c.studentName}{c.rollNo ? ` — ${c.rollNo}` : ''}
        </div>
      )}

      {/* Description preview */}
      <div style={{
        fontSize: 13, color: 'var(--text-muted)', marginBottom: 8,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>
        {c.description}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-light)' }}>
        <span>{c.category}</span>
        <span>{c.complaintId}</span>
        <span>{date}</span>
        {c.assignedTo && <span>Assigned: {c.assignedTo}</span>}
      </div>
    </div>
  );
}
