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
                    Shop: { select: { name: true } },
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