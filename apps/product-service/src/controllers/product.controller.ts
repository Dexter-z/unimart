import { ValidationError, NotFoundError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import ImageKit from "imagekit";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst()

        if(!config){
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
        const {public_name, discountType, discountValue, discountCode} = req.body

        const isDiscountCodeExists = await prisma.discount_codes.findUnique({
            where: {
                discountCode
            }
        })

        if(isDiscountCodeExists){
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

//Delete Discount codes
export const deleteDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params
        const sellerId = req.seller?.id

        const discountCode = await prisma.discount_codes.findUnique({
            where: {id},
            select: {id: true, sellerId: true}
        })

        if(!discountCode) {
            return next(new NotFoundError("Discount Code not found"))
        }

        if(discountCode.sellerId !== sellerId) {
            return next(new ValidationError("You are not authorized to delete this discount code"))
        }

        await prisma.discount_codes.delete({where: {id}})

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
        const {fileName} = req.body
        console.log("I am here ", fileName)
        const response = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",
        })

        

        res.status(201).json({
            file_url: response.url,
            file_name: response.fileId,
        })
    } catch (error) {
        next(error)
        
    }
}