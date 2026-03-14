'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, description: task.description || '', status: task.status });
    } else {
      setForm({ title: '', description: '', status: 'pending' });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

      {/* Modal */}
      <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 480, position: 'relative', padding: 28, zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-subtle)', display: 'block', marginBottom: 6 }}>
              Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="input" type="text" placeholder="Task title..." value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={100} autoFocus />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-subtle)', display: 'block', marginBottom: 6 }}>
              Description
            </label>
            <textarea className="input" placeholder="Optional description..." value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} maxLength={1000} style={{ resize: 'vertical', minHeight: 80 }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-subtle)', display: 'block', marginBottom: 6 }}>
              Status
            </label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : <><Save size={14} /> {task ? 'Update' : 'Create'} Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
