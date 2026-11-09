import bcrypt from 'bcryptjs';
import { prisma } from '../server/prisma';

async function main() {
  const email = 'admin@serinediagnostics.com';
  const password = 'Admin@123';

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.staffUser.upsert({
    where: {
      email,
    },
    update: {
      passwordHash,
      firstName: 'Serine',
      lastName: 'Admin',
      role: 'ADMIN',
      active: true,
    },
    create: {
      email,
      passwordHash,
      firstName: 'Serine',
      lastName: 'Admin',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('✅ Admin account restored successfully!');
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);
}

main()
  .catch((error) => {
    console.error('❌ Failed to restore admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });