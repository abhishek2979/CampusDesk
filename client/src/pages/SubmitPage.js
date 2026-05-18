import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Hostel', 'Sports Complex', 'Library', 'Department', 'Faculty', 'Academic Issues'];

export default function SubmitPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Hostel', priority: 'Medium'
  });
  const [image,   setImage]   = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      return toast.error('Title and description are required.');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      await api.post('/complaints', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Complaint submitted successfully.');
      nav('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--text)', marginBottom: 6
  };
  const sectionStyle = { marginBottom: 18 };

  return (
    <div className="fade-up" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => nav(-1)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px',
            fontSize: 13, fontWeight: 500, color: 'var(--text)'
          }}
        >
          Back
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Submit a Complaint</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>All fields marked are required</div>
        </div>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 26px'
      }}>
        <form onSubmit={handleSubmit}>

          {/* Category */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: form.category === cat ? 700 : 400,
                    background: form.category === cat ? 'var(--accent-light)' : 'var(--bg)',
                    color: form.category === cat ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1.5px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Priority</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: 'Low',    bg: 'var(--status-resolved-bg)',  col: 'var(--status-resolved-text)' },
                { v: 'Medium', bg: 'var(--status-pending-bg)',   col: 'var(--status-pending-text)'  },
                { v: 'High',   bg: 'var(--status-rejected-bg)',  col: 'var(--status-rejected-text)' }
              ].map((p) => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => set('priority', p.v)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: form.priority === p.v ? 700 : 400,
                    background: form.priority === p.v ? p.bg : 'var(--bg)',
                    color: form.priority === p.v ? p.col : 'var(--text-muted)',
                    border: `1.5px solid ${form.priority === p.v ? p.col : 'var(--border)'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  {p.v}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Title</label>
            <input
              className="field-input"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={120}
              required
            />
            <div style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'right', marginTop: 4 }}>
              {form.title.length} / 120
            </div>
          </div>

          {/* Description */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              className="field-input"
              placeholder="Provide full details — dates, location, what happened, and what resolution you expect."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              maxLength={1000}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
              required
            />
            <div style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'right', marginTop: 4 }}>
              {form.description.length} / 1000
            </div>
          </div>

          {/* Image upload */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Attach Image (optional)</label>
            <label style={{
              display: 'block',
              background: 'var(--bg)',
              border: '1.5px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setImage(e.target.files[0])}
              />
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {image ? image.name : 'Click to upload an image (max 5 MB)'}
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#ccc' : 'var(--accent)',
                color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 24px',
                fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button
              type="button"
              onClick={() => nav(-1)}
              style={{
                background: 'var(--bg)', color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 20px',
                fontWeight: 600, fontSize: 14
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
