/**
 * One-time repair: sales that ran before batch-sale code was loaded deducted
 * products.stock_quantity but not batches.remaining_quantity. Align open batches
 * (oldest first) down so sum(remaining) == product.stock_quantity.
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { trackType: 'BATCH', deletedAt: null, trackStock: true },
    include: {
      batches: {
        where: { status: 'OPEN' },
        orderBy: [{ purchaseDate: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  for (const product of products) {
    const stock = new Prisma.Decimal(product.stockQuantity);
    let batchSum = product.batches.reduce(
      (s, b) => s.plus(b.remainingQuantity),
      new Prisma.Decimal(0),
    );

    if (batchSum.eq(stock)) {
      console.log(`OK  ${product.name}: stock=${stock} batches=${batchSum}`);
      continue;
    }

    if (batchSum.lt(stock)) {
      console.log(
        `WARN ${product.name}: stock=${stock} > open batches=${batchSum} (manual receive/adjust needed)`,
      );
      continue;
    }

    let toRemove = batchSum.minus(stock);
    console.log(
      `FIX ${product.name}: stock=${stock} batches=${batchSum} → trim ${toRemove}`,
    );

    for (const batch of product.batches) {
      if (toRemove.lte(0)) break;
      const take = Prisma.Decimal.min(batch.remainingQuantity, toRemove);
      const next = batch.remainingQuantity.minus(take);
      const closeTol = new Prisma.Decimal('0.1');
      const closed = next.lte(closeTol);
      await prisma.batch.update({
        where: { id: batch.id },
        data: {
          remainingQuantity: closed ? new Prisma.Decimal(0) : next,
          status: closed ? 'CLOSED' : 'OPEN',
        },
      });
      console.log(
        `  batch ${batch.id.slice(0, 8)}… ${batch.remainingQuantity} → ${closed ? 0 : next}${closed ? ' CLOSED' : ''}`,
      );
      toRemove = toRemove.minus(take);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
