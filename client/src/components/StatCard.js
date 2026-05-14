export function StatCard({ label, value, accent = false }) {
  return (
    <div style={{
      background: accent ? 'var(--accent)' : 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 22px',
      border: accent ? 'none' : '1px solid var(--border)',
      flex: 1,
      minWidth: 0
    }}>
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: accent ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
        letterSpacing: 0.5,
        marginBottom: 8,
        textTransform: 'uppercase'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 800,
        color: accent ? '#fff' : 'var(--text)',
        lineHeight: 1
      }}>
        {value}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ message = 'No records found.' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 14
    }}>
      {message}
    </div>
  );
}
