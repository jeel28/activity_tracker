const router = require('express').Router();
const prisma = require('../prisma');

// GET logs for a specific date
router.get('/:date', async (req, res) => {
  try {
    const logs = await prisma.taskLog.findMany({
      where: { date: req.params.date },
      include: { task: true },
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET logs for a date range (for monthly review)
router.get('/range/:from/:to', async (req, res) => {
  try {
    const logs = await prisma.taskLog.findMany({
      where: {
        date: { gte: req.params.from, lte: req.params.to },
        done: true,
      },
      include: { task: true },
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST toggle a task log for a date
router.post('/toggle', async (req, res) => {
  try {
    const { taskId, date } = req.body;
    const existing = await prisma.taskLog.findUnique({
      where: { taskId_date: { taskId: Number(taskId), date } },
    });
    let log;
    if (existing) {
      log = await prisma.taskLog.update({
        where: { taskId_date: { taskId: Number(taskId), date } },
        data: { done: !existing.done },
      });
    } else {
      log = await prisma.taskLog.create({
        data: { taskId: Number(taskId), date, done: true },
      });
    }
    res.json(log);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
