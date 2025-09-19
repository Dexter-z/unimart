import { NextFunction, Request, Response } from "express";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { AuthError, NotFoundError, ValidationError,ForbiddenError } from "@packages/error-handler";
import { v4 as uuidv4 } from 'uuid';


export const deleteShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller?.id;
        const seller = await prisma.sellers.findUnique({
            where:{id :sellerId},
            include:{shop:true}
        });
        if(!seller || !seller.shop){
            return next(new NotFoundError("Seller or shop not found"));
        };

        const deletedAt = new Date();
        deletedAt.setDate(deletedAt.getDate() + 28);
        // soft delete both selleer and shop
        await prisma.$transaction([
            prisma.sellers.update({
                where: { id: sellerId },
                data: { deletedAt , isDeleted: true }
            }),
            prisma.shops.update({
                where: { id: seller.shop.id },
                data: { deletedAt , isDeleted: true }
            })
        ]);

        return res.status(200).json({
            message: "Shop and seller marked as deleted successfully and will be permanently deleted after 28 days.",
        });
    } catch (error) {
        return next(new Error("Internal Server Error"));
    }
}

export const restoreShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller?.id;
        const seller = await prisma.sellers.findUnique({
            where:{id :sellerId},
            include:{shop:true}
        });
        if(!seller || !seller.shop){
            return next(new NotFoundError("Seller or shop not found"));
        };
        if(!seller.deletedAt || !seller.isDeleted || !seller.shop.deletedAt || !seller.shop.isDeleted){
            return next(new ValidationError("Seller or shop is not marked as deleted"));
        }

        const currentDate = new Date();
        const deletedAt = new Date(seller.deletedAt);
        if (currentDate > deletedAt) {
            return next(new ForbiddenError("Cannot restore seller or shop. The 28 days of soft deletion have passed."));
        };

        // restore both seller and shop
        await prisma.$transaction([
            prisma.sellers.update({
                where: { id: sellerId },
                data: { deletedAt: null, isDeleted: false }
            }),
            prisma.shops.update({
                where: { id: seller.shop.id },
                data: { deletedAt: null, isDeleted: false }
            })
        ]);

        return res.status(200).json({
            message: "Shop and seller restored successfully.",
        });
        
    } catch (error) {
        return next(new Error("Internal Server Error"));
    }

}


export const editSellerProfile =async (req: any, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, openingHours, website, socialLinks} = req.body;
        if (!name || !bio || !address || !openingHours || !website || !socialLinks) {
            return next(new ValidationError("All fields are required"));
        }
        const sellerId = req.seller?.id;
        if (!sellerId) {
            return next(new AuthError("Unauthorized access"));
        }
        const existingShop = await prisma.shops.findUnique({
            where: { sellerId: sellerId },
        });
        if (!existingShop) {
            return next(new NotFoundError("Shop not found"));
        }

        const updatedShop = await prisma.shops.update({
            where: { sellerId: sellerId },
            data: {
                name,
                bio,
                address,
                openingHours,
                website,
                socialLinks
            },
            select: {
                id: true,
                name: true,
                bio: true,
                address: true,
                openingHours: true,
                website: true,
                socialLinks: true,
                updatedAt: true
            }
        });
        return res.status(200).json({
            success: true,
            message: "Shop profile updated successfully",
            updatedShop
        });
    } catch (error) {
        return next(error);
    }
}

export const getSellerInfo =async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop = await prisma.shops.findUnique({
            where: { id: req.params.id },
        });
        const followersCount = await prisma.shopFollowers.count({
            where: { shopId: shop?.id }
        });
        res.status(200).json({
            success: true,
            shop,
            followersCount
        });
    } catch (error) {
        return next(error);
    }
}

