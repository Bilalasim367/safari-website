import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const products = await prisma.product.findMany({
    select: { name: true, gender: true, type: true, categorySlug: true, isActive: true, inStock: true },
    take: 20,
  });
  console.log('Sample products:');
  products.forEach(p => console.log(JSON.stringify(p)));
  await prisma.$disconnect();
}
check();