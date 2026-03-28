const router = require('express').Router();
const prisma = require('../prisma');

router.get('/:date', async (req, res) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { date: req.params.date },
      orderBy: { time: 'asc' },
    });
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all events for a month
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const from = `${year}-${month.padStart(2,'0')}-01`;
    const to   = `${year}-${month.padStart(2,'0')}-31`;
    const events = await prisma.calendarEvent.findMany({
      where: { date: { gte: from, lte: to } },
    });
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, text, time } = req.body;
    const event = await prisma.calendarEvent.create({
      data: { date, text, time: time || null },
    });
    res.json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.calendarEvent.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
