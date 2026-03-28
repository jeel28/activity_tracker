require('dotenv').config();
const prisma = require('./prisma');

async function main() {
  const existing = await prisma.task.count();
  if (existing > 0) { console.log('Already seeded.'); return; }

  await prisma.task.createMany({
    data: [
      { name: 'Morning exercise',    icon: 'exercise',  points: 10, order: 1 },
      { name: 'Read for 30 min',     icon: 'reading',   points: 8,  order: 2 },
      { name: 'Meditation',          icon: 'meditation',points: 5,  order: 3 },
      { name: 'Study / learning',    icon: 'study',     points: 12, order: 4 },
      { name: 'Complete work tasks', icon: 'work',      points: 15, order: 5 },
    ],
  });
  console.log('Seeded default tasks!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
