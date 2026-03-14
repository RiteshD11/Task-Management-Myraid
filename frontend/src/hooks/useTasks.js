'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/tasks', { params });
      setTasks(data.tasks);
      setPagination(data.pagination);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    const { data } = await api.post('/api/tasks', taskData);
    toast.success('Task created!');
    return data.task;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await api.put(`/api/tasks/${id}`, taskData);
    toast.success('Task updated!');
    return data.task;
  };

  const deleteTask = async (id) => {
    await api.delete(`/api/tasks/${id}`);
    toast.success('Task deleted');
  };

  return { tasks, pagination, loading, fetchTasks, createTask, updateTask, deleteTask };
}
