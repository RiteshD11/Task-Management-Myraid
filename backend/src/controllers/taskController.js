const { body, query } = require('express-validator');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');
const { encryptFields, decryptFields } = require('../utils/encryption');

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
];

const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
];

// Helper: decrypt task for response
const formatTask = (task) => {
  const obj = task.toObject ? task.toObject() : task;
  return decryptFields(obj, ['description']);
};

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter — strict user ownership
    const filter = { user: req.user._id };

    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      // Case-insensitive title search (no full-text index required)
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(filter),
    ]);

    const formattedTasks = tasks.map((t) => decryptFields(t, ['description']));

    return sendSuccess(res, 200, 'Tasks fetched', {
      tasks: formattedTasks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTasks: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }
    return sendSuccess(res, 200, 'Task fetched', { task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Encrypt description before storing
    const encryptedData = encryptFields({ title, description: description || '', status }, ['description']);

    const task = await Task.create({
      title: encryptedData.title,
      description: encryptedData.description,
      status: encryptedData.status || 'pending',
      user: req.user._id,
    });

    return sendSuccess(res, 201, 'Task created', { task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Only update provided fields
    if (title !== undefined) task.title = title;
    if (status !== undefined) task.status = status;
    if (description !== undefined) {
      // Encrypt updated description
      const encrypted = encryptFields({ description }, ['description']);
      task.description = encrypted.description;
    }

    await task.save();
    return sendSuccess(res, 200, 'Task updated', { task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }
    return sendSuccess(res, 200, 'Task deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  taskValidation,
  taskUpdateValidation,
};
