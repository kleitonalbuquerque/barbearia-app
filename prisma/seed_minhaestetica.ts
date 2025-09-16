import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Cria o tenant 'minhaestetica' se não existir
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'minhaestetica' },
    update: {},
    create: {
      name: 'Minha Estética',
      subdomain: 'minhaestetica',
      businessType: 'Estética',
      branding: {},
    },
  });
  console.log('Tenant:', tenant);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
