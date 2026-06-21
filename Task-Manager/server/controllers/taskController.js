// File: server/controllers/taskController.js
// Purpose: Implement task CRUD and lifecycle (start, hold, resume, stop)

const pool = require('../config/db');

// Helper to fetch single task
async function fetchTask(id) {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
  return rows[0];
}

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json({ tasks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// POST /api/tasks
// If start_time and end_time provided -> manual entry (creates a Completed task)
// Else creates a Pending task. expected_minutes is optional (integer minutes).
exports.createTask = async (req, res) => {
  try {
    const { task_name, comments, expected_minutes, start_time, end_time } = req.body;
    if (!task_name) {
      return res.status(400).json({ error: 'Task name is required' });
    }

    let expected_seconds = 0;
    if (expected_minutes) {
      expected_seconds = parseInt(expected_minutes, 10) * 60;
    }

    if (start_time && end_time) {
      // manual entry: parse times and compute seconds
      const start = new Date(start_time);
      const end = new Date(end_time);
      if (isNaN(start) || isNaN(end) || end <= start) {
        return res.status(400).json({ error: 'Invalid start or end time' });
      }
      const durationSec = Math.floor((end - start) / 1000);
      const [result] = await pool.query(
        'INSERT INTO tasks (task_name, comments, expected_seconds, status, total_work_seconds, is_manual, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [task_name, comments || '', expected_seconds, 'Completed', durationSec, 1, start]
      );
      const task = await fetchTask(result.insertId);
      return res.json({ task });
    }

    // Normal create: Pending
    const [result] = await pool.query(
      'INSERT INTO tasks (task_name, comments, expected_seconds) VALUES (?, ?, ?)',
      [task_name, comments || '', expected_seconds]
    );
    const task = await fetchTask(result.insertId);
    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// PUT /api/tasks/:id/start
exports.startTask = async (req, res) => {
  const id = req.params.id;
  try {
    // ensure task exists
    const task = await fetchTask(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // check another task in progress
    const [running] = await pool.query('SELECT id FROM tasks WHERE status = ? AND id != ? LIMIT 1', ['In Progress', id]);
    if (running.length > 0) {
      return res.status(400).json({ error: 'Another task is already in progress' });
    }

    // set last_started_at to now and status to In Progress
    await pool.query('UPDATE tasks SET status = ?, last_started_at = NOW() WHERE id = ?', ['In Progress', id]);
    const updated = await fetchTask(id);
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start task' });
  }
};

// PUT /api/tasks/:id/hold
exports.holdTask = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await fetchTask(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.status !== 'In Progress' || !task.last_started_at) {
      return res.status(400).json({ error: 'Task is not running' });
    }

    // compute worked seconds since last_started_at
    const [rows] = await pool.query('SELECT TIMESTAMPDIFF(SECOND, ?, NOW()) AS secs', [task.last_started_at]);
    const secs = rows[0].secs || 0;

    await pool.query('UPDATE tasks SET total_work_seconds = total_work_seconds + ?, last_started_at = NULL, status = ? WHERE id = ?', [secs, 'Paused', id]);
    const updated = await fetchTask(id);
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to hold task' });
  }
};

// PUT /api/tasks/:id/resume
exports.resumeTask = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await fetchTask(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // check another task in progress
    const [running] = await pool.query('SELECT id FROM tasks WHERE status = ? AND id != ? LIMIT 1', ['In Progress', id]);
    if (running.length > 0) {
      return res.status(400).json({ error: 'Another task is already in progress' });
    }

    await pool.query('UPDATE tasks SET last_started_at = NOW(), status = ? WHERE id = ?', ['In Progress', id]);
    const updated = await fetchTask(id);
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resume task' });
  }
};

// PUT /api/tasks/:id/stop
exports.stopTask = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await fetchTask(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.status === 'In Progress' && task.last_started_at) {
      const [rows] = await pool.query('SELECT TIMESTAMPDIFF(SECOND, ?, NOW()) AS secs', [task.last_started_at]);
      const secs = rows[0].secs || 0;
      await pool.query('UPDATE tasks SET total_work_seconds = total_work_seconds + ?, last_started_at = NULL, status = ? WHERE id = ?', [secs, 'Completed', id]);
    } else {
      // if paused or pending, just mark completed
      await pool.query('UPDATE tasks SET status = ?, last_started_at = NULL WHERE id = ?', ['Completed', id]);
    }

    const updated = await fetchTask(id);
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to stop task' });
  }
};

// PUT /api/tasks/:id - edit task_name and comments only
exports.updateTask = async (req, res) => {
  const id = req.params.id;
  try {
    const { task_name, comments } = req.body;
    if (!task_name) return res.status(400).json({ error: 'Task name is required' });

    await pool.query('UPDATE tasks SET task_name = ?, comments = ? WHERE id = ?', [task_name, comments || '', id]);
    const updated = await fetchTask(id);
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
