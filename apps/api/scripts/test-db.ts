import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  for (let i = 0; i < 5; i++) {
    try {
      const user = await prisma.user.findUnique({ where: { email: 'demo@cherry-up.com' } });
      console.log(`attempt ${i + 1}:`, user ? user.email : 'null');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      console.log(`attempt ${i + 1}: ERR`, e.code, e.message?.slice(0, 200));
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
