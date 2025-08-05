import { ValidationError, NotFoundError, AuthError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import ImageKit from "imagekit";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst()

        if (!config) {
            return res.status(404).json({ message: "Categories not found" })
        }

        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories
        })
    } catch (error) {
        return next(error)
    }
}

//Create Discount Codes
export const createDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body

        const isDiscountCodeExists = await prisma.discount_codes.findUnique({
            where: {
                discountCode
            }
        })

        if (isDiscountCodeExists) {
            return next(
                new ValidationError("Discount Code already exists, Please use a new one")
            )
        }

        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId: req.seller.id,
            }
        })

        res.status(201).json({
            success: true,
            discount_code,
        })

    } catch (error) {
        return next(error)
    }
}

//Get DIscount Codes
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({
            where: {
                sellerId: req.seller.id
            }
        })

        res.status(201).json({
            success: true,
            discount_codes
        })

    } catch (error) {
        return next(error)
    }
}

export const getDiscountCodeByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params;
        const discount = await prisma.discount_codes.findUnique({
            where: {
                discountCode: code,
            },
        });

        if (!discount) {
            return next(new NotFoundError("Discount code not found"));
        }

        res.status(200).json({
            success: true,
            discount,
        });
    } catch (error) {
        next(error);
    }
};

//Delete Discount codes
export const deleteDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const sellerId = req.seller?.id

        const discountCode = await prisma.discount_codes.findUnique({
            where: { id },
            select: { id: true, sellerId: true }
        })

        if (!discountCode) {
            return next(new NotFoundError("Discount Code not found"))
        }

        if (discountCode.sellerId !== sellerId) {
            return next(new ValidationError("You are not authorized to delete this discount code"))
        }

        await prisma.discount_codes.delete({ where: { id } })

        return res.status(200).json({
            message: "Discount code deleted successfully"
        })

    } catch (error) {
        return next(error)
    }
}

