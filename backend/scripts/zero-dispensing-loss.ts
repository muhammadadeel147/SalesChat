/**
 * One-time cleanup after switching from per-sale dispensing loss to cylinder close-out.
 * Zeros dispensing_loss_percent on all products.
 *
 * Usage: npx tsx scripts/zero-dispensing-loss.ts
 */
import { prisma } from '../src/modules/core/prisma.js';

async function main() {
  const result = await prisma.product.updateMany({
    where: { dispensingLossPercent: { not: 0 } },
    data: { dispensingLossPercent: 0 },
  });
  console.log(`Zeroed dispensing_loss_percent on ${result.count} product(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
