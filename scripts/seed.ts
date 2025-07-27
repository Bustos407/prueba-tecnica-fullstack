import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: '1',
        name: 'Administrador Demo',
        email: 'admin@example.com',
        emailVerified: true,
        role: 'ADMIN',
        phone: '+1234567890',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        id: '2',
        name: 'Usuario Demo 1',
        email: 'user1@example.com',
        emailVerified: true,
        role: 'USER',
        phone: '+0987654321',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        id: '3',
        name: 'Usuario Demo 2',
        email: 'user2@example.com',
        emailVerified: true,
        role: 'USER',
        phone: '+1122334455',
      },
    }),
  ]);

  console.log('✅ Usuarios creados:', users.length);

  // Crear transacciones de prueba
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        amount: 1500.0,
        concept: 'Salario mensual',
        type: 'INCOME',
        date: new Date('2024-01-15'),
        userId: '1',
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 250.0,
        concept: 'Supermercado',
        type: 'EXPENSE',
        date: new Date('2024-01-16'),
        userId: '1',
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 800.0,
        concept: 'Freelance proyecto',
        type: 'INCOME',
        date: new Date('2024-01-17'),
        userId: '2',
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 120.0,
        concept: 'Gasolina',
        type: 'EXPENSE',
        date: new Date('2024-01-18'),
        userId: '1',
      },
    }),
    prisma.transaction.create({
      data: {
        amount: 300.0,
        concept: 'Restaurante',
        type: 'EXPENSE',
        date: new Date('2024-01-19'),
        userId: '2',
      },
    }),
  ]);

  console.log('✅ Transacciones creadas:', transactions.length);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
