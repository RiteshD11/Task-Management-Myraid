'use client';

import { useState } from 'react';
import { Pencil, Trash2, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STATUS_ICONS = {
  pending: <Circle size={12} />,
  'in-progress': <Loader2 size={12} />,
  completed: <CheckCircle2 size={12} />,
};

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export default function TaskCard({ task, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    await onDelete(task._id);
    setDeleting(false);
  };

  const createdAt = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="card animate-fade-up" style={{ padding: '18px 20px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, flex: 1 }}>
          {task.title}
        </h3>
        <span className={`badge badge-${task.status}`}>
          {STATUS_ICONS[task.status]} {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
          <Clock size={11} />
          <span>{createdAt}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => onEdit(task)} className="btn-ghost"
            style={{ padding: '5px 10px', fontSize: 12, gap: 4 }}>
            <Pencil size={12} /> Edit
          </button>
          <button onClick={handleDelete} className="btn-danger" disabled={deleting}>
            {deleting ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={12} />}
            {deleting ? '' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
