const router = require('express').Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(todos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { text, priority, dueDate } = req.body;
    const todo = await prisma.todo.create({
      data: { text, priority: priority || 'medium', dueDate: dueDate || null },
    });
    res.json(todo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { text, priority, dueDate, done } = req.body;
    const todo = await prisma.todo.update({
      where: { id: Number(req.params.id) },
      data: { text, priority, dueDate, done },
    });
    res.json(todo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.todo.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
