// Teste de tipagem do Prisma para where com filtro insensitivo
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const q = 'teste';
  const barbers = await prisma.barber.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { cpf: { contains: q, mode: 'insensitive' } },
      ],
    },
  });
  console.log(barbers);
}

test();