//Upload image
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body
        // Extract mime type from base64 string
        const matches = fileName.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const extension = mimeType.split("/")[1];
        console.log('uploadProductImage:', { mimeType, extension, fileName: fileName.slice(0, 30) });
        const response = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.${extension}`,
            folder: "/products",
        })
        res.status(201).json({
            file_url: response.url,
            file_name: response.fileId,
        })
    } catch (error) {
        console.error('uploadProductImage error:', error);
        next(error)
    }
}

//Delete Image
export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body
        const response = await imagekit.deleteFile(fileId)

        res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        console.error('uploadProductImage error:', error);
        next(error)
    }
}

//Create Product
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            images = [],
            title,
            shortDescription,
            tags,
            warranty,
            slug,
            brand,
            colors = [],
            specifications = [],
            category,
            subCategory,
            cashOnDelivery,
            detailedDescription,
            videoUrl,
            regularPrice,
            salePrice,
            stock,
            sizes = [],
            discountCodes = []
        } = req.body;

        if (!title || !slug || !shortDescription || !detailedDescription || !category || !cashOnDelivery || !category || !salePrice || !stock) {
            return next(new ValidationError("Please fill all the required fields"));
        }

        if (!req.seller.id) {
            return next(new AuthError("Only Registered sellers can create products"))
        }

        const slugCheck = await prisma.products.findUnique({
            where: { slug }
        })

        if (slugCheck) {
            return next(new ValidationError("Slug already exists, Please use a new one"));
        }

        // Add logging for incoming images
        console.log('Received images:', images);
        // Validate images array
        if (!Array.isArray(images) || images.some(img => !img || !img.url || !img.fileId)) {
            console.error('Invalid images array:', images);
            return next(new ValidationError('Each image must have both url and fileId.'));
        }
        // Prepare images for Prisma create
        const imagesForCreate = images.map((img: { url: string, fileId: string }) => ({
            url: img.url,
            file_id: img.fileId
        }));
        console.log('Images for Prisma create:', imagesForCreate);
        let newProduct;
        try {
            newProduct = await prisma.products.create({
                data: {
                    shopId: req.seller?.shop?.id!,
                    images: {
                        create: imagesForCreate
                    },
                    title,
                    shortDescription,
                    tags: Array.isArray(tags) ? tags : tags.split(","),
                    warranty,
                    slug,
                    brand,
                    colors: colors || [],
                    specifications: specifications || {},
                    category,
                    subCategory,
                    cashOnDelivery,
                    detailedDescription,
                    videoUrl,
                    regularPrice: parseFloat(regularPrice),
                    salePrice: parseFloat(salePrice),
                    stock: parseInt(stock),
                    sizes: sizes || [],
                    discountCodes: discountCodes.map((codeId: string) => codeId),
                },
                // No include needed
            });
        } catch (prismaError) {
            console.error('Prisma create error:', prismaError);
            return next(new ValidationError('Failed to create product. See server logs for details.'));
        }

        res.status(201).json({
            success: true,
            newProduct
        })


    } catch (error) {
        next(error);
    }
}

//Get products
export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                shopId: req?.seller?.shop?.id,
            },
            include: {
                images: true,
            }
        })

        res.status(201).json({
            success: true,
            products
        })
    } catch (error) {
        next(error)
    }
}

//Delete Products
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        });

        if (!product) {
            return next(new ValidationError("Product not found"));
        }
        if (product.shopId !== sellerId) {
            return next(new ValidationError("You are not authorized to delete this product"));
        }

        if (product.isDeleted) {
            return next(new ValidationError("Product is already deleted"));
        }

        const deletedProduct = await prisma.products.update({
            where: { id: productId },
            data: {
                isDeleted: true,
                deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Set deletedAt to 24 hours from now
            }
        })

        return res.status(200).json({
            message: "Product will be deleted permanently in 24 hours, You can restore it within this time",
            deletedAt: deletedProduct.deletedAt
        });

    } catch (error) {
        return next(error);
    }
}

//Restore Product
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        });

        if (!product) {
            return next(new ValidationError("Product not found"));
        }
        if (product.shopId !== sellerId) {
            return next(new ValidationError("You are not authorized to delete this product"));
        }
        // Check if the product is in a deleted state
        if (!product.isDeleted) {
            return next(new ValidationError("Product is not in a temporarily deleted state"));
        }

        await prisma.products.update({
            where: { id: productId },
            data: {
                isDeleted: false, // Restore the product,
                deletedAt: null
            }
        })

        return res.status(200).json({
            message: "Product Successfully Restored",
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while restoring the product",
        })
    }
}

//Get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const type = req.query.type;

        const baseFilter = {
            OR: [{
                startingDate: null,
            }, {
                endingDate: null,
            }
            ]
        }

        const orderBy: Prisma.productsOrderByWithRelationInput = type === "latest" ? { createdAt: "desc" as Prisma.SortOrder } : { totalSales: "desc" as Prisma.SortOrder }

        const [products, total, top10Products] = await Promise.all([
            prisma.products.findMany({
                skip,
                take: limit,
                include: {
                    images: true,
                    Shop: true,
                },
                where: baseFilter,
                orderBy: {
                    totalSales: "desc",
                },
            }),

            prisma.products.count({ where: baseFilter }),
            prisma.products.findMany({
                take: 10,
                where: baseFilter,
                orderBy,
            })
        ])

        res.status(200).json({
            products,
            top10By: type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        next(error)
    }
}

// Search Products
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = (req.query.q as string)?.trim();
        if (!q) {
            return res.status(400).json({ message: "Missing search query" });
        }
        // Search by title, shortDescription, or tags (case-insensitive)
        const products = await prisma.products.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { shortDescription: { contains: q, mode: 'insensitive' } },
                    { tags: { has: q } }
                ],
                isDeleted: { not: true },
            },
            include: { images: true },
            take: 10,
        });
        return res.status(200).json({ products });
    } catch (error) {
        next(error);
    }
}

//Get product details
export const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.products.findUnique({
            where: {
                slug: req.params.slug!,
            },
            include: {
                images: true,
                Shop: true
            }
        })

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return next(error);
    }
}

// Get filtered products
export const getFilteredProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit = 12,
        } = req.query;

        const parsedPriceRange = typeof priceRange === 'string' ? priceRange.split(',').map(Number) : [0, 10000]
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            salePrice: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1]
            },
            startingDate: null,
        }

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(',')
            }
        }

        if (colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors]
            }
        }

        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes]
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    Shop: true,
                },
            }),
            prisma.products.count({
                where: filters
            })
        ])

        const totalPages = Math.ceil(total / parsedLimit);

        res.json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            }
        })
    } catch (error) {
        next(error);
    }
}

//Get filtered Events
export const getFilteredEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit = 12,
        } = req.query;

        const parsedPriceRange = typeof priceRange === 'string' ? priceRange.split(',').map(Number) : [0, 10000]
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            salePrice: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1]
            },
            NOT: {
                startingDate: null,
            }

        }

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(',')
            }
        }

        if (colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors]
            }
        }

        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes]
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    Shop: true,
                },
            }),
            prisma.products.count({
                where: filters
            })
        ])

        const totalPages = Math.ceil(total / parsedLimit);

        res.json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            }
        })
    } catch (error) {
        next(error);
    }
}

//Get filtered shops
export const getFilteredShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {};

        if (categories && String(categories).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(',')
            }
        }

        if (countries && String(countries).length > 0) {
            filters.country = {
                in: Array.isArray(countries) ? countries : String(countries).split(',')
            }
        }

        const [shops, total] = await Promise.all([
            prisma.shops.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    sellers: true,
                    followers: true,
                    reviews: true,
                    products: true,
                },
            }),
            prisma.shops.count({
                where: filters
            })
        ]);

        const totalPages = Math.ceil(total / parsedLimit);

        res.json({
            shops,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            }
        });
    } catch (error) {
        next(error);
    }
};

// Top shops
export const topShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topShopsData = await prisma.orders.groupBy({
        by: ["shopId"],
        _sum: {
            total: true
        },
        orderBy: {
            _sum: {
                total: "desc"
            }
        },
        take: 10,
    })

    const shopIds = topShopsData.map((item) => item.shopId);

    const shops = await prisma.shops.findMany({
        where: {
            id: {
                in: shopIds
            }
        },
        select: {
            id: true,
            name: true,
            avatar: true,
            coverBanner: true,
            address: true,  
            ratings: true,
            followers: true,
            category: true,
        }
    })

    const enrichedShops = shops.map((shop) => {
        const salesData = topShopsData.find((data) => data.shopId === shop.id);
        return{
            ...shop,
            totalSales: salesData?._sum?.total ?? 0,
        }
    })

    const top10Shops = enrichedShops.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);

    return res.status(200).json({shops: top10Shops});


    } catch (error) {
        console.log("Error fetching top shops:", error);
        return next(error);
    }
    
}