export const getSellerProducts =async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [products,total] = await Promise.all([
            prisma.products.findMany({
                where: { startingDate :null , shopId:req.query.id! },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: true,
                    Shop: true,
                }
            }),
            prisma.products.count({
                where: { startingDate :null , shopId:req.query.id! }
            })
        ]);
        res.status(200).json({
            success: true,
            products,
            pagination :{
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const getSellerEvents =async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: { startingDate: { not: null }, shopId: req.query.id! },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: true,
                    Shop: true,
                }
            }),
            prisma.products.count({
                where: { startingDate: { not: null }, shopId: req.query.id! }
            })
        ]);
        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const followShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const { shopId } = req.body;
        if (!shopId) {
            return next(new ValidationError("shopId is required"));
        }
        const existingFollow = await prisma.shopFollowers.findFirst({
            where: {
                userId: req.user?.id,
                shopId: shopId
            }    
        });
        if (existingFollow) {
            return res.status(200).json({
                success: true,
                message: "You are already following this shop",
            });
        }
        const follow = await prisma.shopFollowers.create({
            data: {
                userId: req.user?.id,
                shopId: shopId
            }
        });
        res.status(201).json({
            success: true,
            message: "Shop followed successfully",
            follow
        });
    } catch (error) {
        return next(error);
    }
};

export const unfollowShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const { shopId } = req.body;
        if (!shopId) {
            return next(new ValidationError("shopId is required"));
        }
        const existingFollow = await prisma.shopFollowers.findFirst({
            where: {
                userId: req.user?.id,
                shopId: shopId
            }    
        });
        if (!existingFollow) {
            return res.status(404).json({
                success: false,
                message: "You are not following this shop",
            });
        }
        await prisma.shopFollowers.delete({
            where: {
                id: existingFollow.id
            }
        });
        res.status(200).json({
            success: true,
            message: "Shop unfollowed successfully",
        });
    } catch (error) {
        return next(error);
    }
}

export const isFollowing =async (req: any, res: Response, next: NextFunction) => {
    try {
        const shopId = req.params.id;
        if (!shopId) {
            return next(new ValidationError("shopId is required"));
        }
        const isFollowing = await prisma.shopFollowers.findFirst({
            where: {
                userId: req.user?.id,
                shopId: shopId
            }
        });
        res.status(200).json({
            success: true,
            isFollowing
        });
    } catch (error) {
        return next(error);
    }
}


export const sellerNotifications =async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller?.id;
        const notifications = await prisma.notifications.findMany({
            where: {
                receiverId: sellerId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        return next(error);   
    }
}

export const markNotificationAsRead =async (req: any, res: Response, next: NextFunction) => {
    try {
        const {notificationId} = req.body;
        if (!notificationId) {
            return next(new ValidationError("Notification ID is required"));
        }
        const notification = await prisma.notifications.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        return next(error);
    }
}

const updateShopImage = async (req: any, res: Response, next: NextFunction, imageType: 'avatar' | 'coverBanner') => {
    try {
        const shopId = req.seller?.shop?.id;
        const file = req.file;

        if (!shopId) return next(new NotFoundError('Shop not found for this seller.'));
        if (!file) return next(new ValidationError('No file was uploaded.'));

        const shop = await prisma.shops.findUnique({
            where: { id: shopId },
            select: { [imageType]: true },
        });

        const oldImage = shop?.[imageType] as unknown as { fileId: string; url: string } | null;
        if (oldImage?.fileId) {
            try {
                await imagekit.deleteFile(oldImage.fileId);
            } catch (deleteError) {
                console.warn(`Could not delete old ${imageType} from imagekit:`, deleteError);
            }
        }

        const uniqueFileName = `${uuidv4()}_${file.originalname}`;
        const response = await imagekit.upload({
            file: file.buffer,
            fileName: uniqueFileName,
            folder: `/shops/${imageType}s`,
        });

        const updatedShop = await prisma.shops.update({
            where: { id: shopId },
            data: {
                [imageType]: {
                    url: response.url,
                    fileId: response.fileId,
                },
            },
        });

        res.status(200).json({
            success: true,
            message: `${imageType === 'avatar' ? 'Avatar' : 'Cover banner'} updated successfully.`,
            shop: updatedShop,
        });
    } catch (error) {
        next(error);
    }
};

export const updateShopAvatar = (req: any, res: Response, next: NextFunction) => {
    return updateShopImage(req, res, next, 'avatar');
};

export const updateShopCover = (req: any, res: Response, next: NextFunction) => {
    return updateShopImage(req, res, next, 'coverBanner');
};