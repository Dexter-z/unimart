import prisma from "@packages/libs/prisma"

export const updateUserAnalytics = async(event:any) => {
    try {
        console.log(`🔍 Starting updateUserAnalytics for userId: ${event.userId}, action: ${event.action}`);
        
        if (!event.userId) {
            console.warn('⚠️ No userId provided in event, skipping user analytics');
            return;
        }
        
        console.log("📊 Fetching existing user analytics data...");
        const existingData = await prisma.userAnalytics.findUnique({
            where: {
                userId: event.userId
            }
        });
        console.log("📊 Existing data result:", existingData ? "Found" : "Not found");

        let updatedActions:any = existingData?.actions || [];
        const actionExists = updatedActions.some((entry:any) => entry.productId === event.productId && event.action === event.action)

        //Always store product view frequency for recommendations
        if(event.action === "product_view"){
            updatedActions.push({
                productId: event?.productId,
                shopId: event?.shopId,
                action: "product_view",
                timestamp: new Date()
            })
        }
        else if(["add_to_cart", "add_to_wishlist"].includes(event.action) && !actionExists){
            updatedActions.push({
                productId: event?.productId,
                shopId: event?.shopId,
                action: event?.action,
                timestamp: new Date()
            })
        }

        //Remove add to cart when remove from cart is triggered
        else if (event.action === "remove_from_cart"){
            updatedActions = updatedActions.filter(
                (entry:any) => 
                    !(
                        entry.productId === event?.productId &&
                        entry.action === "add_to_cart"
                    )
            )
        }

        //Remove add to wishlist when remove from wishlist is triggered
        else if (event.action === "remove_from_wishlist"){
            updatedActions = updatedActions.filter(
                (entry:any) => 
                    !(
                        entry.productId === event?.productId &&
                        entry.action === "add_to_wishlist"
                    )
            )
        }

        //Keep only the last 100 actions to free storage
        if(updatedActions.length > 100){
            updatedActions = updatedActions.shift()
        }

        const extraFields: Record<string, any> = {}

        if(event.country){
            extraFields.country = event.country
        }

        if(event.city){
            extraFields.city = event.city
        }

        if(event.device){
            extraFields.device = event.device
        }

        console.log("💾 About to upsert user analytics...");
        console.log("📋 Actions to save:", updatedActions.length);
        console.log("📋 Extra fields:", extraFields);
        
        //update or create analytics data
        const userResult = await prisma.userAnalytics.upsert({
            where: {userId: event.userId},
            update: {
                lastVisited: new Date(),
                actions: updatedActions,
                ...extraFields
            },
            create: {
                userId: event?.userId,
                lastVisited: new Date(),
                actions: updatedActions,
                ...extraFields
            }
        });
        
        console.log("✅ User analytics upserted successfully, ID:", userResult.id);

        console.log("🔄 Now updating product analytics...");
        //Update product analytics
        await updateProductAnalytics(event);
        console.log("✅ Product analytics completed");

    } catch (error: any) {
        console.error("❌ Error in updateUserAnalytics:", error?.message || error);
        console.error("📋 Full error:", error);
        throw error; // Re-throw so the main service can see the error
    }
}

//Update product analytics
export const updateProductAnalytics = async(event:any) => {
    try {
        console.log(`🔍 Starting updateProductAnalytics for productId: ${event.productId}, action: ${event.action}`);
        
        if (!event.productId){
            console.log("⚠️ No productId provided, skipping product analytics");
            return;
        }

        const updateFields: any = {};

        if(event.action === "product_view"){
            updateFields.views = {
                increment: 1
            }
        }

        if(event.action === "add_to_cart"){
            updateFields.cartAdds = {
                increment: 1
            }
        }

        if(event.action === "remove_from_cart"){
            updateFields.cartAdds = {
                decrement: 1
            }
        }

        if(event.action === "add_to_wishlist"){
            updateFields.wishlistAdds = {
                increment: 1
            }
        }

        if(event.action === "remove_from_wishlist"){
            updateFields.wishlistAdds = {
                decrement: 1
            }
        }

        if(event.action === "purchase"){
            updateFields.purchases = {
                increment: 1
            }
        }

        console.log("💾 About to upsert product analytics...");
        console.log("📋 Update fields:", updateFields);

        //Update or create the product analytics asynchronously
        const productResult = await prisma.productAnalytics.upsert({
            where: {productId: event.productId},
            update: {
                lastViewedAt: new Date(),
                ...updateFields
            },
            create: {
                productId: event.productId,
                shopId: event.shopId || null,
                views: event.action === "product_view" ? 1 : 0,
                cartAdds: event.action === "add_to_cart" ? 1 : 0,
                wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
                purchases: event.action === "purchase" ? 1 : 0,
                lastViewedAt: new Date()
            }
        });
        
        console.log("✅ Product analytics upserted successfully, ID:", productResult.id);

    } catch (error: any) {
        console.error("❌ Error in updateProductAnalytics:", error?.message || error);
        console.error("📋 Full error:", error);
        throw error; // Re-throw so the main service can see the error
    }
}