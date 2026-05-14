const STATUS_STYLES = {
  'Pending':     { background: 'var(--status-pending-bg)',   color: 'var(--status-pending-text)'   },
  'In Progress': { background: 'var(--status-progress-bg)',  color: 'var(--status-progress-text)'  },
  'Resolved':    { background: 'var(--status-resolved-bg)',  color: 'var(--status-resolved-text)'  },
  'Rejected':    { background: 'var(--status-rejected-bg)',  color: 'var(--status-rejected-text)'  }
};

const PRIORITY_STYLES = {
  'High':   { background: '#FCE8E8', color: '#A02020' },
  'Medium': { background: '#FFF6E0', color: '#7A5500' },
  'Low':    { background: '#E6F4ED', color: '#1A6E3C' }
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { background: '#f0f0f0', color: '#666' };
  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || {};
  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      display: 'inline-block'
    }}>
      {priority}
    </span>
  );
}
