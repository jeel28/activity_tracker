const router = require('express').Router();
const prisma = require('../prisma');

// GET all active tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET all tasks including inactive (for manage screen)
router.get('/all', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { order: 'asc' } });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create task
router.post('/', async (req, res) => {
  try {
    const { name, icon, points, order } = req.body;
    const task = await prisma.task.create({
      data: { name, icon: icon || 'habit', points: points || 5, order: order || 0 },
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, points, active, order } = req.body;
    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: { name, icon, points, active, order },
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
