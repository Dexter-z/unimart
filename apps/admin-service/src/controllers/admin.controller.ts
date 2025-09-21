// --- Customization Controllers ---
import { imagekit } from "@packages/libs/imagekit";


import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    startingDate: null,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    salePrice: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: { take: 1, select: { url: true } },
                    Shop: { select: { name: true, id: true } },
                }
            }),
            prisma.products.count({
                where: {
                    startingDate: null,
                }
            })
        ])

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error)
    }
}

//Get All events
export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [events, totalEvents] = await Promise.all([
            prisma.products.findMany({
                where: {
                    startingDate: {
                        not: null
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    salePrice: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    startingDate: true,
                    endingDate: true,
                    images: { take: 1, select: { url: true } },
                    Shop: { select: { name: true, id: true } },
                }
            }),
            prisma.products.count({
                where: {
                    startingDate: {
                        not: null
                    },
                }
            })
        ])

        const totalPages = Math.ceil(totalEvents / limit);

        res.status(200).json({
            success: true,
            data: events,
            meta: {
                totalEvents,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error)
    }
}

//Get all admins
export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await prisma.users.findMany({
            where: {
                role: 'admin',
            }
        })

        res.status(201).json({
            success: true,
            data: admins
        })
    } catch (error) {
        next(error)
    }
}

export const addNewAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, role } = req.body;

        const isUser = await prisma.users.findUnique({where: {email}});

        if(!isUser){
            return next (new ValidationError("User not found"))
        }

        const updateRole = await prisma.users.update({
            where: {email},
            data: {role}
        })

        res.status(201).json({
            success: true,
            updateRole
        })
    } catch (error) {
        next(error)
    }
}

//Fetch all customizations 
export const getAllCustomizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();

        return res.status(200).json({
            categories: config?.categories || [],
            subCategories: config?.subCategories || {},
            logo: config?.logo || null,
            banner: config?.banner || null
        });
    } catch (error) {
        return next(error)
    }
}

//Get All sellers
export const getAllSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [sellers, totalSellers] = await Promise.all([
            prisma.sellers.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    createdAt: true,
                    shop: {
                        select: {
                            name: true,
                            avatar: true,
                            address: true,
                            id: true,
                        }
                    },
                }
            }),
            prisma.sellers.count()
        ]);

        const totalPages = Math.ceil(totalSellers / limit);

        return res.status(200).json({
            success: true,
            data: sellers,
            meta: {
                totalSellers,
                currentPage: page,
                totalPages
            }
        });
    } catch (error) {
        next(error)
    }
}

//Get All users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    role: true,
                    createdAt: true,
                }
            }),
            prisma.users.count()
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            success: true,
            data: users,
            meta: {
                totalUsers,
                currentPage: page,
                totalPages
            }
        });
    } catch (error) {
        next(error)
    }
}


// Get all categories and subcategories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();
        if (!config) {
            return res.status(404).json({ message: "Site config not found" });
        }
        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories,
        });
    } catch (error) {
        next(error);
    }
};

// Add a new category
export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.body;
        if (!category) return res.status(400).json({ message: "Category is required" });
        const config = await prisma.site_config.findFirst();
        if (!config) return res.status(404).json({ message: "Site config not found" });
        const updated = await prisma.site_config.update({
            where: { id: config.id },
            data: { categories: { push: category } },
        });
        return res.status(201).json({ categories: updated.categories });
    } catch (error) {
        next(error);
    }
};

// Add a subcategory to a category
export const addSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, subCategory } = req.body;
        if (!category || !subCategory) return res.status(400).json({ message: "Category and subCategory required" });
        const config = await prisma.site_config.findFirst();
        if (!config) return res.status(404).json({ message: "Site config not found" });
        let subCategories = (config.subCategories || {}) as Record<string, string[]>;
        if (!subCategories[category]) subCategories[category] = [];
        subCategories[category].push(subCategory);
        const updated = await prisma.site_config.update({
            where: { id: config.id },
            data: { subCategories },
        });
        return res.status(201).json({ subCategories: updated.subCategories });
    } catch (error) {
        next(error);
    }
};

// Delete a category and its subcategories
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.params;
        const config = await prisma.site_config.findFirst();
        if (!config) return res.status(404).json({ message: "Site config not found" });
        const categories = config.categories.filter((cat: string) => cat !== category);
        let subCategories = (config.subCategories || {}) as Record<string, string[]>;
        delete subCategories[category];
        const updated = await prisma.site_config.update({
            where: { id: config.id },
            data: { categories, subCategories },
        });
        return res.status(200).json({ categories: updated.categories, subCategories: updated.subCategories });
    } catch (error) {
        next(error);
    }
};

// Delete a subcategory
export const deleteSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, subCategory } = req.body;
        const config = await prisma.site_config.findFirst();
        if (!config) return res.status(404).json({ message: "Site config not found" });
        let subCategories = (config.subCategories || {}) as Record<string, string[]>;
        if (!subCategories[category]) return res.status(404).json({ message: "Category not found" });
        subCategories[category] = subCategories[category].filter((sub: string) => sub !== subCategory);
        const updated = await prisma.site_config.update({
            where: { id: config.id },
            data: { subCategories },
        });
        return res.status(200).json({ subCategories: updated.subCategories });
    } catch (error) {
        next(error);
    }
};

// Upload logo
export const uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        const matches = fileName.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const extension = mimeType.split("/")[1];
        const response = await imagekit.upload({
            file: fileName,
            fileName: `logo-${Date.now()}.${extension}`,
            folder: "/site-logo",
        });
        const config = await prisma.site_config.findFirst();
        await prisma.site_config.update({
            where: { id: config!.id },
            data: { logo: response.url },
        });
        res.status(201).json({ logo_url: response.url });
    } catch (error) {
        next(error);
    }
};

// Upload banner
export const uploadBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        const matches = fileName.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const extension = mimeType.split("/")[1];
        const response = await imagekit.upload({
            file: fileName,
            fileName: `banner-${Date.now()}.${extension}`,
            folder: "/site-banner",
        });
        const config = await prisma.site_config.findFirst();
        await prisma.site_config.update({
            where: { id: config!.id },
            data: { banner: response.url },
        });
        res.status(201).json({ banner_url: response.url });
    } catch (error) {
        next(error);
    }
};

export const getAllNotifications = async (req: any, res: Response, next: NextFunction) => {
    try {
        const notifications = await prisma.notifications.findMany({
            where: { receiverId : "admin" },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        return next(error);
    }
}

export const markAdminNotificationAsRead = async (req: any, res: Response, next: NextFunction) => {
    try {   
        const { notificationId } = req.body;
        
        if(!notificationId) {
            return next(new ValidationError("Notification id is required!"));
        }

        const notification = await prisma.notifications.update({
            where: {
                id: notificationId
            },
            data: {
                status: "Read"
            },
        });

        res.status(200).json({ success: true, notification });
    } catch (error) {
        next(error);
    }
};

export const markAdminNotificationAsUnread = async (req: any, res: Response, next: NextFunction) => {
    try {   
        const { notificationId } = req.body;
        
        if(!notificationId) {
            return next(new ValidationError("Notification id is required!"));
        }

        const notification = await prisma.notifications.update({
            where: {
                id: notificationId
            },
            data: {
                status: "Unread"
            },
        });

        res.status(200).json({ success: true, notification });
    } catch (error) {
        next(error);
    }
};

export const getAllUsersNotifications = async (req: any, res: Response, next: NextFunction) => {
    try {
        const notifications = await prisma.notifications.findMany({
            where: { receiverId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        return next(error);
    }
}