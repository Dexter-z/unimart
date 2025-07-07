import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient()

const initializeSiteConfig = async() => {
    try {
        const existingConfig = await prisma.site_config.findFirst();
        if(!existingConfig){
            await prisma.site_config.create({
                data: {
                    categories: [
                        "Books", 
                        "Gadgets", 
                        "Fashion", 
                        "Perfumes", 
                        "Kitchen utensils", 
                        "Electronics", 
                        "Bedroom essentials", 
                        "Food and pastries"
                    ],
                    subCategories: {
                        "Books": ["Fiction", "Non-Fiction", "Educational", "Comics"],
                        "Gadgets": ["Smartphones", "Laptops", "Tablets", "Accessories"],
                        "Fashion": ["Clothing", "Footwear", "Accessories", "Jewelry"],
                        "Perfumes": ["Oil", "Spray", "Roll-on", "Gift Sets"],
                        "Kitchen utensils": ["Pots", "Cutlery", "Plates", "Appliances", "Storage"],
                        "Electronics": ["Generators", "TVs", "Speakers", "Cameras", "Smart Home Devices"],
                        "Bedroom essentials": ["Mattress", "Bed Stand", "Laundry", "Cleaning", "Furniture", "Decor", "Lighting"],
                        "Food and pastries": ["Bread", "Cakes", "Snacks", "Beverages"]
                    }
                }
            })
        }
    } catch (error) {
        console.log("Error initializing site config: ", error);
    }
}

export default initializeSiteConfig;