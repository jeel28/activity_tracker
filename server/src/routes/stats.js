const router = require('express').Router();
const prisma = require('../prisma');

// GET monthly stats
router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const from = `${year}-${month.padStart(2,'0')}-01`;
    const to   = `${year}-${month.padStart(2,'0')}-31`;

    const logs = await prisma.taskLog.findMany({
      where: { date: { gte: from, lte: to } },
      include: { task: true },
    });

    const tasks = await prisma.task.findMany({ where: { active: true } });
    const totalTasks = tasks.length;

    // Group logs by date
    const byDate = {};
    logs.forEach(log => {
      if (!byDate[log.date]) byDate[log.date] = [];
      byDate[log.date].push(log);
    });

    // Per-day stats
    const days = [];
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    let totalPts = 0, activeDays = 0, streak = 0, bestStreak = 0, cur = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${month.padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayLogs = byDate[dateKey] || [];
      const doneLogs = dayLogs.filter(l => l.done);
      const pts = doneLogs.reduce((s, l) => s + l.task.points, 0);
      const pct = totalTasks ? Math.round(doneLogs.length / totalTasks * 100) : 0;
      totalPts += pts;
      if (doneLogs.length > 0) { activeDays++; cur++; }
      else { bestStreak = Math.max(bestStreak, cur); cur = 0; }
      days.push({ date: dateKey, pts, pct, done: doneLogs.length, total: totalTasks });
    }
    bestStreak = Math.max(bestStreak, cur);

    // Per-task stats
    const taskStats = tasks.map(t => {
      const taskLogs = logs.filter(l => l.taskId === t.id && l.done);
      return {
        id: t.id, name: t.name, icon: t.icon, points: t.points,
        doneCount: taskLogs.length,
        totalPts: taskLogs.length * t.points,
        pct: Math.round(taskLogs.length / daysInMonth * 100),
      };
    });

    const avgPct = activeDays
      ? Math.round(days.filter(d => d.done > 0).reduce((s, d) => s + d.pct, 0) / activeDays)
      : 0;

    res.json({ totalPts, activeDays, bestStreak, avgPct, days, taskStats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
