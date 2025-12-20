const express = require('express');
const router = express.Router();
const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  generateExpiringContractTodos
} = require('../controllers/todoController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.post('/generate-expiring', generateExpiringContractTodos);

router.route('/:id')
  .get(getTodo)
  .put(updateTodo)
  .delete(deleteTodo);

router.put('/:id/complete', completeTodo);

module.exports = router;
