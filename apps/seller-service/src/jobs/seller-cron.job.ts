import prisma from "@packages/libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    
    // Find sellers and shops ready for permanent deletion
    const sellersToDelete = await prisma.sellers.findMany({
      where: { 
        isDeleted: true,
        deletedAt: { lte: now }
      },
      include: { shop: true }
    });

    for (const seller of sellersToDelete) {
      try {
        await prisma.$transaction(async (tx) => {
          // Delete dependent records first
          if (seller.shop) {
            // Delete shop products
            await tx.products.deleteMany({
              where: { shopId: seller.shop.id }
            });

            // Delete shop followers
            await tx.followers.deleteMany({
              where: { shopsId: seller.shop.id }
            });

            // Delete the shop
            await tx.shops.delete({
              where: { id: seller.shop.id }
            });
          }

          // Finally delete the seller
          await tx.sellers.delete({
            where: { id: seller.id }
          });
        });
        console.log(`Permanently deleted seller ${seller.id} and associated data`);
      } catch (txError) {
        console.error(`Transaction failed for seller ${seller.id}:`, txError);
      }
    }
  } catch (error) {
    console.error("Error in seller deletion cron job:", error);
  }
});