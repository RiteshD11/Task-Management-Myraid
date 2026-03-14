const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  taskValidation,
  taskUpdateValidation,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes protected
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(taskValidation, validate, createTask);

router.route('/:id')
  .get(getTask)
  .put(taskUpdateValidation, validate, updateTask)
  .delete(deleteTask);

module.exports = router;
