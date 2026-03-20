const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartlink.com' },
    update: {},
    create: {
      email: 'admin@smartlink.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });
  
  console.log('Admin user created/verified successfully.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
