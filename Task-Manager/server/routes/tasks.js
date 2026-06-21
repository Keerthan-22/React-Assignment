// File: server/routes/tasks.js
// Purpose: Define task-related routes and map them to controller functions

const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.get('/', controller.getTasks);
router.post('/', controller.createTask);

router.put('/:id/start', controller.startTask);
router.put('/:id/hold', controller.holdTask);
router.put('/:id/resume', controller.resumeTask);
router.put('/:id/stop', controller.stopTask);

router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
