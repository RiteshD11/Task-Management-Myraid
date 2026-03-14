'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ClipboardList, Inbox } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, pagination, loading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(() => {
    fetchTasks({ page, limit: 9, search, status });
  }, [page, search, status, fetchTasks]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleSave = async (form) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, form);
      } else {
        await createTask(form);
      }
      setEditingTask(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    load();
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const stats = [
    { label: 'Total', value: pagination?.totalTasks ?? 0, color: 'var(--accent)' },
    { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'var(--text-muted)' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'var(--warning)' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'var(--success)' },
  ];

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Here's an overview of your tasks</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {stats.map((s) => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingLeft: 36, fontSize: 13 }} placeholder="Search tasks..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setStatus(f.value)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                    transition: 'all 0.15s',
                    background: status === f.value ? 'var(--accent)' : 'var(--bg-input)',
                    color: status === f.value ? 'white' : 'var(--text-subtle)',
                    border: `1px solid ${status === f.value ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            <button className="btn-primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>
              <Plus size={16} /> New Task
            </button>
          </div>

          {/* Task Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card" style={{ padding: 20, height: 130 }}>
                  <div style={{ height: 16, borderRadius: 4, background: 'var(--bg-input)', marginBottom: 10, width: '60%' }} />
                  <div style={{ height: 12, borderRadius: 4, background: 'var(--bg-input)', marginBottom: 6, width: '90%' }} />
                  <div style={{ height: 12, borderRadius: 4, background: 'var(--bg-input)', width: '70%' }} />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: 'center' }}>
              <Inbox size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No tasks found</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {search || status ? 'Try adjusting your filters' : 'Create your first task to get started'}
              </p>
              {!search && !status && (
                <button className="btn-primary" onClick={openCreate}><Plus size={15} /> Create task</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 28 }}>
              <button className="btn-ghost" onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}
                style={{ padding: '7px 12px', opacity: pagination.hasPrevPage ? 1 : 0.4 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page <strong style={{ color: 'var(--text)' }}>{pagination.currentPage}</strong> of{' '}
                <strong style={{ color: 'var(--text)' }}>{pagination.totalPages}</strong>
              </span>
              <button className="btn-ghost" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
                style={{ padding: '7px 12px', opacity: pagination.hasNextPage ? 1 : 0.4 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <TaskModal task={editingTask} onClose={closeModal} onSave={handleSave} />
      )}
    </ProtectedRoute>
  );
}
