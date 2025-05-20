import dotenv from 'dotenv';
dotenv.config({ path: './../.env' }); // <-- load your env vars here

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Irisa@123', 10);

  await prisma.user.upsert({
    where: { email: 'irisarolande25@gmail.com' },
    update: {},
    create: {
      email: 'irisarolande25@gmail.com',
      name: 'ADMIN',
      password: hashedPassword,
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.user.upsert({
    where: { email: 'irisarolande125@gmail.com' },
    update: {},
    create: {
      email: 'irisarolande125@gmail.com',
      name: 'Irisa',
      password: hashedPassword,
      role: 'USER',
      verificationStatus: 'VERIFIED',
    },
  });

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
